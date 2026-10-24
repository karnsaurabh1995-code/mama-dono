'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { CauseCategory } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  FilePlus,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Send,
  Plus,
  Trash2,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';

const CATEGORIES: { id: CauseCategory; name: string }[] = [
  { id: 'medical', name: 'Medical & Healthcare' },
  { id: 'education', name: 'Child & Girl Education' },
  { id: 'food-hunger', name: 'Food & Hunger Relief' },
  { id: 'disability', name: 'Disability & Prosthetics' },
  { id: 'elderly', name: 'Elderly Care' },
  { id: 'animals', name: 'Animal Welfare & Shelters' },
  { id: 'disaster-relief', name: 'Disaster Emergency Relief' },
  { id: 'essential-supplies', name: 'Essential Goods & Clothes' },
];

export default function StaffNewCampaignDraftPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<CauseCategory>('essential-supplies');
  const [shortDescription, setShortDescription] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryLocation, setBeneficiaryLocation] = useState('');
  const [story, setStory] = useState('');
  const [posterUrl, setPosterUrl] = useState(
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80'
  );
  const [galleryUrl, setGalleryUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) {
      notify('Please enter a campaign title and narrative story.');
      return;
    }

    setIsSubmitting(true);

    try {
      db.createRevisionSubmission({
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        submittedBy: user?.id || 'user-head-staff-1',
        submittedByName: user?.name || 'Priyanka Sharma (Head Staff)',
        submissionNotes: submissionNotes.trim() || 'New campaign draft prepared on behalf of administrator.',
        proposedTitle: title.trim(),
        proposedShortDescription: shortDescription.trim(),
        proposedStory: story.trim(),
        proposedCategory: category,
        proposedBeneficiaryName: beneficiaryName.trim(),
        proposedBeneficiaryLocation: beneficiaryLocation.trim(),
        proposedArtwork: {
          mainPosterUrl: posterUrl.trim(),
          gallery: galleryUrl.trim() ? [galleryUrl.trim()] : [],
        },
      });

      notify('Campaign proposal submitted to Administrator Review Queue!');
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
              <FilePlus className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Staff Campaign Preparation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Prepare Campaign on Behalf of Administrator
          </h1>
        </div>
      </div>

      {/* RBAC Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Editorial Responsibility:</strong> You are preparing content for administrative review.
          Financial goals, bank settlement accounts, and live publication will be completed and validated
          by the Platform Administrator.
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Draft Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Suggested Campaign Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }
              }}
              placeholder="e.g. Flood Relief 2026: Provide 1,000 Dry Ration & Filter Kits in Barpeta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#E84B45] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Cause Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CauseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Suggested URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Beneficiary Name / Community *</label>
              <input
                type="text"
                required
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="e.g. 500 Flood-Displaced Families"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Field Location</label>
              <input
                type="text"
                value={beneficiaryLocation}
                onChange={(e) => setBeneficiaryLocation(e.target.value)}
                placeholder="e.g. Barpeta & Morigaon, Assam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Short Summary Excerpt</label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="1-2 sentences summarizing the emergency appeal."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Detailed Ground Narrative & Story *</label>
            <textarea
              required
              rows={6}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Detailed description of the beneficiaries, field conditions, verified emergency needs, and proposed intervention..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Campaign Poster Photo URL</label>
            <input
              type="text"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124]">Internal Submission Notes for Admin</label>
            <textarea
              rows={2}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Context regarding source of estimates, NGO contact, or urgency level..."
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
            {isSubmitting ? 'Submitting...' : 'Submit to Admin Review Queue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
