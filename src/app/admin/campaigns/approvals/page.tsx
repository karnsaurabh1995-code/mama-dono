'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign } from '@/lib/types';
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
} from 'lucide-react';

export default function CampaignApprovalsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(db.getCampaigns());
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

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
    setTimeout(() => setToastMessage(''), 3500);
  };

  const pendingCampaigns = campaigns.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review'
  );

  const handleApprove = (camp: Campaign) => {
    const updated = db.updateCampaign(
      camp.id,
      { status: 'active', verifiedStatus: 'verified' },
      user?.name || 'Medical Reviewer'
    );
    if (updated) {
      setCampaigns([...db.getCampaigns()]);
      setSelectedCampaign(null);
      notify(`Campaign "${camp.title}" verified and published LIVE.`);
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !rejectionReason.trim()) return;

    db.updateCampaign(
      selectedCampaign.id,
      { status: 'rejected' },
      `${user?.name || 'Reviewer'} (Reason: ${rejectionReason.trim()})`
    );

    setCampaigns([...db.getCampaigns()]);
    setShowRejectModal(false);
    setSelectedCampaign(null);
    setRejectionReason('');
    notify(`Fundraiser rejected. Feedback recorded for organizer.`);
  };

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
            Campaign Verification & Approval Queue
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Cross-examine medical estimates, doctor registration numbers, and patient KYC prior to publishing.
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

      {/* Main Review List */}
      {pendingCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E4E9] p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#202124]">All Caught Up!</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            There are currently no submitted fundraisers awaiting medical or NGO compliance review.
          </p>
          <Link href="/admin/campaigns">
            <Button size="sm" variant="outline" className="text-xs mt-2">
              Browse Active Campaigns
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pending Campaigns List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Awaiting Verification ({pendingCampaigns.length})
            </h3>
            {pendingCampaigns.map((camp) => {
              const isSelected = selectedCampaign?.id === camp.id;
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                          {camp.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-800">{formatINR(camp.goalAmount)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#202124] line-clamp-1 mt-1">{camp.title}</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                        Beneficiary: {camp.beneficiaryName} ({camp.beneficiaryLocation})
                      </p>
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
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">
                      Target Goal: {formatINR(selectedCampaign.goalAmount)}
                    </span>
                    <h3 className="text-lg font-black text-[#202124] mt-1">{selectedCampaign.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{selectedCampaign.shortDescription}</p>
                  </div>
                  <span className="text-[10px] bg-neutral-100 text-neutral-700 font-bold uppercase px-2.5 py-1 rounded-full">
                    {selectedCampaign.category}
                  </span>
                </div>

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

                {/* Compliance Verification Checklist */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Reviewer Sign-off Checklist
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

                {/* Actions */}
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

                  <Button
                    size="sm"
                    onClick={() => handleApprove(selectedCampaign)}
                    className="text-xs bg-[#25845B] hover:bg-[#1E6B49] text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve & Publish Live
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E4E9] p-12 text-center text-neutral-400 text-xs">
                Select a submitted campaign from the queue to inspect verification documents and sign off.
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
              Please provide clear, constructive feedback so the organizer can rectify deficiencies or re-apply:
            </p>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={4}
                placeholder="e.g. Hospital estimate certificate lacked the official hospital stamp, or patient registration number was unverified with the medical records department."
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
