'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, CampaignStatus, CauseCategory } from '@/lib/types';
import { formatINR, formatDate, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  HeartHandshake,
  Search,
  Filter,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  Sliders,
  Sparkles,
  ExternalLink,
  Plus,
  Copy,
  Package,
  Clock,
  Inbox,
  ShieldCheck,
} from 'lucide-react';

export default function AdminCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(db.getCampaigns());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState('');

  // Pause / Suspend Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalAction, setModalAction] = useState<'pause' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesTitle = c.title.toLowerCase().includes(q);
      const matchesBeneficiary = c.beneficiaryName.toLowerCase().includes(q);
      const matchesOrg = (c.organizationName || '').toLowerCase().includes(q);
      if (!matchesTitle && !matchesBeneficiary && !matchesOrg) return false;
    }
    return true;
  });

  const isSuperAdmin = user?.role === 'super_admin';
  const isRestrictedRole = user?.role === 'content_writer' || user?.role === 'marketer' || user?.role === 'lead_generator';

  const handleToggleStatus = (campaign: Campaign, newStatus: CampaignStatus) => {
    if (isRestrictedRole) {
      notify(`Action blocked: Your role (${user?.role}) cannot alter campaign status. Please submit changes for review.`);
      return;
    }
    // Block non-super_admin from activating campaigns requiring Supreme Admin approval
    if (
      newStatus === 'active' &&
      (campaign.status === 'submitted' || campaign.requiresSuperAdminApproval) &&
      !isSuperAdmin
    ) {
      notify(`Action blocked: Campaign "${campaign.title}" was proposed by an employee and requires Supreme Admin verification and approval to go live.`);
      return;
    }
    const updated = db.updateCampaign(campaign.id, { status: newStatus }, user?.name || 'Admin');
    if (updated) {
      setCampaigns([...db.getCampaigns()]);
      notify(`Campaign "${campaign.title}" status changed to ${newStatus}.`);
    }
  };

  const handleToggleFeatured = (campaign: Campaign) => {
    if (isRestrictedRole) {
      notify(`Action blocked: Your role (${user?.role}) cannot alter promotional flags.`);
      return;
    }
    const updated = db.updateCampaign(campaign.id, { featured: !campaign.featured }, user?.name || 'Admin');
    if (updated) {
      setCampaigns([...db.getCampaigns()]);
      notify(`Campaign "${campaign.title}" featured toggle set to ${!campaign.featured}.`);
    }
  };

  const handleToggleUrgent = (campaign: Campaign) => {
    if (isRestrictedRole) {
      notify(`Action blocked: Your role (${user?.role}) cannot alter emergency flags.`);
      return;
    }
    const updated = db.updateCampaign(campaign.id, { urgent: !campaign.urgent }, user?.name || 'Admin');
    if (updated) {
      setCampaigns([...db.getCampaigns()]);
      notify(`Campaign "${campaign.title}" urgent emergency flag set to ${!campaign.urgent}.`);
    }
  };

  const handleDuplicate = (campaign: Campaign) => {
    try {
      const cloned = db.duplicateCampaignAsDraft(campaign.id, user?.name || 'Admin');
      setCampaigns([...db.getCampaigns()]);
      notify(`Campaign duplicated as clean draft: "${cloned.title}". Raised amounts reset to 0.`);
    } catch (err: any) {
      notify(`Failed to duplicate: ${err.message}`);
    }
  };

  const pendingSubmissionsCount = db.getRevisionSubmissions('pending_review').length;
  const pendingUpdatesCount = db.getCampaignUpdates(undefined, true).filter((u) => u.status === 'pending_review').length;

  const handleConfirmModalAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !modalAction) return;

    if (isRestrictedRole) {
      notify(`Action blocked: Your role (${user?.role}) is not authorized to pause or suspend campaigns.`);
      setSelectedCampaign(null);
      setModalAction(null);
      return;
    }

    const newStatus: CampaignStatus = modalAction === 'pause' ? 'paused' : 'suspended';
    db.updateCampaign(
      selectedCampaign.id,
      { status: newStatus },
      `${user?.name || 'Admin'} (Reason: ${actionReason || 'Administrative decision'})`
    );

    setCampaigns([...db.getCampaigns()]);
    notify(`Campaign "${selectedCampaign.title}" is now ${newStatus}. Reason recorded in audit log.`);
    setSelectedCampaign(null);
    setModalAction(null);
    setActionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <HeartHandshake className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Campaign Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Fundraisers Management & Control
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Pause, suspend, complete, or configure visual displays for all ongoing fundraisers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/campaigns/submissions">
            <Button size="sm" variant="outline" className="text-xs relative">
              <Inbox className="w-3.5 h-3.5 mr-1 text-[#E84B45]" />
              Staff Proposals
              {pendingSubmissionsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E84B45] text-white text-[10px] font-bold">
                  {pendingSubmissionsCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/admin/campaigns/updates">
            <Button size="sm" variant="outline" className="text-xs relative">
              <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Field Updates
              {pendingUpdatesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {pendingUpdatesCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/admin/campaigns/approvals">
            <Button size="sm" variant="outline" className="text-xs">
              Approvals ({campaigns.filter((c) => c.status === 'submitted' || c.status === 'under_review').length})
            </Button>
          </Link>
          <Link href="/admin/campaigns/new">
            <Button size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold">
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Campaign (Wizard)
            </Button>
          </Link>
        </div>
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

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, beneficiary, hospital, or NGO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-800"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Live)</option>
            <option value="paused">Paused</option>
            <option value="submitted">Awaiting Review</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-800"
          >
            <option value="all">All Causes</option>
            <option value="medical">Medical</option>
            <option value="education">Education</option>
            <option value="food-hunger">Food & Hunger</option>
            <option value="animals">Animals</option>
            <option value="essential-supplies">Product Relief</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Financial Progress</th>
                <th className="py-3 px-4">Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCampaigns.map((camp) => {
                const pct = calculatePercentage(camp.raisedAmount, camp.goalAmount);
                return (
                  <tr key={camp.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={camp.imageUrl}
                          alt={camp.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/campaigns/${camp.id}`}
                              className="font-bold text-[#202124] hover:text-[#E84B45] line-clamp-1 transition-colors"
                              title="Open Campaign Operations Hub"
                            >
                              <span>{camp.title}</span>
                            </Link>
                            <Link
                              href={`/campaigns/${camp.slug}`}
                              target="_blank"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3 h-3 text-neutral-400 hover:text-neutral-700 shrink-0" />
                            </Link>
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate">
                            Beneficiary: {camp.beneficiaryName} • {camp.organizerName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold">
                        {camp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center justify-between font-mono font-bold text-neutral-800">
                          <span>{formatINR(camp.raisedAmount)}</span>
                          <span className="text-[10px] text-neutral-400">Goal: {formatINR(camp.goalAmount)}</span>
                        </div>
                        <div className="w-36 bg-neutral-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#E84B45]' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-0.5 block">{camp.supporterCount} donors</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleFeatured(camp)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                            camp.featured ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-400'
                          }`}
                          title="Toggle Featured placement"
                        >
                          Featured
                        </button>
                        <button
                          onClick={() => handleToggleUrgent(camp)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                            camp.urgent ? 'bg-rose-100 text-rose-700' : 'bg-neutral-100 text-neutral-400'
                          }`}
                          title="Toggle Emergency 24h Alert"
                        >
                          Urgent
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {camp.fundraiserStage === 'lead_verification' ? (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                            Stage 1: Lead Verification
                          </span>
                          {camp.donorSubmission && (
                            <p className="text-[10px] text-neutral-500 font-medium">
                              Donor: {camp.donorSubmission.donorName}
                            </p>
                          )}
                        </div>
                      ) : camp.fundraiserStage === 'content_creation' ? (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                            Stage 2: Content Writing
                          </span>
                          {camp.leadGenVerification && (
                            <p className="text-[10px] text-neutral-500 font-medium">
                              Verified by {camp.leadGenVerification.verifiedBy}
                            </p>
                          )}
                        </div>
                      ) : (camp.status === 'submitted' || camp.requiresSuperAdminApproval || camp.fundraiserStage === 'supreme_admin_approval') ? (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#E84B45] border border-rose-200 inline-block">
                            Stage 3: Awaiting Supreme Admin
                          </span>
                          {camp.contentWriterSubmission ? (
                            <p className="text-[10px] text-neutral-500 font-medium">
                              Story by {camp.contentWriterSubmission.submittedBy}
                            </p>
                          ) : camp.proposedByEmployee ? (
                            <p className="text-[10px] text-neutral-500 font-medium">
                              By {camp.proposedByEmployee.name} ({camp.proposedByEmployee.role})
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            camp.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : camp.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : camp.status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : camp.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {camp.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {camp.fundraiserStage === 'lead_verification' && (user?.role === 'lead_generator' || isSuperAdmin) && (
                          <Link href="/admin/campaigns/approvals">
                            <button
                              className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 flex items-center gap-1 transition-colors"
                              title="Lead Generator: Verify Donor Lead"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                              Verify Lead
                            </button>
                          </Link>
                        )}

                        {camp.fundraiserStage === 'content_creation' && (user?.role === 'content_writer' || isSuperAdmin) && (
                          <Link href={`/admin/campaigns/${camp.id}/edit`}>
                            <button
                              className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 flex items-center gap-1 transition-colors"
                              title="Content Writer: Craft Campaign Story"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-600" />
                              Write Story
                            </button>
                          </Link>
                        )}

                        {(camp.status === 'submitted' || camp.requiresSuperAdminApproval || camp.fundraiserStage === 'supreme_admin_approval') && isSuperAdmin && (
                          <Link href="/admin/campaigns/approvals">
                            <button
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 flex items-center gap-1 transition-colors"
                              title="Supreme Admin: Review and verify campaign"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#E84B45]" />
                              Review Proposal
                            </button>
                          </Link>
                        )}

                        <Link href={`/admin/campaigns/${camp.id}`}>
                          <button
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800"
                            title="Open Operations Hub"
                          >
                            <Sliders className="w-4 h-4 text-neutral-700" />
                          </button>
                        </Link>

                        {camp.status === 'active' ? (
                          <button
                            onClick={() => {
                              setSelectedCampaign(camp);
                              setModalAction('pause');
                            }}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                            title="Pause Donations"
                          >
                            <PauseCircle className="w-4 h-4 text-amber-600" />
                          </button>
                        ) : camp.status === 'paused' ? (
                          <button
                            onClick={() => handleToggleStatus(camp, 'active')}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-emerald-600"
                            title="Resume Donations"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        ) : null}

                        {camp.status !== 'completed' && (
                          <button
                            onClick={() => handleToggleStatus(camp, 'completed')}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-blue-600 text-[10px] font-bold px-2"
                            title="Mark as 100% Completed"
                          >
                            Complete
                          </button>
                        )}

                        <Link href={`/admin/campaigns/${camp.id}/items`}>
                          <button
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                            title="Manage Item Requirements & Delivery Fulfillment"
                          >
                            <Package className="w-4 h-4 text-emerald-600" />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleDuplicate(camp)}
                          className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                          title="Duplicate Campaign as Draft (Zeroes out raised amount & donors)"
                        >
                          <Copy className="w-4 h-4 text-blue-600" />
                        </button>

                        <Link href={`/admin/campaigns/${camp.id}/edit`}>
                          <button
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                            title="Full Campaign Settings & Budget Editor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- PAUSE / SUSPEND REASON MODAL ----------------- */}
      {selectedCampaign && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleConfirmModalAction}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-[#202124] capitalize">
                {modalAction} Donations for &quot;{selectedCampaign.title}&quot;
              </h3>
            </div>

            <p className="text-xs text-neutral-600">
              When a campaign is {modalAction}ed, the public checkout form will immediately refuse new payment orders.
              Please record an administrative reason for the audit ledger:
            </p>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Reason & Donor Notice *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Undergoing secondary hospital billing verification or patient discharged early."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCampaign(null);
                  setModalAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className={modalAction === 'suspend' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}
              >
                Confirm {modalAction}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
