'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, FundraiserStage } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  X,
  Lock,
  Phone,
  Mail,
  PenTool,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CampaignApprovalsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(db.getCampaigns());
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'stage_1' | 'stage_2' | 'stage_3'>('all');
  const [toastMessage, setToastMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Stage action notes
  const [leadGenNotes, setLeadGenNotes] = useState('');
  const [writerNotes, setWriterNotes] = useState('');

  const isSuperAdmin = user?.role === 'super_admin';
  const canVerifyLead = !user || ['lead_generator', 'super_admin', 'admin', 'reviewer'].includes(user.role);
  const canWriteContent = !user || ['content_writer', 'super_admin', 'admin', 'content_editor'].includes(user.role);

  // Review checklist states
  const [checklist, setChecklist] = useState({
    hospitalEstimateVerified: false,
    doctorStampConfirmed: false,
    patientKYCApproved: false,
    itemizedBudgetSensible: false,
    beneficiaryEscrowSafe: false,
  });

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const pendingCampaigns = campaigns.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review'
  );

  // Resolve effective stage for display
  const resolveStage = (c: Campaign): FundraiserStage => {
    if (c.fundraiserStage) return c.fundraiserStage;
    if (c.donorSubmission) return 'lead_verification';
    if (c.proposedByEmployee) return 'supreme_admin_approval';
    return 'supreme_admin_approval';
  };

  const stage1Count = pendingCampaigns.filter((c) => resolveStage(c) === 'lead_verification').length;
  const stage2Count = pendingCampaigns.filter((c) => resolveStage(c) === 'content_creation').length;
  const stage3Count = pendingCampaigns.filter((c) => resolveStage(c) === 'supreme_admin_approval').length;

  const filteredCampaigns = pendingCampaigns.filter((c) => {
    const stage = resolveStage(c);
    if (activeTab === 'stage_1') return stage === 'lead_verification';
    if (activeTab === 'stage_2') return stage === 'content_creation';
    if (activeTab === 'stage_3') return stage === 'supreme_admin_approval';
    return true;
  });

  // Stage 1 Action: Lead Generator verifies and forwards to Content Writer
  const handleVerifyLead = (camp: Campaign) => {
    if (!canVerifyLead) {
      notify('Action restricted: Only Lead Generators and Platform Admins can verify Stage 1 fundraiser leads.');
      return;
    }
    const updated = db.updateCampaign(
      camp.id,
      {
        fundraiserStage: 'content_creation',
        status: 'under_review',
        leadGenVerification: {
          verifiedAt: new Date().toISOString(),
          verifiedBy: user?.name || 'Vikas Joshi (Lead Generator)',
          verifiedById: user?.id,
          notes: leadGenNotes.trim() || 'Lead contacts and clinical authenticity verified. Forwarded to Content Writer.',
          contactConfirmed: true,
          hospitalConfirmed: true,
        },
      },
      `${user?.name || 'Lead Generator'} (Verified Stage 1 Lead -> Forwarded to Content Writer)`
    );

    if (updated) {
      setCampaigns([...db.getCampaigns()]);
      setSelectedCampaign(updated);
      setLeadGenNotes('');
      notify(`Lead verified for "${camp.title}". Advanced to Stage 2: Content Writer!`);
    }
  };

  // Stage 2 Action: Content Writer crafts campaign story & submits to Supreme Admin
  const handleSubmitContent = (camp: Campaign) => {
    if (!canWriteContent) {
      notify('Action restricted: Only Content Writers and Platform Admins can submit Stage 2 campaign stories.');
      return;
    }
    const updated = db.updateCampaign(
      camp.id,
      {
        fundraiserStage: 'supreme_admin_approval',
        status: 'submitted',
        requiresSuperAdminApproval: true,
        contentWriterSubmission: {
          submittedAt: new Date().toISOString(),
          submittedBy: user?.name || 'Aisha Khan (Content Writer)',
          submittedById: user?.id,
          notes: writerNotes.trim() || 'Campaign story blocks, emotional hooks, and itemized budget breakdown prepared.',
          storyPolished: true,
          artworkAdded: true,
        },
      },
      `${user?.name || 'Content Writer'} (Prepared Campaign Story -> Submitted to Supreme Admin)`
    );

    if (updated) {
      setCampaigns([...db.getCampaigns()]);
      setSelectedCampaign(updated);
      setWriterNotes('');
      notify(`Campaign story submitted for "${camp.title}". Advanced to Stage 3: Supreme Admin Approval!`);
    }
  };

  // Stage 3 Action: Supreme Admin approves & publishes LIVE
  const handleApprove = (camp: Campaign) => {
    if ((camp.requiresSuperAdminApproval || camp.proposedByEmployee || camp.donorSubmission) && !isSuperAdmin) {
      notify('Approval blocked: Only the Supreme Admin has authority to approve and publish employee-created campaigns live.');
      return;
    }

    const updated = db.updateCampaign(
      camp.id,
      {
        status: 'active',
        verifiedStatus: 'verified',
        fundraiserStage: 'published',
        requiresSuperAdminApproval: false,
        superAdminApproval: {
          approvedAt: new Date().toISOString(),
          approvedBy: user?.name || 'Supreme Admin',
        },
      },
      `${user?.name || 'Supreme Admin'} (Supreme Admin Live Publication Sign-off)`
    );
    if (updated) {
      setCampaigns([...db.getCampaigns()]);
      setSelectedCampaign(null);
      notify(`Campaign "${camp.title}" verified and published LIVE on dokind!`);
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !rejectionReason.trim()) return;

    db.updateCampaign(
      selectedCampaign.id,
      { status: 'rejected', fundraiserStage: 'rejected' },
      `${user?.name || 'Reviewer'} (Reason: ${rejectionReason.trim()})`
    );

    setCampaigns([...db.getCampaigns()]);
    setShowRejectModal(false);
    setSelectedCampaign(null);
    setRejectionReason('');
    notify(`Fundraiser rejected. Feedback recorded for organizer.`);
  };

  const currentStage = selectedCampaign ? resolveStage(selectedCampaign) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-50 text-amber-700">
              <CheckSquare className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Review & Trust Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Campaign Verification & Multi-Stage Approval Queue
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Structured 3-Stage Pipeline: Donor Lead Verification ➔ Content Story Crafting ➔ Supreme Admin Live Sign-off.
          </p>
        </div>

        <Link href="/admin/campaigns">
          <Button variant="outline" size="sm" className="text-xs">
            Back to All Campaigns
          </Button>
        </Link>
      </div>

      {/* Toast notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Pipeline Stage Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
        {[
          { id: 'all' as const, label: 'All Pending Queues', count: pendingCampaigns.length },
          { id: 'stage_1' as const, label: 'Stage 1: Lead Verification (Lead Gen)', count: stage1Count, color: 'text-purple-700 bg-purple-50' },
          { id: 'stage_2' as const, label: 'Stage 2: Content Writing (Writer)', count: stage2Count, color: 'text-amber-700 bg-amber-50' },
          { id: 'stage_3' as const, label: 'Stage 3: Supreme Admin Review', count: stage3Count, color: 'text-rose-700 bg-rose-50' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#202124] text-white shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : tab.color || 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Review List */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E4E9] p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#202124]">Queue Caught Up!</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            There are currently no fundraisers awaiting action in this pipeline stage.
          </p>
          <Button size="sm" variant="outline" className="text-xs mt-2" onClick={() => setActiveTab('all')}>
            View All Queues
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pending Campaigns List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Awaiting Action ({filteredCampaigns.length})
            </h3>
            {filteredCampaigns.map((camp) => {
              const isSelected = selectedCampaign?.id === camp.id;
              const stage = resolveStage(camp);
              return (
                <div
                  key={camp.id}
                  onClick={() => {
                    setSelectedCampaign(camp);
                    setChecklist({
                      hospitalEstimateVerified: false,
                      doctorStampConfirmed: false,
                      patientKYCApproved: false,
                      itemizedBudgetSensible: false,
                      beneficiaryEscrowSafe: false,
                    });
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white shadow-2xs ${
                    isSelected ? 'border-[#E84B45] ring-2 ring-[#E84B45]/15' : 'border-[#E2E4E9] hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={camp.imageUrl}
                      alt={camp.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-200"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            stage === 'lead_verification'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : stage === 'content_creation'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {stage === 'lead_verification'
                            ? 'Stage 1: Lead Gen Review'
                            : stage === 'content_creation'
                            ? 'Stage 2: Content Writing'
                            : 'Stage 3: Supreme Admin Review'}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-800">{formatINR(camp.goalAmount)}</span>
                      </div>

                      <h4 className="text-xs font-bold text-[#202124] line-clamp-1">{camp.title}</h4>
                      <p className="text-[11px] text-neutral-500 truncate">
                        Beneficiary: {camp.beneficiaryName} ({camp.beneficiaryLocation})
                      </p>

                      {camp.donorSubmission && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 truncate">
                          <User className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">Donor Request: {camp.donorSubmission.donorName}</span>
                        </div>
                      )}

                      {camp.proposedByEmployee && !camp.donorSubmission && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 truncate">
                          <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">Staff Proposal: {camp.proposedByEmployee.name} ({camp.proposedByEmployee.role})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Verification Inspection Drawer (7 cols) */}
          <div className="lg:col-span-7">
            {selectedCampaign ? (
              <div className="bg-white rounded-2xl border border-[#E2E4E9] p-6 shadow-2xs space-y-5">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">
                      Target Goal: {formatINR(selectedCampaign.goalAmount)}
                    </span>
                    <h3 className="text-lg font-black text-[#202124] mt-1">{selectedCampaign.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{selectedCampaign.shortDescription}</p>
                  </div>
                  <span className="text-[10px] bg-neutral-100 text-neutral-700 font-bold uppercase px-2.5 py-1 rounded-full shrink-0">
                    {selectedCampaign.category}
                  </span>
                </div>

                {/* 3-Stage Pipeline Stepper Card */}
                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Donor Fundraiser Lifecycle Pipeline
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentStage === 'lead_verification'
                          ? 'bg-purple-100 text-purple-800'
                          : currentStage === 'content_creation'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {currentStage === 'lead_verification'
                        ? 'Active: Stage 1 (Lead Gen)'
                        : currentStage === 'content_creation'
                        ? 'Active: Stage 2 (Content Writer)'
                        : 'Active: Stage 3 (Supreme Admin)'}
                    </span>
                  </div>

                  {/* 3-Step Flow Pills */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {/* Stage 1 */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        currentStage === 'lead_verification'
                          ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold ring-1 ring-purple-300'
                          : selectedCampaign.leadGenVerification
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-neutral-200 text-neutral-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          selectedCampaign.leadGenVerification
                            ? 'bg-emerald-600 text-white'
                            : currentStage === 'lead_verification'
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {selectedCampaign.leadGenVerification ? '✓' : '1'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate">1. Lead Gen</p>
                        <p className="text-[9px] opacity-75 truncate">
                          {selectedCampaign.leadGenVerification ? 'Verified' : 'Verification'}
                        </p>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        currentStage === 'content_creation'
                          ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold ring-1 ring-amber-300'
                          : selectedCampaign.contentWriterSubmission
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-neutral-200 text-neutral-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          selectedCampaign.contentWriterSubmission
                            ? 'bg-emerald-600 text-white'
                            : currentStage === 'content_creation'
                            ? 'bg-amber-600 text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {selectedCampaign.contentWriterSubmission ? '✓' : '2'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate">2. Writer</p>
                        <p className="text-[9px] opacity-75 truncate">
                          {selectedCampaign.contentWriterSubmission ? 'Story Crafted' : 'Craft Campaign'}
                        </p>
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        currentStage === 'supreme_admin_approval'
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold ring-1 ring-rose-300'
                          : selectedCampaign.superAdminApproval
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-neutral-200 text-neutral-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          selectedCampaign.superAdminApproval
                            ? 'bg-emerald-600 text-white'
                            : currentStage === 'supreme_admin_approval'
                            ? 'bg-[#E84B45] text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {selectedCampaign.superAdminApproval ? '✓' : '3'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate">3. Supreme Admin</p>
                        <p className="text-[9px] opacity-75 truncate">
                          {selectedCampaign.superAdminApproval ? 'Live' : 'Sign-Off & Publish'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donor Request Details (if donor-initiated) */}
                {selectedCampaign.donorSubmission && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-700" />
                        <h4 className="text-xs font-bold uppercase tracking-wide text-blue-900">
                          Donor / Campaigner Contact Information
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-blue-700">
                        Submitted: {formatDate(selectedCampaign.donorSubmission.submittedAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/80 border border-blue-100">
                        <p className="text-[10px] text-neutral-400 font-medium">Donor Name</p>
                        <p className="font-bold text-neutral-900 truncate">{selectedCampaign.donorSubmission.donorName}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/80 border border-blue-100">
                        <p className="text-[10px] text-neutral-400 font-medium">Email</p>
                        <p className="font-bold text-neutral-900 truncate">{selectedCampaign.donorSubmission.donorEmail}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/80 border border-blue-100">
                        <p className="text-[10px] text-neutral-400 font-medium">Phone</p>
                        <p className="font-bold text-neutral-900 truncate">
                          {selectedCampaign.donorSubmission.donorPhone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {selectedCampaign.donorSubmission.initialStory && (
                      <p className="text-[11px] text-neutral-600 bg-white/60 p-2 rounded-lg border border-blue-100">
                        <strong className="text-neutral-700">Initial Request Note:</strong>{' '}
                        {selectedCampaign.donorSubmission.initialStory}
                      </p>
                    )}
                  </div>
                )}

                {/* STAGE 1 ACTION BOX: Lead Generator Verification */}
                {currentStage === 'lead_verification' && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-purple-100 text-purple-700">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wide text-purple-900">
                          Stage 1 Action: Lead Generator Authentication
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                        Lead Generator Required
                      </span>
                    </div>

                    <p className="text-xs text-purple-900 leading-relaxed">
                      Please authenticate the donor’s contact information, medical certificates, and patient eligibility before forwarding to the Content Writer.
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">
                        Lead Verification Field Notes & Instructions for Writer:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Spoke to hospital medical records officer and donor. Confirmed diagnosis. Patient needs surgery in 3 weeks."
                        value={leadGenNotes}
                        onChange={(e) => setLeadGenNotes(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      {canVerifyLead ? (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyLead(selectedCampaign)}
                          className="text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Verify Lead & Forward to Content Writer (Stage 2)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          className="text-xs bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300"
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          Stage 1: Lead Generator Sign-off Required
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* STAGE 2 ACTION BOX: Content Writer Story Crafting */}
                {currentStage === 'content_creation' && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
                          <PenTool className="w-4 h-4" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wide text-amber-900">
                          Stage 2 Action: Content Writer Campaign Crafting
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Content Writer Required
                      </span>
                    </div>

                    {selectedCampaign.leadGenVerification && (
                      <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-[11px] space-y-1">
                        <p className="font-semibold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Lead Verified by {selectedCampaign.leadGenVerification.verifiedBy} (
                          {formatDate(selectedCampaign.leadGenVerification.verifiedAt)}):
                        </p>
                        <p className="text-neutral-600 italic pl-4.5">
                          "{selectedCampaign.leadGenVerification.notes}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-amber-200">
                      <div>
                        <p className="text-xs font-bold text-neutral-800">Refine Campaign Narrative & Budget</p>
                        <p className="text-[11px] text-neutral-500">Edit headlines, structured story blocks, poster image, and cost items.</p>
                      </div>
                      <Link href={`/admin/campaigns/${selectedCampaign.id}/edit`} target="_blank">
                        <Button size="sm" variant="outline" className="text-xs font-semibold">
                          <PenTool className="w-3.5 h-3.5 mr-1 text-[#E84B45]" />
                          Open Story Builder
                        </Button>
                      </Link>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Editorial Submission Notes for Supreme Admin:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Polished patient story blocks, created emotional headline hook, verified itemized hospital breakdown."
                        value={writerNotes}
                        onChange={(e) => setWriterNotes(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      {canWriteContent ? (
                        <Button
                          size="sm"
                          onClick={() => handleSubmitContent(selectedCampaign)}
                          className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-bold"
                        >
                          <ArrowRight className="w-3.5 h-3.5 mr-1" />
                          Submit Campaign for Supreme Admin Approval (Stage 3)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          className="text-xs bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300"
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          Stage 2: Content Writer Sign-off Required
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* STAGE 3 ACTION BOX: Supreme Admin Sign-off & Live Publish */}
                {currentStage === 'supreme_admin_approval' && (
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-rose-100 text-[#E84B45]">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wide text-rose-950">
                          Stage 3: Supreme Admin Final Verification & Live Activation
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-950">
                        Supreme Admin Only
                      </span>
                    </div>

                    {/* Stage 1 & Stage 2 Sign-off Stamps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {selectedCampaign.leadGenVerification && (
                        <div className="p-2.5 rounded-xl bg-white border border-rose-100 space-y-1">
                          <p className="font-semibold text-neutral-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Stage 1: Verified by {selectedCampaign.leadGenVerification.verifiedBy}
                          </p>
                          <p className="text-neutral-500 italic text-[10px]">
                            "{selectedCampaign.leadGenVerification.notes}"
                          </p>
                        </div>
                      )}

                      {selectedCampaign.contentWriterSubmission && (
                        <div className="p-2.5 rounded-xl bg-white border border-rose-100 space-y-1">
                          <p className="font-semibold text-neutral-800 flex items-center gap-1">
                            <PenTool className="w-3.5 h-3.5 text-amber-600" />
                            Stage 2: Story by {selectedCampaign.contentWriterSubmission.submittedBy}
                          </p>
                          <p className="text-neutral-500 italic text-[10px]">
                            "{selectedCampaign.contentWriterSubmission.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {isSuperAdmin ? (
                      <p className="text-xs text-emerald-800 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        ✓ As <strong>Supreme Admin</strong>, you hold executive authority to grant final approval. Upon clicking below, this campaign will be instantly published LIVE on dokind and begin accepting donations.
                      </p>
                    ) : (
                      <p className="text-xs text-rose-800 font-medium flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-rose-200">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        Executive Lock: This campaign is awaiting final approval from the <strong>Supreme Admin</strong>.
                      </p>
                    )}
                  </div>
                )}

                {/* Patient & Beneficiary Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-[10px] font-bold uppercase text-neutral-400">Beneficiary Patient</p>
                    <p className="font-bold text-neutral-800 mt-0.5">{selectedCampaign.beneficiaryName}</p>
                    <p className="text-[11px] text-neutral-500">{selectedCampaign.beneficiaryLocation}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-[10px] font-bold uppercase text-neutral-400">Campaign Organizer</p>
                    <p className="font-bold text-neutral-800 mt-0.5">{selectedCampaign.organizerName}</p>
                    <p className="text-[11px] text-neutral-500 capitalize">{selectedCampaign.organizerRole}</p>
                  </div>
                </div>

                {/* Itemized Budget Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Itemized Cost Breakdown
                  </h4>
                  <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 text-xs">
                    {selectedCampaign.itemizedBudget.map((item) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">{item.item}</span>
                        <span className="font-mono font-bold text-neutral-900">{formatINR(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviewer Sign-off Checklist */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Reviewer Clinical Sign-off Checklist
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'hospitalEstimateVerified', label: 'Hospital treatment estimate letter verified on official letterhead' },
                      { key: 'doctorStampConfirmed', label: 'Consultant surgeon / medical officer registration number verified' },
                      { key: 'patientKYCApproved', label: 'Patient government photo ID proof (Aadhaar/PAN) cross-checked' },
                      { key: 'itemizedBudgetSensible', label: 'Itemized expenditure matches institutional hospital tariffs' },
                      { key: 'beneficiaryEscrowSafe', label: 'Disbursement routing confirmed directly to hospital escrow' },
                    ].map((chk) => (
                      <label key={chk.key} className="flex items-start gap-2.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={checklist[chk.key as keyof typeof checklist]}
                          onChange={(e) =>
                            setChecklist((prev) => ({ ...prev, [chk.key]: e.target.checked }))
                          }
                          className="mt-0.5 rounded text-[#E84B45] focus:ring-[#E84B45]"
                        />
                        <span className="text-neutral-700">{chk.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRejectModal(true)}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject Fundraiser
                  </Button>

                  {currentStage === 'supreme_admin_approval' ? (
                    isSuperAdmin ? (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(selectedCampaign)}
                        className="text-xs bg-[#25845B] hover:bg-[#1E6B49] text-white font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approve & Publish LIVE (Supreme Admin)
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="text-xs bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed font-medium"
                        title="Only the Supreme Admin can approve and publish campaigns live"
                      >
                        <Lock className="w-3.5 h-3.5 mr-1" />
                        Awaiting Supreme Admin Approval
                      </Button>
                    )
                  ) : currentStage === 'content_creation' ? (
                    canWriteContent ? (
                      <Button
                        size="sm"
                        onClick={() => handleSubmitContent(selectedCampaign)}
                        className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-bold"
                      >
                        <ArrowRight className="w-3.5 h-3.5 mr-1" />
                        Forward to Supreme Admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="text-xs bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed font-medium"
                      >
                        <Lock className="w-3.5 h-3.5 mr-1" />
                        Content Writer Action Needed
                      </Button>
                    )
                  ) : (
                    canVerifyLead ? (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyLead(selectedCampaign)}
                        className="text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Verify Lead & Forward to Writer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="text-xs bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed font-medium"
                      >
                        <Lock className="w-3.5 h-3.5 mr-1" />
                        Lead Generator Action Needed
                      </Button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E4E9] p-12 text-center text-neutral-400 text-xs">
                Select a pending fundraiser from the queue to inspect donor details, verify credentials, and advance through the pipeline.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Feedback Modal */}
      {showRejectModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleRejectSubmit}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-base text-[#202124]">Reject Fundraiser Application</h3>
            </div>

            <p className="text-xs text-neutral-600">
              Please provide clear feedback for the donor/organizer explaining why the fundraiser was not approved:
            </p>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={4}
                placeholder="e.g. Could not verify clinical estimate with the hospital, or contact number was unreachable."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                Submit Rejection
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
