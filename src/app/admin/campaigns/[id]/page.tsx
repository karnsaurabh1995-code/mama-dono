'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, CampaignStatus } from '@/lib/types';
import { formatINR, formatDate, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  HeartHandshake,
  ArrowLeft,
  Edit3,
  ImageIcon,
  Radio,
  FileCheck2,
  BarChart3,
  Package,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Users,
  Layers,
  Sparkles,
  Copy,
  Archive,
  Trash2,
  Clock,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function CampaignOperationsHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    targetStatus: CampaignStatus | null;
    reason: string;
  }>({ open: false, targetStatus: null, reason: '' });

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(JSON.parse(JSON.stringify(found)));
    }
  }, [campaignId]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  if (!campaign) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E2E4E9] text-center space-y-3">
        <HeartHandshake className="w-8 h-8 text-neutral-400 mx-auto" />
        <h2 className="text-base font-bold text-neutral-800">Campaign Not Found</h2>
        <p className="text-xs text-neutral-500">
          The requested fundraiser ID "{campaignId}" could not be located.
        </p>
        <Link href="/admin/campaigns">
          <Button size="sm" variant="outline" className="text-xs">
            Back to Campaigns Center
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const netRaised = campaign.netRaisedAmount || Math.round(campaign.raisedAmount * 0.95);
  const pct = calculatePercentage(netRaised, campaign.goalAmount);
  const items = db.getCampaignItemNeeds(campaign.id);
  const updates = db.getCampaignUpdates(campaign.id, true);
  const publishedUpdatesCount = updates.filter((u) => u.status === 'published').length;
  const pendingUpdatesCount = updates.filter((u) => u.status === 'pending_review' || u.status === 'under_review').length;
  const documentsCount = (campaign.documents || []).length;
  const donations = db.getDonations({ campaignId: campaign.id, status: 'succeeded' });

  const handleApplyStatus = (status: CampaignStatus, reason?: string) => {
    try {
      const updated = db.setCampaignStatus(
        campaign.id,
        status,
        currentUser?.name || 'Administrator',
        reason
      );
      if (updated) {
        setCampaign(JSON.parse(JSON.stringify(updated)));
        notify(`Campaign status updated to "${status}".`);
      }
    } catch (err: unknown) {
      notify(`Status error: ${(err as Error).message}`);
    }
  };

  const handleSafeDelete = () => {
    if (!confirm(`Are you sure you want to permanently delete draft campaign "${campaign.title}"?`)) {
      return;
    }
    try {
      db.safeDeleteCampaign(campaign.id, currentUser?.name || 'Administrator');
      notify(`Draft campaign "${campaign.title}" deleted.`);
      router.push('/admin/campaigns');
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-6 pb-12">
      {/* ----------------- TOP BREADCRUMB ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns Center</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/campaigns/${campaign.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-50 transition"
          >
            <span>Live Public Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>
        </div>
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

      {/* ----------------- CAMPAIGN HEADER CARD ----------------- */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E4E9] shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Poster Thumbnail */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100 shadow-2xs relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={campaign.artwork?.mainPosterUrl || campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                {campaign.campaignType}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono">
                  {campaign.category}
                </span>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    campaign.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : campaign.status === 'paused'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : campaign.status === 'completed'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      campaign.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                    }`}
                  />
                  {campaign.status}
                </span>

                {campaign.verifiedStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Verified NGO Cause
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight leading-snug">
                {campaign.title}
              </h1>

              <p className="text-xs text-[#555B63] max-w-2xl line-clamp-2">
                {campaign.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-500">
                <span>Beneficiary: <strong className="text-neutral-800">{campaign.beneficiaryName}</strong></span>
                <span>•</span>
                <span>Manager: <strong className="text-neutral-800">{campaign.campaignManager || 'Devendra Sharma'}</strong></span>
                <span>•</span>
                <span>ID: <code className="bg-neutral-100 px-1.5 py-0.2 rounded font-mono text-[11px]">{campaign.id}</code></span>
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {campaign.status === 'active' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatusModal({ open: true, targetStatus: 'paused', reason: '' })}
                className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                <PauseCircle className="w-3.5 h-3.5 mr-1" />
                Pause Donations
              </Button>
            ) : campaign.status === 'paused' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplyStatus('active')}
                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <PlayCircle className="w-3.5 h-3.5 mr-1" />
                Resume Donations
              </Button>
            ) : null}

            {campaign.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplyStatus('completed')}
                className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Mark Completed
              </Button>
            )}

            <Link href={`/admin/campaigns/${campaign.id}/edit`}>
              <Button size="sm" className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white">
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* ----------------- FINANCIAL PROGRESS STRIP ----------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-neutral-100">
          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Net Raised</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-neutral-900">{formatINR(netRaised)}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">95% net after gateway escrow</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Target Goal</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-neutral-900">{formatINR(campaign.goalAmount)}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">{pct}% Funded</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Supporters</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-neutral-900">{donations.length || campaign.supporterCount}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">Verified donors</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Field Updates</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-neutral-900">{publishedUpdatesCount}</span>
              {pendingUpdatesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                  {pendingUpdatesCount} pending
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">{documentsCount} proof documents</span>
          </div>
        </div>
      </div>

      {/* ----------------- SUB-NAVIGATION OPERATIONS MATRIX ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Hub Item 1: Content Editor */}
        <Link
          href={`/admin/campaigns/${campaign.id}/edit`}
          className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-[#E2E4E9] shadow-xs hover:border-[#EF4949] transition group space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#EF4949] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#EF4949] transition-colors">
              Story &amp; Budget Editor
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Edit campaign story narrative, itemized budget breakdown, beneficiary details, and fundraising goal.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#EF4949] flex items-center gap-1 pt-1">
            Open Editor →
          </span>
        </Link>

        {/* Hub Item 2: Visual Media & Posters */}
        <Link
          href={`/admin/campaigns/${campaign.id}/media`}
          className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-[#E2E4E9] shadow-xs hover:border-[#EF4949] transition group space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
              Posters &amp; Visual Artwork
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Manage main campaign poster, hero banner, square thumbnail, social share artwork, and video embeds.
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 pt-1">
            Manage Media →
          </span>
        </Link>

        {/* Hub Item 3: Continuous Field Updates */}
        <Link
          href={`/admin/campaigns/${campaign.id}/updates`}
          className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-[#E2E4E9] shadow-xs hover:border-[#EF4949] transition group space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors">
                Field Reports &amp; Updates
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {publishedUpdatesCount} Live
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Publish milestone reports with ground photos, YouTube/Vimeo proof videos, and external cloud evidence links.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
            Manage Updates ({updates.length}) →
          </span>
        </Link>

        {/* Hub Item 4: Evidence & Verification Docs */}
        <Link
          href={`/admin/campaigns/${campaign.id}/evidence`}
          className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-[#E2E4E9] shadow-xs hover:border-[#EF4949] transition group space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-purple-600 transition-colors">
                Evidence &amp; Verification Vault
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                {documentsCount} Docs
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Attach medical estimates, hospital bills, NGO 12A/80G filings, and procurement receipts with public/private controls.
            </p>
          </div>
          <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1 pt-1">
            Evidence Vault →
          </span>
        </Link>

        {/* Hub Item 5: Performance Analytics */}
        <Link
          href={`/admin/campaigns/${campaign.id}/analytics`}
          className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-[#E2E4E9] shadow-xs hover:border-[#EF4949] transition group space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
              Performance Analytics
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Track daily donation velocity, donor retention, top supporters, Section 80G tax claims, and tip revenue.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 pt-1">
            View Analytics →
          </span>
        </Link>

        {/* Hub Item 6: Item Giving Requirements */}
        <Link
          href={`/admin/campaigns/${campaign.id}/items`}
          className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-[#E2E4E9] shadow-xs hover:border-[#EF4949] transition group space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-teal-700 transition-colors">
                Wholesale Item Giving
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                {items.length} Items
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Configure eligible item requirements (rations, blankets, medical kits), unit prices, and track delivery progress.
            </p>
          </div>
          <span className="text-[11px] font-bold text-teal-700 flex items-center gap-1 pt-1">
            Item Requirements →
          </span>
        </Link>
      </div>

      {/* ----------------- SAFE DELETION / ARCHIVE SECTION ----------------- */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-neutral-800">
          Campaign Lifecycle &amp; Deletion Safeguards
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl">
          To protect financial records and donor trust, campaigns with recorded donations or published updates cannot be physically deleted. You may pause donations, suspend, or archive this campaign. Physical deletion is strictly reserved for draft proposals with zero dependent records.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleApplyStatus('suspended', 'Administrative freeze')}
            className="text-xs text-neutral-700"
          >
            Suspend Campaign
          </Button>

          {isSuperAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSafeDelete}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Draft (Zero Records Only)
            </Button>
          )}
        </div>
      </div>

      {/* ----------------- STATUS MODAL WITH REASON ----------------- */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E2E4E9] shadow-xl">
            <h3 className="text-base font-black text-[#202124]">
              Confirm Status Change: {statusModal.targetStatus?.toUpperCase()}
            </h3>
            <p className="text-xs text-neutral-500">
              Please enter an operational reason for this status change. This will be recorded in the immutable audit log.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Field relief target achieved; emergency surgery completed..."
              value={statusModal.reason}
              onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl p-3 text-xs focus:outline-none focus:border-[#EF4949]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatusModal({ open: false, targetStatus: null, reason: '' })}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (statusModal.targetStatus) {
                    handleApplyStatus(statusModal.targetStatus, statusModal.reason);
                  }
                  setStatusModal({ open: false, targetStatus: null, reason: '' });
                }}
                className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white"
              >
                Confirm &amp; Log Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
