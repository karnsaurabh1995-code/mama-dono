'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import {
  Campaign,
  CampaignUpdate,
  UpdateMilestoneType,
  UpdateCloudLink,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Radio,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Video,
  ImageIcon,
  Link2,
  Check,
  X,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  ShieldCheck,
  FileText,
  Send,
  Cloud,
} from 'lucide-react';

const MILESTONE_LABELS: Record<UpdateMilestoneType, string> = {
  progress_report: 'General Progress Report',
  fund_utilization: 'Fund Utilization & Hospital Invoice',
  beneficiary_update: 'Patient Recovery / Beneficiary Health',
  procurement_update: 'Wholesale Procurement Update',
  item_delivery: 'Ground Delivery & Kit Handover',
  milestone_achieved: 'Key Milestone Achieved',
  clarification: 'Organizer Clarification',
  final_impact: 'Final Impact & Closure Report',
};

export default function CampaignUpdatesManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  // Modal State for New / Edit Update
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [milestoneType, setMilestoneType] = useState<UpdateMilestoneType>('progress_report');
  const [milestoneAchieved, setMilestoneAchieved] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newPhotoInput, setNewPhotoInput] = useState('');

  // Cloud links
  const [cloudLinks, setCloudLinks] = useState<UpdateCloudLink[]>([]);
  const [newCloudLabel, setNewCloudLabel] = useState('');
  const [newCloudUrl, setNewCloudUrl] = useState('');
  const [newCloudProvider, setNewCloudProvider] = useState<'google_drive' | 'dropbox' | 'onedrive' | 'other'>('google_drive');
  const [newCloudDesc, setNewCloudDesc] = useState('');

  // Review Reject Modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; updateId: string; reason: string }>({
    open: false,
    updateId: '',
    reason: '',
  });

  const isSuperAdminOrReviewer =
    currentUser?.role === 'super_admin' || currentUser?.role === 'reviewer' || currentUser?.role === 'ops_admin';

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(found);
      setUpdates(db.getCampaignUpdates(found.id, true));
    }
  }, [campaignId]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  if (!campaign) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E2E4E9] text-center text-xs text-neutral-500">
        Campaign not found.
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingUpdateId(null);
    setTitle('');
    setContent('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setMilestoneType('progress_report');
    setMilestoneAchieved('');
    setVideoUrl('');
    setPhotoUrls([]);
    setCloudLinks([]);
    setModalOpen(true);
  };

  const openEditModal = (upd: CampaignUpdate) => {
    setEditingUpdateId(upd.id);
    setTitle(upd.title);
    setContent(upd.content);
    setEventDate(upd.eventDate || new Date().toISOString().split('T')[0]);
    setMilestoneType(upd.milestoneType || 'progress_report');
    setMilestoneAchieved(upd.milestoneAchieved || '');
    setVideoUrl(upd.videoUrl || '');
    setPhotoUrls(upd.mediaUrls || []);
    setCloudLinks(upd.cloudLinks || []);
    setModalOpen(true);
  };

  const handleAddPhoto = () => {
    if (!newPhotoInput.trim()) return;
    setPhotoUrls([...photoUrls, newPhotoInput.trim()]);
    setNewPhotoInput('');
  };

  const handleAddCloudLink = () => {
    if (!newCloudLabel.trim() || !newCloudUrl.trim()) return;
    const item: UpdateCloudLink = {
      id: `cl-${Date.now()}`,
      label: newCloudLabel.trim(),
      url: newCloudUrl.trim(),
      provider: newCloudProvider,
      description: newCloudDesc.trim(),
      isPublic: true,
    };
    setCloudLinks([...cloudLinks, item]);
    setNewCloudLabel('');
    setNewCloudUrl('');
    setNewCloudDesc('');
  };

  const handleSaveUpdate = (status: 'draft' | 'pending_review' | 'published') => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill out the update title and narrative content.');
      return;
    }

    try {
      if (editingUpdateId) {
        db.updateCampaignUpdate(
          editingUpdateId,
          {
            title: title.trim(),
            content: content.trim(),
            eventDate,
            milestoneType,
            milestoneAchieved: milestoneAchieved.trim() || undefined,
            videoUrl: videoUrl.trim() || undefined,
            mediaUrls: photoUrls,
            cloudLinks,
            status,
            publishedAt: status === 'published' ? new Date().toISOString() : '',
          },
          currentUser?.name || 'Administrator'
        );
        notify(`Field update "${title}" updated.`);
      } else {
        db.createCampaignUpdate(
          {
            campaignId: campaign.id,
            title: title.trim(),
            content: content.trim(),
            authorName: currentUser?.name || 'Field Coordinator',
            authorRole: currentUser?.jobTitle || currentUser?.role || 'Staff',
            authorId: currentUser?.id,
            eventDate,
            milestoneType,
            milestoneAchieved: milestoneAchieved.trim() || undefined,
            videoUrl: videoUrl.trim() || undefined,
            mediaUrls: photoUrls,
            cloudLinks,
            status,
            publishedAt: status === 'published' ? new Date().toISOString() : '',
          },
          status !== 'published'
        );
        notify(`Created campaign field update (${status}).`);
      }

      setUpdates(db.getCampaignUpdates(campaign.id, true));
      setModalOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleApprove = (updId: string) => {
    db.approveCampaignUpdate(updId, currentUser?.name || 'Reviewer');
    setUpdates(db.getCampaignUpdates(campaign.id, true));
    notify('Update approved and published live to public campaign page.');
  };

  const handleReject = () => {
    if (!rejectModal.updateId) return;
    db.rejectCampaignUpdate(rejectModal.updateId, currentUser?.name || 'Reviewer', rejectModal.reason);
    setUpdates(db.getCampaignUpdates(campaign.id, true));
    setRejectModal({ open: false, updateId: '', reason: '' });
    notify('Update rejected and feedback recorded.');
  };

  const handleDelete = (updId: string) => {
    if (!confirm('Are you sure you want to delete this field update?')) return;
    db.deleteCampaignUpdate(updId, currentUser?.name || 'Administrator');
    setUpdates(db.getCampaignUpdates(campaign.id, true));
    notify('Campaign update deleted.');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* ----------------- BREADCRUMB ----------------- */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaign Hub</span>
        </Link>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Create Field Update
        </Button>
      </div>

      {/* ----------------- TOAST FEEDBACK ----------------- */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
      )}

      {/* ----------------- HEADER CARD ----------------- */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
            <Radio className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Continuous Reporting &amp; Evidence
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
          Field Updates &amp; Milestone Reports
        </h1>
        <p className="text-xs text-[#555B63] max-w-2xl">
          Publish verified patient progress reports, wholesale kit dispatches, YouTube/Vimeo proof videos, and Google Drive document links to show donors tangible proof of impact.
        </p>
      </div>

      {/* ----------------- UPDATES LIST ----------------- */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E4E9] p-12 text-center space-y-3">
            <Radio className="w-8 h-8 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800">No field updates recorded yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Add your first progress report, fund disbursement summary, or patient recovery video.
            </p>
            <Button size="sm" onClick={openCreateModal} className="text-xs bg-[#EF4949] text-white">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create First Update
            </Button>
          </div>
        ) : (
          updates.map((upd) => (
            <div
              key={upd.id}
              className="bg-white rounded-3xl border border-[#E2E4E9] p-6 shadow-xs space-y-4 hover:border-neutral-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {upd.milestoneType ? MILESTONE_LABELS[upd.milestoneType] : upd.milestoneAchieved || 'Milestone Update'}
                  </span>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      upd.status === 'published'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : upd.status === 'pending_review' || upd.status === 'under_review'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {upd.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span>Event Date: {upd.eventDate || formatDate(upd.publishedAt || upd.createdAt || new Date().toISOString())}</span>
                  {upd.reviewedBy && <span>• Reviewed by: {upd.reviewedBy}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-[#202124]">{upd.title}</h3>
                <p className="text-xs text-[#555B63] leading-relaxed whitespace-pre-line">
                  {upd.content}
                </p>
              </div>

              {/* Photos attached */}
              {upd.mediaUrls && upd.mediaUrls.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-neutral-600 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Attached Ground Photos ({upd.mediaUrls.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {upd.mediaUrls.map((url, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Update evidence ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video URL */}
              {upd.videoUrl && (
                <div className="pt-1">
                  <a
                    href={upd.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition"
                  >
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>Watch Verified Video Proof</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                </div>
              )}

              {/* External Cloud Links */}
              {upd.cloudLinks && upd.cloudLinks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-neutral-600 flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5 text-blue-600" />
                    Supporting Cloud Evidence ({upd.cloudLinks.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {upd.cloudLinks.map((cl) => (
                      <a
                        key={cl.id}
                        href={cl.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] font-medium text-blue-900 hover:bg-blue-100 transition"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>{cl.label}</span>
                        {cl.provider && <span className="text-[9px] uppercase font-bold text-blue-600">({cl.provider})</span>}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                <div className="text-[11px] text-neutral-400">
                  Author: <strong className="text-neutral-700">{upd.authorName}</strong> ({upd.authorRole})
                </div>

                <div className="flex items-center gap-2">
                  {isSuperAdminOrReviewer && (upd.status === 'pending_review' || upd.status === 'under_review') && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(upd.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Approve &amp; Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectModal({ open: true, updateId: upd.id, reason: '' })}
                        className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(upd)}
                    className="text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>

                  <button
                    onClick={() => handleDelete(upd.id)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete update"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ----------------- MODAL: CREATE / EDIT UPDATE ----------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 border border-[#E2E4E9] shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#202124]">
                {editingUpdateId ? 'Edit Field Progress Update' : 'New Campaign Field Update'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Update Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cycle 2 Chemotherapy Successful; 400 Blankets Distributed in Delhi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Milestone Category *
                  </label>
                  <select
                    value={milestoneType}
                    onChange={(e) => setMilestoneType(e.target.value as UpdateMilestoneType)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  >
                    {Object.entries(MILESTONE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Written Narrative / Update Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed explanation of the ground activity, beneficiary status, or fund procurement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl p-3 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white leading-relaxed"
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-800">
                  Supporting Photographs ({photoUrls.length})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Enter image URL..."
                    value={newPhotoInput}
                    onChange={(e) => setNewPhotoInput(e.target.value)}
                    className="flex-1 bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddPhoto} className="text-xs">
                    Add Photo
                  </Button>
                </div>

                {photoUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {photoUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-lg text-[11px]">
                        <span className="truncate max-w-[150px]">{url}</span>
                        <button type="button" onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== idx))} className="text-rose-600 font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Proof */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Video Proof (YouTube / Vimeo URL)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              {/* Cloud Evidence Links */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-800">
                  Supporting Cloud Evidence Links (Google Drive, Dropbox, OneDrive)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Label (e.g. Hospital Discharge Bill)"
                    value={newCloudLabel}
                    onChange={(e) => setNewCloudLabel(e.target.value)}
                    className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="url"
                    placeholder="Cloud Link URL"
                    value={newCloudUrl}
                    onChange={(e) => setNewCloudUrl(e.target.value)}
                    className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newCloudProvider}
                      onChange={(e) => setNewCloudProvider(e.target.value as any)}
                      className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-2 py-2 text-xs flex-1"
                    >
                      <option value="google_drive">Google Drive</option>
                      <option value="dropbox">Dropbox</option>
                      <option value="onedrive">OneDrive</option>
                      <option value="other">Other Cloud</option>
                    </select>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddCloudLink} className="text-xs">
                      Attach
                    </Button>
                  </div>
                </div>

                {cloudLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {cloudLinks.map((cl) => (
                      <div key={cl.id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-[11px] text-blue-900">
                        <span>{cl.label}</span>
                        <button type="button" onClick={() => setCloudLinks(cloudLinks.filter((c) => c.id !== cl.id))} className="text-rose-600 font-bold ml-1">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveUpdate('draft')}
                  className="text-xs text-neutral-700"
                >
                  Save as Draft
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSaveUpdate(isSuperAdminOrReviewer ? 'published' : 'pending_review')}
                  className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {isSuperAdminOrReviewer ? 'Publish Directly' : 'Submit for Review'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: REJECT REASON ----------------- */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E2E4E9] shadow-xl">
            <h3 className="text-base font-black text-[#202124]">
              Reject Campaign Update
            </h3>
            <p className="text-xs text-neutral-500">
              Please state why this field update was rejected so the campaign manager can rectify it.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Hospital invoice date is missing; video link is private..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl p-3 text-xs focus:outline-none focus:border-[#EF4949]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectModal({ open: false, updateId: '', reason: '' })}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
