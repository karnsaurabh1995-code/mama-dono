'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Send,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';

export default function StaffSubmitCampaignUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [milestone, setMilestone] = useState('Field Distribution Completed');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) setCampaign(found);
  }, [campaignId]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  if (!campaign) {
    return (
      <div className="bg-white p-12 text-center text-xs text-neutral-400 rounded-2xl border border-neutral-200">
        Campaign not found.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      notify('Please enter both title and description.');
      return;
    }

    setIsSubmitting(true);

    try {
      db.createCampaignUpdate(
        {
          campaignId: campaign.id,
          title: title.trim(),
          content: content.trim(),
          authorName: user?.name || 'Priyanka Sharma (Field Lead)',
          authorRole: 'Head Staff (Field Lead)',
          authorId: user?.id || 'user-head-staff-1',
          milestoneAchieved: milestone.trim(),
          eventDate,
          mediaUrls: photoUrl.trim() ? [photoUrl.trim()] : [],
          publishedAt: '',
        },
        true // Head Staff submissions require admin review before publication
      );

      notify('Field update submitted! It will appear in the Admin moderation queue.');
      setTimeout(() => {
        router.push('/staff/campaigns');
      }, 1200);
    } catch (err: any) {
      notify(`Submission failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div className="flex items-center gap-3">
        <Link href="/staff/campaigns">
          <button className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 transition text-[#202124]">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Field Milestone Report
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Submit Field Update for {campaign.title}
          </h1>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Review Workflow:</strong> Submitted updates are queued for administrator review. Once verified,
          the update will be published to the public campaign page and notified to opt-in donors.
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#202124]">Milestone Badge / Progress Tag</label>
          <input
            type="text"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            placeholder="e.g. 500 Blankets Distributed / Induction Chemo Finished"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#202124]">Update Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. First Truck of Ration Kits Successfully Handed Over in Barpeta"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Field Photo Proof URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#202124]">Written Update Content *</label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe the distribution drive, patient status, or delivery confirmation..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          <Link href="/staff/campaigns">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#E84B45] hover:bg-[#BD302D] text-white font-bold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {isSubmitting ? 'Submitting...' : 'Submit Update for Admin Approval'}
          </Button>
        </div>
      </form>
    </div>
  );
}
