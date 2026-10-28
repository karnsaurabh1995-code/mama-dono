'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, CampaignStatus, CauseCategory } from '@/lib/types';
import { formatINR, formatDate, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  HeartHandshake,
  ArrowLeft,
  Edit3,
  ImageIcon,
  Radio,
  FileCheck2,
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
  Trash2,
  Clock,
  Building2,
  DollarSign,
  TrendingUp,
  LayoutDashboard,
  LayoutList,
  History,
  FileSpreadsheet,
  Tag,
  Search,
  Check,
  Save,
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
  const [activeTab, setActiveTab] = useState<'summary' | 'donations' | 'finance' | 'placement' | 'activity'>('summary');
  const [toastMessage, setToastMessage] = useState('');
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    targetStatus: CampaignStatus | null;
    reason: string;
  }>({ open: false, targetStatus: null, reason: '' });

  // Placement state for Tab 4
  const [placementHero, setPlacementHero] = useState(false);
  const [placementFeatured, setPlacementFeatured] = useState(false);
  const [placementUrgent, setPlacementUrgent] = useState(false);
  const [isSavingPlacement, setIsSavingPlacement] = useState(false);

  // Search in donations tab
  const [donationSearch, setDonationSearch] = useState('');

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(JSON.parse(JSON.stringify(found)));
      const curation = db.getHomepageCuration();
      setPlacementHero((curation.heroCampaignIds || []).includes(found.id));
      setPlacementFeatured(Boolean(found.featured || (curation.featuredCampaignIds || []).includes(found.id)));
      setPlacementUrgent(Boolean(found.urgent || (curation.urgentCampaignIds || []).includes(found.id)));
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
          The requested fundraiser ID &quot;{campaignId}&quot; could not be located.
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
  const allDonations = db.getDonations({ campaignId: campaign.id });
  const succeededDonations = allDonations.filter((d) => d.status === 'succeeded');
  const campaignAuditLogs = db.getAuditLogs().filter(
    (l) => l.targetId === campaign.id || l.details.includes(campaign.title)
  );

  const filteredDonations = allDonations.filter((d) => {
    if (!donationSearch) return true;
    const q = donationSearch.toLowerCase();
    return (
      d.donorName.toLowerCase().includes(q) ||
      d.donorEmail.toLowerCase().includes(q) ||
      d.receiptNumber.toLowerCase().includes(q) ||
      (d.donorPan && d.donorPan.toLowerCase().includes(q))
    );
  });

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

  const handleSavePlacements = async () => {
    setIsSavingPlacement(true);
    try {
      const curation = db.getHomepageCuration();
      const heroIds = new Set(curation.heroCampaignIds);
      const featuredIds = new Set(curation.featuredCampaignIds);
      const urgentIds = new Set(curation.urgentCampaignIds);

      if (placementHero) heroIds.add(campaign.id);
      else heroIds.delete(campaign.id);

      if (placementFeatured) featuredIds.add(campaign.id);
      else featuredIds.delete(campaign.id);

      if (placementUrgent) urgentIds.add(campaign.id);
      else urgentIds.delete(campaign.id);

      // Also sync flags on campaign model
      db.updateCampaign(
        campaign.id,
        {
          featured: placementFeatured,
          urgent: placementUrgent,
        },
        currentUser?.name || 'Admin'
      );

      // Update curation
      db.updateHomepageCuration(
        {
          heroCampaignIds: Array.from(heroIds),
          featuredCampaignIds: Array.from(featuredIds),
          urgentCampaignIds: Array.from(urgentIds),
        },
        currentUser?.name || 'Admin'
      );

      // Revalidate cache via API
      await fetch('/api/admin/homepage-curation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroCampaignIds: Array.from(heroIds),
          featuredCampaignIds: Array.from(featuredIds),
          urgentCampaignIds: Array.from(urgentIds),
        }),
      }).catch(() => null);

      notify('Homepage placement and merchandising rules saved successfully.');
    } catch (err: any) {
      notify(`Error saving placements: ${err.message}`);
    } finally {
      setIsSavingPlacement(false);
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
                  {campaign.primaryCategory || campaign.category}
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
            <span className="text-[10px] text-neutral-400 font-medium">95% net after escrow</span>
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
              <span className="text-xl sm:text-2xl font-black text-neutral-900">{succeededDonations.length || campaign.supporterCount}</span>
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

      {/* ----------------- 5 COHERENT TABS NAVIGATION ----------------- */}
      <div className="flex items-center gap-1 border-b border-[#E2E4E9] bg-white px-4 py-2 rounded-2xl shadow-2xs overflow-x-auto scrollbar-none">
        {[
          { id: 'summary', label: 'Summary & Story', icon: LayoutDashboard },
          { id: 'donations', label: `Donations (${allDonations.length})`, icon: Users },
          { id: 'finance', label: 'Finance & Payouts', icon: DollarSign },
          { id: 'placement', label: 'Homepage & Placements', icon: LayoutList },
          { id: 'activity', label: `Activity & Reports (${updates.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#E84B45] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-[#202124] hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ----------------- TAB 1: SUMMARY & STORY ----------------- */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Story & Details (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="font-bold text-sm text-[#202124]">Campaign Narrative & Story</h3>
                  <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-[#E84B45]" />
                      Edit Narrative
                    </Button>
                  </Link>
                </div>
                <div className="text-xs text-[#555B63] leading-relaxed whitespace-pre-wrap font-sans">
                  {campaign.story || 'No narrative provided yet.'}
                </div>
              </div>

              {/* Item Requirements / Needs */}
              <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-[#202124]">Item Needs & Deliveries ({items.length})</h3>
                  </div>
                  <Link href={`/admin/campaigns/${campaign.id}/items`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      Manage Items
                    </Button>
                  </Link>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No specific wholesale items attached to this campaign.</p>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {items.map((it) => (
                      <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-neutral-800">{it.name}</p>
                          <p className="text-[10px] text-neutral-400">
                            Unit Cost: {formatINR(it.unitPrice)} • Goal: {it.quantityRequired} {it.unit || 'units'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold font-mono text-emerald-600">
                            {it.quantityProcured || 0} / {it.quantityRequired} Procured
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Metadata (1 col) */}
            <div className="space-y-6">
              {/* Category & Tags Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                  <Tag className="w-4 h-4 text-[#E84B45]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700">Taxonomy & Tags</h3>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Primary Category</span>
                  <span className="text-xs font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-lg inline-block">
                    {campaign.primaryCategory || campaign.category}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1.5">Assigned Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(campaign.tags || []).length === 0 ? (
                      <span className="text-xs text-neutral-400 italic">No tags assigned</span>
                    ) : (
                      (campaign.tags || []).map((t) => (
                        <span key={t} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E84B45]/10 text-[#E84B45]">
                          #{t}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Update Category &amp; Tags
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sub-Editor Quick Links */}
              <div className="bg-white p-5 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700 pb-2 border-b border-neutral-100">
                  Sub-Editor Tools
                </h3>
                <Link
                  href={`/admin/campaigns/${campaign.id}/media`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 border border-neutral-100 text-xs transition group"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-neutral-800">Media &amp; Posters Gallery</span>
                  </div>
                  <span className="text-neutral-400 group-hover:text-neutral-700">→</span>
                </Link>

                <Link
                  href={`/admin/campaigns/${campaign.id}/evidence`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 border border-neutral-100 text-xs transition group"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-neutral-800">Proof Documents Vault ({documentsCount})</span>
                  </div>
                  <span className="text-neutral-400 group-hover:text-neutral-700">→</span>
                </Link>

                <Link
                  href={`/admin/campaigns/${campaign.id}/items`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 border border-neutral-100 text-xs transition group"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-neutral-800">Item Giving Catalog</span>
                  </div>
                  <span className="text-neutral-400 group-hover:text-neutral-700">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: DONATIONS LEDGER ----------------- */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search donors by name, email, PAN, or receipt..."
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
                className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-semibold">{filteredDonations.length} records found</span>
              <Link href={`/admin/reports?campaignId=${campaign.id}`}>
                <Button size="sm" variant="outline" className="text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                  Export XLSX / CSV
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Receipt</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">80G Status</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-400 italic">
                        No donation records match the search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                          {d.receiptNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-neutral-900">{d.isAnonymous ? 'Anonymous Donor' : d.donorName}</p>
                          <p className="text-[10px] text-neutral-400">{d.donorEmail}</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {formatINR(d.amount)}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {formatDate(d.createdAt)}
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-mono font-semibold text-neutral-600">
                          {d.paymentMethod}
                        </td>
                        <td className="py-3 px-4">
                          {d.taxExemption80G ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              80G Claimed
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              d.status === 'succeeded'
                                ? 'bg-emerald-50 text-emerald-700'
                                : d.status === 'refunded'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: FINANCE & DISBURSAL ----------------- */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Gross Donated</span>
              <p className="text-2xl font-black text-neutral-900 mt-2 font-mono">{formatINR(campaign.raisedAmount)}</p>
              <p className="text-[11px] text-neutral-500 mt-1">100% gateway collected volume</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Gateway &amp; Escrow (5%)</span>
              <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
                {formatINR(Math.round(campaign.raisedAmount * 0.05))}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Payment processing &amp; platform escrow</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Net Recognized</span>
              <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">{formatINR(netRaised)}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Available for hospital disbursal</p>
            </div>
          </div>

          {/* Disbursal & Bank Instructions */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-[#202124]">Beneficiary Hospital &amp; Payout Account</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Direct Trust Payout
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-neutral-400">Hospital Account Title</span>
                <p className="font-bold text-neutral-900">{campaign.organizationName || 'AIIMS New Delhi Patient Relief Fund'}</p>
                <p className="text-[11px] text-neutral-500">Bank: State Bank of India • IFSC: SBIN0001536</p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-neutral-400">Disbursal Policy</span>
                <p className="font-bold text-neutral-900">Direct Medical Vendor Settlement</p>
                <p className="text-[11px] text-neutral-500">Funds transferred exclusively against hospital invoices.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link href="/admin/finance">
                <Button size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
                  Open Finance Hub for Settlements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 4: HOMEPAGE & PLACEMENTS ----------------- */}
      {activeTab === 'placement' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-sm text-[#202124]">Homepage Merchandising &amp; Placement Controls</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Directly configure where and how this campaign is showcased to public visitors.
                </p>
              </div>
              <Link href="/admin/homepage-curation">
                <Button size="sm" variant="outline" className="text-xs">
                  <LayoutList className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  Full Merchandising Center
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {/* Placement 1: Hero Carousel */}
              <label className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={placementHero}
                  onChange={(e) => setPlacementHero(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">Homepage Hero Carousel (Top Banner)</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-100 text-amber-800">
                      High Visibility
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Places this fundraiser into the rotating header carousel on the homepage with high-impact donor call-to-actions.
                  </p>
                </div>
              </label>

              {/* Placement 2: Featured Grid */}
              <label className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={placementFeatured}
                  onChange={(e) => setPlacementFeatured(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">Featured Campaigns Grid</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-purple-100 text-purple-800">
                      Editorial Pick
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Highlights this campaign in the curated 3-column &ldquo;Featured Fundraisers&rdquo; grid.
                  </p>
                </div>
              </label>

              {/* Placement 3: Urgent Emergency Ticker */}
              <label className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={placementUrgent}
                  onChange={(e) => setPlacementUrgent(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">Urgent Emergency (24h Alert Strip)</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-rose-100 text-rose-800">
                      Critical Alert
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Flags this campaign with an urgent pulsing badge for rapid emergency relief and prioritizes it across filters.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-[11px] text-neutral-400">
                Changes take effect immediately on the homepage and update public cache tags.
              </p>
              <Button
                size="sm"
                onClick={handleSavePlacements}
                disabled={isSavingPlacement}
                className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {isSavingPlacement ? 'Saving Changes...' : 'Save Placements'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 5: ACTIVITY & UPDATES ----------------- */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Field Updates List */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-sm text-[#202124]">Field Reports &amp; Milestone Proofs ({updates.length})</h3>
                <p className="text-xs text-neutral-500">Continuous transparency updates provided to donors.</p>
              </div>
              <Link href={`/admin/campaigns/${campaign.id}/updates`}>
                <Button size="sm" variant="outline" className="text-xs">
                  <Radio className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Publish New Update
                </Button>
              </Link>
            </div>

            {updates.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-4 text-center">No field reports posted yet.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {updates.map((u) => (
                  <div key={u.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{u.title}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            u.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>
                      <p className="text-neutral-500 line-clamp-2">{u.content}</p>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0">{formatDate(u.createdAt || new Date().toISOString())}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-[#202124]">Immutable Administrative Audit Log</h3>
              <span className="text-[11px] text-neutral-400 font-mono">{campaignAuditLogs.length} events</span>
            </div>

            {campaignAuditLogs.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-4 text-center">No audit trail entries for this campaign ID yet.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {campaignAuditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-800">{log.actorName}</span>
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-mono ml-2">
                        {log.action}
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400">{formatDate(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SAFE DELETION / ARCHIVE SECTION ----------------- */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-neutral-800">
          Campaign Lifecycle &amp; Safeguards
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl">
          To protect financial records and donor trust, campaigns with recorded donations cannot be physically deleted. You may pause donations or complete this campaign. Physical deletion is strictly reserved for draft proposals with zero dependent records.
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
