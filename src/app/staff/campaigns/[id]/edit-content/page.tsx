'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Edit,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Send,
  Image as ImageIcon,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export default function StaffEditCampaignContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [proposedTitle, setProposedTitle] = useState('');
  const [proposedStory, setProposedStory] = useState('');
  const [proposedExcerpt, setProposedExcerpt] = useState('');
  const [proposedPoster, setProposedPoster] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(found);
      setProposedTitle(found.title);
      setProposedStory(found.story);
      setProposedExcerpt(found.shortDescription);
      setProposedPoster(found.imageUrl);
    }
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
    setIsSubmitting(true);

    try {
      db.createRevisionSubmission({
        campaignId: campaign.id,
        title: `Revision for ${campaign.title}`,
        slug: campaign.slug,
        submittedBy: user?.id || 'user-head-staff-1',
        submittedByName: user?.name || 'Priyanka Sharma (Head Staff)',
        submissionNotes: submissionNotes.trim() || 'Updated field story and poster image.',
        proposedTitle: proposedTitle.trim(),
        proposedShortDescription: proposedExcerpt.trim(),
        proposedStory: proposedStory.trim(),
        proposedArtwork: {
          mainPosterUrl: proposedPoster.trim(),
          gallery: campaign.galleryUrls || [],
        },
      });

      notify('Revision proposal successfully sent to Administrator Review Queue!');
      setTimeout(() => {
        router.push('/staff/campaigns');
      }, 1200);
    } catch (err: any) {
      notify(`Submission failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/staff/campaigns">
          <button className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 transition text-[#202124]">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Edit className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Staff Content Revision
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Propose Story & Media Changes for {campaign.title}
          </h1>
        </div>
      </div>

      {/* RBAC Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Non-Breaking Approval Gate:</strong> Proposed text and photography modifications will NOT
          alter the live website immediately. The Administrator will review your submission via side-by-side diff.
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Proposed Campaign Title</label>
            <input
              type="text"
              required
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Proposed Short Excerpt</label>
            <textarea
              rows={2}
              value={proposedExcerpt}
              onChange={(e) => setProposedExcerpt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Proposed Main Poster URL</label>
            <input
              type="text"
              value={proposedPoster}
              onChange={(e) => setProposedPoster(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Proposed Narrative Story</label>
            <textarea
              required
              rows={8}
              value={proposedStory}
              onChange={(e) => setProposedStory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Internal Notes for Reviewing Administrator</label>
            <textarea
              rows={2}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Explain why these copy changes or poster replacements are being recommended..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
            />
          </div>
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
            {isSubmitting ? 'Submitting...' : 'Submit Proposed Changes to Admin'}
          </Button>
        </div>
      </form>
    </div>
  );
}
