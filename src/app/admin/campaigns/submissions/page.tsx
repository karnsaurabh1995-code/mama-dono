'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { CampaignRevisionSubmission, Campaign } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Inbox,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Check,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Split,
  FileText,
  Clock,
  Layers,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export default function AdminSubmissionsReviewPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CampaignRevisionSubmission[]>(
    db.getRevisionSubmissions()
  );
  const [selectedSub, setSelectedSub] = useState<CampaignRevisionSubmission | null>(
    submissions.find((s) => s.status === 'pending_review') || submissions[0] || null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Request changes modal state
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const filtered = submissions.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const existingCampaign: Campaign | undefined = selectedSub?.campaignId
    ? db.getCampaignById(selectedSub.campaignId)
    : undefined;

  const isSuperAdmin = user?.role === 'super_admin';
  const canReview = !user || ['super_admin', 'admin', 'support_admin', 'head_staff', 'reviewer', 'ops_admin'].includes(user.role);

  const handleApproveImmediate = (subId: string) => {
    if (!canReview) {
      notify('Access restricted: Only authorized Admin or Reviewer roles can approve submissions.');
      return;
    }
    const subToApprove = submissions.find((s) => s.id === subId);
    if (subToApprove?.requiresSuperAdminApproval && !isSuperAdmin) {
      notify('Approval blocked: Only the Supreme Admin can approve employee campaign proposals.');
      return;
    }
    const approved = db.approveRevisionSubmission(subId, user?.name || 'Administrator');
    if (approved) {
      setSubmissions([...db.getRevisionSubmissions()]);
      setSelectedSub(approved);
      notify(`Submission approved! Changes are now published live to the campaign.`);
    }
  };

  const handleApproveScheduled = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReview) {
      notify('Access restricted: Only authorized Admin or Reviewer roles can schedule publication.');
      return;
    }
    if (selectedSub?.requiresSuperAdminApproval && !isSuperAdmin) {
      notify('Approval blocked: Only the Supreme Admin can approve employee campaign proposals.');
      return;
    }
    if (!selectedSub || !scheduleDate) return;
    const approved = db.approveRevisionSubmission(
      selectedSub.id,
      user?.name || 'Administrator',
      `Scheduled publication for ${scheduleDate}`,
      scheduleDate
    );
    if (approved) {
      setSubmissions([...db.getRevisionSubmissions()]);
      setSelectedSub(approved);
      setShowScheduleModal(false);
      notify(`Submission approved and scheduled for release on ${scheduleDate}.`);
    }
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReview) {
      notify('Access restricted: Only authorized Admin or Reviewer roles can reject submissions.');
      return;
    }
    if (!selectedSub || !rejectionReason.trim()) return;
    const rejected = db.rejectRevisionSubmission(
      selectedSub.id,
      user?.name || 'Administrator',
      rejectionReason.trim()
    );
    if (rejected) {
      setSubmissions([...db.getRevisionSubmissions()]);
      setSelectedSub(rejected);
      setShowRejectModal(false);
      setRejectionReason('');
      notify(`Submission rejected. Public campaign remains unaltered.`);
    }
  };

  const handleRequestChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReview) {
      notify('Access restricted: Only authorized Admin or Reviewer roles can request edits.');
      return;
    }
    if (!selectedSub || !changesNotes.trim()) return;
    const req = db.requestChangesRevisionSubmission(
      selectedSub.id,
      user?.name || 'Administrator',
      changesNotes.trim()
    );
    if (req) {
      setSubmissions([...db.getRevisionSubmissions()]);
      setSelectedSub(req);
      setShowChangesModal(false);
      setChangesNotes('');
      notify(`Revision returned to Head Staff with requested modifications.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/campaigns">
            <button className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition text-[#202124]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
                <Inbox className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Editorial Review Queue
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
              Head Staff Campaign Proposals & Diffs
            </h1>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
          {['all', 'pending_review', 'approved', 'rejected', 'changes_requested'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                filterStatus === st ? 'bg-white text-[#202124] shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 2-Column Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Submissions List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Proposals Inbox ({filtered.length})
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">No submissions matching filter.</div>
            ) : (
              <div className="space-y-2">
                {filtered.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`w-full text-left p-3.5 rounded-xl border transition duration-150 space-y-2 ${
                        isSelected
                          ? 'border-[#E84B45] bg-[#E84B45]/5 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-[#202124] line-clamp-1">
                          {sub.proposedTitle || sub.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            sub.status === 'pending_review'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-500">
                        Submitted by <strong className="text-neutral-700">{sub.submittedByName}</strong>
                      </div>

                      <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatDate(sub.submittedAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Main Panel: Side-by-Side Diff Comparison */}
        <div className="lg:col-span-8 space-y-5">
          {selectedSub ? (
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-6">
              {/* Proposal Header & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                      ID: {selectedSub.id}
                    </span>
                    {selectedSub.campaignId ? (
                      <span className="text-[10px] font-mono text-neutral-500">
                        Target Campaign: {selectedSub.campaignId}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        New Campaign Draft Proposal
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-[#202124] mt-1">
                    {selectedSub.proposedTitle || selectedSub.title}
                  </h2>
                  {selectedSub.submissionNotes && (
                    <div className="p-3 mt-2 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Staff Notes:</strong> {selectedSub.submissionNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderation Controls */}
                {selectedSub.status === 'pending_review' && (
                  selectedSub.requiresSuperAdminApproval && !isSuperAdmin ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Supreme Admin Approval: Only the Supreme Admin can approve employee campaign proposals.
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowChangesModal(true)}
                        className="text-amber-700 hover:bg-amber-50 text-xs"
                      >
                        Request Edits
                      </Button>
                    </div>
                  ) : canReview ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveImmediate(selectedSub.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {isSuperAdmin ? 'Approve & Publish Now (Supreme Admin)' : 'Approve & Publish Now'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowScheduleModal(true)}
                        className="text-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowChangesModal(true)}
                        className="text-amber-700 hover:bg-amber-50 text-xs"
                      >
                        Request Edits
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRejectModal(true)}
                        className="text-rose-600 hover:bg-rose-50 text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                      Pending review by Admin / Head Staff. Content Writers cannot self-approve submissions.
                    </div>
                  )
                )}
              </div>

              {/* Side-by-Side Comparison Container */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#202124]">
                  <Split className="w-4 h-4 text-[#E84B45]" />
                  <span>Side-by-Side Diff Inspection</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Currently Published Live */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                      <span className="text-xs font-bold text-neutral-500 uppercase">
                        Current Published Version
                      </span>
                      {existingCampaign && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Live On Site
                        </span>
                      )}
                    </div>

                    {existingCampaign ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">Title</label>
                          <div className="font-bold text-[#202124]">{existingCampaign.title}</div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">Main Poster</label>
                          <div className="aspect-16/9 rounded-lg overflow-hidden border border-neutral-200 mt-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={existingCampaign.imageUrl}
                              alt="Current live poster"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">Short Excerpt</label>
                          <p className="text-neutral-600">{existingCampaign.shortDescription}</p>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">Written Story</label>
                          <div className="text-neutral-600 max-h-48 overflow-y-auto whitespace-pre-line bg-white p-2.5 rounded-lg border border-neutral-200 text-[11px] leading-relaxed">
                            {existingCampaign.story}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-xs text-neutral-400">
                        This is a brand new campaign proposal with no existing live version.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Proposed Staff Changes */}
                  <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/20 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                      <span className="text-xs font-bold text-emerald-800 uppercase">
                        Proposed Revision (Staff Draft)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Pending Admin Approval
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Proposed Title</label>
                        <div className="font-bold text-[#202124] bg-emerald-100/60 p-1.5 rounded">
                          {selectedSub.proposedTitle || selectedSub.title}
                        </div>
                      </div>

                      {selectedSub.proposedArtwork?.mainPosterUrl && (
                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">
                            Proposed New Poster
                          </label>
                          <div className="aspect-16/9 rounded-lg overflow-hidden border-2 border-emerald-400 mt-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedSub.proposedArtwork.mainPosterUrl}
                              alt="Proposed poster"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {selectedSub.proposedShortDescription && (
                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">Proposed Excerpt</label>
                          <p className="text-neutral-700 bg-emerald-100/60 p-1.5 rounded">
                            {selectedSub.proposedShortDescription}
                          </p>
                        </div>
                      )}

                      {selectedSub.proposedStory && (
                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase">
                            Proposed Story Narrative
                          </label>
                          <div className="text-neutral-800 max-h-48 overflow-y-auto whitespace-pre-line bg-white p-2.5 rounded-lg border border-emerald-200 text-[11px] leading-relaxed">
                            {selectedSub.proposedStory}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center text-xs text-neutral-400 rounded-2xl border border-neutral-200">
              Select a submission from the left queue to review diffs.
            </div>
          )}
        </div>
      </div>

      {/* ---------------- REJECT MODAL ---------------- */}
      {showRejectModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleReject}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-[#202124]">Reject Content Submission</h3>
            </div>
            <p className="text-xs text-[#555B63]">
              The public campaign will remain completely unaltered. Please provide clear feedback so the Head Staff
              can understand the rejection.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Rejection Reason *</label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unverified claims regarding third-party supplier quotes. Please cite official invoices."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- REQUEST CHANGES MODAL ---------------- */}
      {showChangesModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleRequestChanges}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-[#202124]">Request Edits from Head Staff</h3>
            </div>
            <p className="text-xs text-[#555B63]">
              Send revision notes back to the submitter. They will be able to refine their draft in their workspace.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Requested Modifications *</label>
              <textarea
                required
                rows={3}
                value={changesNotes}
                onChange={(e) => setChangesNotes(e.target.value)}
                placeholder="e.g. Please crop the banner image to 16:9 safe ratio and add beneficiary quotes."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowChangesModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                Send Change Request
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- SCHEDULE MODAL ---------------- */}
      {showScheduleModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleApproveScheduled}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Calendar className="w-5 h-5 text-[#E84B45]" />
              <h3 className="text-base font-bold text-[#202124]">Approve with Scheduled Release</h3>
            </div>
            <p className="text-xs text-[#555B63]">
              Approve this revision but delay publication until the scheduled calendar date.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Scheduled Release Date *</label>
              <input
                type="date"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white font-bold">
                Confirm & Schedule
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
