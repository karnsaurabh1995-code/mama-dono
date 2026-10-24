'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { CampaignUpdate } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  Calendar,
  Layers,
  Image as ImageIcon,
  Check,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function AdminCampaignUpdatesPage() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<CampaignUpdate[]>(db.getCampaignUpdates(undefined, true));
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Create new update modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [targetCampaignId, setTargetCampaignId] = useState<string>('camp-assam-flood-relief');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [milestone, setMilestone] = useState<string>('Field Progress');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const campaigns = db.getCampaigns();

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const filtered = updates.filter((u) => {
    if (filterCampaign !== 'all' && u.campaignId !== filterCampaign) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    const approved = db.approveCampaignUpdate(id, user?.name || 'Administrator');
    if (approved) {
      setUpdates([...db.getCampaignUpdates(undefined, true)]);
      notify(`Update "${approved.title}" approved and published to campaign!`);
    }
  };

  const handleReject = (id: string) => {
    const rejected = db.rejectCampaignUpdate(id, user?.name || 'Administrator', 'Content rejected by reviewer');
    if (rejected) {
      setUpdates([...db.getCampaignUpdates(undefined, true)]);
      notify(`Update "${rejected.title}" rejected.`);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    db.createCampaignUpdate(
      {
        campaignId: targetCampaignId,
        title: title.trim(),
        content: content.trim(),
        authorName: user?.name || 'Administrator',
        authorRole: 'Platform Administrator',
        authorId: user?.id || 'admin',
        milestoneAchieved: milestone,
        eventDate,
        mediaUrls: photoUrl ? [photoUrl] : [],
        publishedAt: new Date().toISOString(),
      },
      false // Admins publish directly without review
    );

    setUpdates([...db.getCampaignUpdates(undefined, true)]);
    setShowCreateModal(false);
    setTitle('');
    setContent('');
    setPhotoUrl('');
    notify('Official campaign update published immediately!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/campaigns">
            <button className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition text-[#202124]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Campaign Progress & Field Updates
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
              Field Reports, Milestones & Donor Notifications
            </h1>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Publish New Update
        </Button>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Published Live</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Showing {filtered.length} update records
        </div>
      </div>

      {/* Updates Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center text-xs text-neutral-400 rounded-2xl border border-neutral-200">
            No updates found.
          </div>
        ) : (
          filtered.map((upd) => {
            const camp = campaigns.find((c) => c.id === upd.campaignId);
            return (
              <div
                key={upd.id}
                className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {upd.milestoneAchieved || 'Field Update'}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        {camp ? camp.title : upd.campaignId}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#202124] mt-1">{upd.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        upd.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : upd.status === 'pending_review'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {upd.status?.replace('_', ' ')}
                    </span>

                    {upd.status === 'pending_review' && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(upd.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve & Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(upd.id)}
                          className="text-rose-600 hover:bg-rose-50 text-xs px-2.5 py-1"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {upd.mediaUrls && upd.mediaUrls.length > 0 && (
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={upd.mediaUrls[0]} alt="Update proof" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-[#555B63] leading-relaxed whitespace-pre-line">{upd.content}</p>

                    <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-2 border-t border-neutral-100 font-mono">
                      <span>Reported by: {upd.authorName} ({upd.authorRole})</span>
                      {upd.eventDate && <span>Event Date: {upd.eventDate}</span>}
                      {upd.publishedAt && <span>Published: {formatDate(upd.publishedAt)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---------------- CREATE UPDATE MODAL ---------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-[#202124]">Publish Field Milestone Update</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Target Campaign *</label>
              <select
                value={targetCampaignId}
                onChange={(e) => setTargetCampaignId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Milestone Badge / Progress Tag</label>
              <input
                type="text"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                placeholder="e.g. 500 Kits Dispatched / Surgery Complete"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Update Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. First Truck of Blankets Handed Over to District Magistrate"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Detailed Written Description *</label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Explain the tangible impact, beneficiary quotes, and procurement details..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Photo Proof URL (Optional)</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white font-bold">
                Publish Update Now
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
