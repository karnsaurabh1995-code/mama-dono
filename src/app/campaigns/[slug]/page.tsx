'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { useLoginModal } from '@/providers/AuthUIProvider';
import { formatINR, calculatePercentage, formatDate, formatTimeAgo } from '@/lib/utils';
import { CampaignBadgeGroup } from '@/components/campaign/CampaignBadge';
import { CampaignPosterCarousel } from '@/components/campaign/CampaignPosterCarousel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { DualDonationModule } from '@/components/campaign/DualDonationModule';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { CampaignItemNeed, UserRole } from '@/lib/types';
import {
  Heart,
  Share2,
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  FileText,
  AlertCircle,
  Copy,
  ChevronRight,
  Hospital,
  Sparkles,
  Package,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Flag,
  Bell,
  Lock,
  DollarSign,
  TrendingUp,
  Video,
  Play,
  Image as ImageIcon,
  FolderArchive,
  X,
  Maximize2,
} from 'lucide-react';

function getEmbedVideoUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const clean = rawUrl.trim();
  const ytMatch = clean.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = clean.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
  }
  return null;
}

function getMilestoneBadge(milestoneType?: string, milestoneAchieved?: string) {
  if (milestoneAchieved) {
    return { label: milestoneAchieved, color: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  switch (milestoneType) {
    case 'medical_milestone':
      return { label: 'Medical Milestone', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'beneficiary_update':
      return { label: 'Beneficiary Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'procurement_update':
      return { label: 'Procurement & Supplies', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'item_delivery':
      return { label: 'Item Handover & Delivery', color: 'bg-teal-100 text-teal-800 border-teal-200' };
    case 'final_impact':
      return { label: 'Final Impact Report', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    case 'clarification':
      return { label: 'Donor Clarification', color: 'bg-sky-100 text-sky-800 border-sky-200' };
    default:
      return { label: 'Milestone Update', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
}

function getCloudProviderInfo(provider?: string) {
  switch (provider) {
    case 'google_drive':
      return { name: 'Google Drive', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'dropbox':
      return { name: 'Dropbox', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    case 'onedrive':
      return { name: 'OneDrive', color: 'bg-sky-50 text-sky-800 border-sky-200' };
    case 'box':
      return { name: 'Box', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    default:
      return { name: 'Cloud Drive', color: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
  }
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, switchRole } = useAuth();
  const { openLogin } = useLoginModal();

  const slug = params?.slug as string;
  const campaign = db.getCampaignBySlug(slug) || db.getCampaignById(slug);

  // Active Main Tabs: Story vs Updates
  const [activeTab, setActiveTab] = useState<'story' | 'updates'>('story');

  // Donor Filter State: 'recent' (public) | 'most_generous' (login-gated) | 'all' (login-gated)
  const [donorFilter, setDonorFilter] = useState<'recent' | 'most_generous' | 'all'>('recent');

  // Login Gate Modal State
  const [loginGateOpen, setLoginGateOpen] = useState(false);
  const [loginGateAction, setLoginGateAction] = useState<
    'ask_update' | 'most_generous' | 'all_donations' | 'flag' | null
  >(null);

  // Action Modals State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [askUpdateModalOpen, setAskUpdateModalOpen] = useState(false);
  const [updateInquiryType, setUpdateInquiryType] = useState('Patient Health & Medical Status');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateSubmitted, setUpdateSubmitted] = useState(false);

  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Suspected Inaccurate Medical Claim');
  const [flagExplanation, setFlagExplanation] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // Mode B Physical Pledge Modal
  const [selectedPhysicalItem, setSelectedPhysicalItem] = useState<CampaignItemNeed | null>(null);
  const [pledgeName, setPledgeName] = useState('');
  const [pledgeEmail, setPledgeEmail] = useState('');
  const [pledgePhone, setPledgePhone] = useState('');
  const [pledgeQty, setPledgeQty] = useState(10);
  const [pledgeCourier, setPledgeCourier] = useState('BlueDart / Delhivery');
  const [pledgeTracking, setPledgeTracking] = useState('');
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Check URL query parameters for return-to-action flow (e.g. after login redirect)
  useEffect(() => {
    const action = searchParams.get('action');
    if (!action) return;

    if (action === 'ask_update') {
      if (user) {
        setAskUpdateModalOpen(true);
      } else {
        setLoginGateAction('ask_update');
        setLoginGateOpen(true);
      }
    } else if (action === 'flag') {
      if (user) {
        setFlagModalOpen(true);
      } else {
        setLoginGateAction('flag');
        setLoginGateOpen(true);
      }
    } else if (action === 'most_generous') {
      if (user) {
        setDonorFilter('most_generous');
      } else {
        setLoginGateAction('most_generous');
        setLoginGateOpen(true);
      }
    } else if (action === 'all_donations') {
      if (user) {
        setDonorFilter('all');
      } else {
        setLoginGateAction('all_donations');
        setLoginGateOpen(true);
      }
    }
  }, [searchParams, user]);

  if (!campaign) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#202124]">Campaign Not Found</h1>
        <p className="text-sm text-[#555B63]">
          The campaign you are looking for does not exist or may have been concluded.
        </p>
        <Link
          href="/campaigns"
          className="inline-flex items-center justify-center font-medium rounded-xl transition-all bg-[#EF4949] text-white hover:bg-[#D9363E] shadow-sm px-6 py-2.5 text-sm cursor-pointer"
        >
          Browse Active Campaigns
        </Link>
      </div>
    );
  }

  // Load campaign items, updates, donations, faqs, related campaigns
  const items = db.getCampaignItemNeeds(campaign.id);
  const updates = db.getCampaignUpdates(campaign.id, false);
  const allSucceededDonations = db.getDonations({ campaignId: campaign.id, status: 'succeeded' });
  const relatedCampaigns = db
    .getCampaigns({ category: campaign.category, status: 'active' })
    .filter((c) => c.id !== campaign.id)
    .slice(0, 3);
  const faqs = db.getFAQs().slice(0, 4);

  const netRaised = campaign.netRaisedAmount || Math.round(campaign.raisedAmount * 0.95);
  const percentage = calculatePercentage(netRaised, campaign.goalAmount);

  // Total items calculations
  const totalItemsRequired = items.reduce((acc, it) => acc + it.quantityRequired, 0);
  const totalItemsFunded = items.reduce((acc, it) => acc + it.quantityFunded, 0);
  const itemPercentage =
    totalItemsRequired > 0
      ? Math.min(100, Math.round((totalItemsFunded / totalItemsRequired) * 100))
      : 0;

  // Process Donor List based on Filter
  let displayedDonations = [...allSucceededDonations];
  if (donorFilter === 'most_generous') {
    displayedDonations.sort((a, b) => b.amount - a.amount);
  } else if (donorFilter === 'recent') {
    displayedDonations = displayedDonations.slice(0, 5);
  }

  // ---------------- LOGIN-GATED ACTION HANDLERS ----------------
  const handleAskUpdateClick = () => {
    if (!user) {
      setLoginGateAction('ask_update');
      setLoginGateOpen(true);
      return;
    }
    setAskUpdateModalOpen(true);
  };

  const handleDonorFilterSelect = (filter: 'recent' | 'most_generous' | 'all') => {
    if (filter === 'recent') {
      setDonorFilter('recent');
      return;
    }

    if (!user) {
      setLoginGateAction(filter === 'most_generous' ? 'most_generous' : 'all_donations');
      setLoginGateOpen(true);
      return;
    }

    setDonorFilter(filter);
  };

  const handleFlagClick = () => {
    if (!user) {
      setLoginGateAction('flag');
      setLoginGateOpen(true);
      return;
    }
    setFlagModalOpen(true);
  };

  const handleModalInstantLogin = (role: UserRole) => {
    switchRole(role);
    setLoginGateOpen(false);

    // Execute requested gated action
    if (loginGateAction === 'ask_update') {
      setAskUpdateModalOpen(true);
    } else if (loginGateAction === 'flag') {
      setFlagModalOpen(true);
    } else if (loginGateAction === 'most_generous') {
      setDonorFilter('most_generous');
    } else if (loginGateAction === 'all_donations') {
      setDonorFilter('all');
    }
    setLoginGateAction(null);
  };

  const handleNavigateToFullLogin = () => {
    const returnUrl = `/campaigns/${campaign.slug}`;
    setLoginGateOpen(false);
    openLogin(returnUrl);
  };

  const handleAskUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    db.createCampaignUpdateRequest({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      inquiryType: updateInquiryType,
      message: updateMessage.trim(),
    });

    setUpdateSubmitted(true);
    setTimeout(() => {
      setUpdateSubmitted(false);
      setAskUpdateModalOpen(false);
      setUpdateMessage('');
      notify('Update request sent to campaign coordinators.');
    }, 2200);
  };

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    db.createCampaignReport({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      reason: flagReason,
      explanation: flagExplanation.trim(),
    });

    setFlagSubmitted(true);
    setTimeout(() => {
      setFlagSubmitted(false);
      setFlagModalOpen(false);
      setFlagExplanation('');
      notify('Report submitted to Trust & Safety. Case opened for review.');
    }, 2500);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Please help support "${campaign.title}" on dokind: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Please help support "${campaign.title}" on @dokindIndia: `);
    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handlePhysicalPledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhysicalItem || !pledgeName || !pledgeEmail) return;

    try {
      db.createPhysicalItemPledge({
        campaignId: campaign.id,
        itemId: selectedPhysicalItem.id,
        donorName: pledgeName.trim(),
        donorEmail: pledgeEmail.trim(),
        donorPhone: pledgePhone.trim(),
        quantity: Number(pledgeQty),
        shippingCarrier: pledgeCourier.trim(),
        trackingNumber: pledgeTracking.trim(),
        notes: `Physical shipment of ${pledgeQty} ${selectedPhysicalItem.unit} pledged by donor.`,
      });

      setPledgeSuccess(true);
      setTimeout(() => {
        setPledgeSuccess(false);
        setSelectedPhysicalItem(null);
        setPledgeName('');
        setPledgeEmail('');
        setPledgePhone('');
        setPledgeTracking('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting physical pledge:', err);
    }
  };

  return (
    <div className="pt-1.5 sm:pt-2 pb-12 bg-[#FAF9F6] min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#202124] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 sm:space-y-2.5">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63] py-0.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link href="/campaigns" className="hover:text-[#202124]">
            Campaigns
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[#202124] font-semibold truncate max-w-xs">
            {campaign.title}
          </span>
        </nav>

        {/* ---------------- 2-COLUMN RESPONSIVE LAYOUT (DONATEKART REFERENCE) ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: MAIN CAMPAIGN CONTENT (8 Cols) ================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* 1. Campaign Main Poster Carousel (Interactive Multi-Poster Gallery Supporting 2-3 Posters) */}
            <div className="space-y-4">
              <CampaignPosterCarousel
                campaign={campaign}
                posters={
                  campaign.posterImages && campaign.posterImages.length > 0
                    ? campaign.posterImages
                    : [
                        campaign.imageUrl,
                        ...(campaign.galleryUrls || []).filter((u) => u !== campaign.imageUrl).slice(0, 2),
                      ]
                }
                onOpenLightbox={(url) => setPreviewImage(url)}
              />

              {/* 2. Headline & Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#202124] tracking-tight leading-tight">
                  {campaign.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-[#555B63] flex-wrap">
                  {campaign.beneficiaryLocation && (
                    <span className="flex items-center gap-1 text-[#202124] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#EF4949]" />
                      <span>{campaign.beneficiaryLocation}</span>
                    </span>
                  )}
                  {campaign.hospitalName && (
                    <span className="flex items-center gap-1 text-[#202124] font-medium">
                      <Hospital className="w-3.5 h-3.5 text-[#EF4949]" />
                      <span>{campaign.hospitalName}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Created {formatDate(campaign.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* 3. Organization / Beneficiary Card */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-[#E8E6E1] flex items-center justify-center text-[#EF4949] font-black text-base shrink-0">
                    {campaign.organizationName ? campaign.organizationName.charAt(0) : 'D'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-[#202124]">
                        {campaign.organizationName || campaign.organizerName}
                      </h3>
                      {campaign.verifiedStatus === 'verified' && (
                        <span title="Verified NGO Partner">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#555B63]">
                      Beneficiary: <strong>{campaign.beneficiaryName}</strong> ({campaign.beneficiaryLocation})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#555B63]">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                      Disbursement Mode
                    </span>
                    <span className="font-bold text-emerald-700">Direct Escrow to Hospital</span>
                  </div>
                  <Link
                    href="/verification-policy"
                    className="text-xs font-semibold text-[#EF4949] hover:underline flex items-center gap-1"
                  >
                    <span>Verification Policy</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile-Only Donation Panel Insertion Point (Right Below Hero/Title) */}
            <div className="block lg:hidden">
              <DualDonationModule
                campaign={campaign}
                items={items}
                layout="sidebar"
                onShareClick={() => setShowShareModal(true)}
                onPhysicalPledgeClick={(it) => {
                  setSelectedPhysicalItem(it);
                  setPledgeQty(10);
                }}
              />
            </div>

            {/* 4. STORY & UPDATES TABS (DonateKart Layout Reference) */}
            <div className="space-y-6">
              {/* Segmented Tab Headers */}
              <div className="flex items-center justify-between border-b border-[#E8E6E1] pb-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('story')}
                    className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
                      activeTab === 'story'
                        ? 'border-[#EF4949] text-[#EF4949]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Story
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('updates')}
                    className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'updates'
                        ? 'border-[#EF4949] text-[#EF4949]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <span>Updates</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-200 text-neutral-700 font-mono">
                      {updates.length}
                    </span>
                  </button>
                </div>

                {/* Login-Gated Action: Ask for Update */}
                <button
                  type="button"
                  onClick={handleAskUpdateClick}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#202124] hover:text-[#EF4949] bg-white border border-[#E8E6E1] hover:border-neutral-300 px-3 py-1.5 rounded-full transition shadow-2xs cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-[#EF4949]" />
                  <span>Ask for update</span>
                </button>
              </div>

              {/* TAB 1: STORY CONTENT */}
              {activeTab === 'story' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  {/* Narrative Text */}
                  <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-2xs space-y-4">
                    <h2 className="text-lg sm:text-xl font-black text-[#202124] tracking-tight">
                      The Journey & Why Support Is Crucial
                    </h2>
                    <div className="prose max-w-none text-sm sm:text-base leading-relaxed text-[#404348] whitespace-pre-line font-normal">
                      {campaign.story}
                    </div>
                  </div>

                  {/* Field Investigation & Structured Story Blocks */}
                  {campaign.storyBlocks && campaign.storyBlocks.length > 0 && (
                    <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-2xs space-y-4">
                      <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                        Field Investigation & Need Assessment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {campaign.storyBlocks.map((blk) => (
                          <div
                            key={blk.id}
                            className="p-5 rounded-2xl border border-neutral-200 bg-[#FAF9F6] space-y-2 hover:border-neutral-300 transition"
                          >
                            {blk.title && (
                              <h4 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#EF4949]" />
                                {blk.title}
                              </h4>
                            )}
                            <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                              {blk.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Transparency: Expenditure Breakdown */}
                  {campaign.itemizedBudget && campaign.itemizedBudget.length > 0 && (
                    <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-1">
                        <div>
                          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            FINANCIAL TRANSPARENCY
                          </span>
                          <h2 className="text-lg sm:text-xl font-black text-[#202124] tracking-tight mt-2">
                            Itemized Expenditure Breakdown
                          </h2>
                        </div>
                      </div>

                      <div className="divide-y divide-[#E8E6E1] border border-[#E8E6E1] rounded-2xl overflow-hidden text-xs">
                        {campaign.itemizedBudget.map((b) => (
                          <div
                            key={b.id}
                            className="p-4 flex items-center justify-between bg-white hover:bg-[#FAF9F6] transition"
                          >
                            <div>
                              <p className="font-bold text-[#202124]">{b.item}</p>
                              {b.description && (
                                <p className="text-neutral-500 mt-0.5">{b.description}</p>
                              )}
                            </div>
                            <span className="font-bold text-[#202124] font-mono text-right ml-4 shrink-0">
                              {formatINR(b.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audited Verification Documents (Publicly Verified Only) */}
                  {(() => {
                    const publicDocs = (campaign.documents || []).filter(
                      (d) => d.isPublic !== false && d.status !== 'rejected' && d.verified !== false
                    );
                    if (publicDocs.length === 0) return null;
                    return (
                      <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                          <div className="space-y-1">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                              AUDITED EVIDENCE VAULT
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-[#202124] tracking-tight mt-2 flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-emerald-600" />
                              Hospital Certificates & Verified Documents ({publicDocs.length})
                            </h2>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                            100% dokind Audited
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {publicDocs.map((doc, idx) => (
                            <div
                              key={doc.id || idx}
                              className="p-4 rounded-2xl border border-[#E8E6E1] bg-[#FAF9F6] flex items-center justify-between gap-3 hover:border-neutral-300 transition"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E1] text-[#EF4949] flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-[#202124] truncate">{doc.title}</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-neutral-500 capitalize">{doc.type.replace(/_/g, ' ')}</span>
                                    {doc.fileSize && (
                                      <span className="text-[10px] text-neutral-400 font-mono">• {doc.fileSize}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white border border-[#E8E6E1] text-neutral-700 hover:text-black hover:border-neutral-400 transition shrink-0"
                                title="View Audited Document"
                              >
                                <span>Inspect</span>
                                <ExternalLink className="w-3 h-3 text-neutral-400" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: UPDATES CONTENT */}
              {activeTab === 'updates' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {updates.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-3xl border border-dashed border-neutral-300 space-y-2">
                      <Bell className="w-8 h-8 mx-auto text-neutral-300" />
                      <p className="font-semibold text-[#202124]">No field updates published yet.</p>
                      <p className="text-[#555B63]">
                        Have questions about patient recovery or food distribution?
                      </p>
                      <button
                        type="button"
                        onClick={handleAskUpdateClick}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EF4949] hover:underline pt-2 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask organizers for an update</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {updates.map((upd) => {
                        const milestone = getMilestoneBadge(upd.milestoneType, upd.milestoneAchieved);
                        const embedVideo = getEmbedVideoUrl(upd.videoUrl);
                        const publicCloudLinks = (upd.cloudLinks || []).filter((l) => l.isPublic !== false);
                        const verifiedEvidence = (upd.evidenceAttachments || []).filter(
                          (e) => e.isPublic && e.status === 'verified'
                        );

                        return (
                          <div
                            key={upd.id}
                            className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-7 shadow-2xs space-y-5"
                          >
                            {/* Update Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${milestone.color}`}>
                                  {milestone.label}
                                </span>
                                {upd.eventDate && (
                                  <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-neutral-400" />
                                    Event: {formatDate(upd.eventDate)}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                Published: {formatDate(upd.publishedAt || upd.createdAt || new Date().toISOString())}
                              </span>
                            </div>

                            {/* Title & Author */}
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-[#202124]">{upd.title}</h3>
                              <p className="text-[11px] text-neutral-400">
                                Published by <strong className="text-neutral-700">{upd.authorName}</strong> ({upd.authorRole})
                              </p>
                            </div>

                            {/* Video Embed Player */}
                            {upd.videoUrl && (
                              <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-black aspect-video relative shadow-xs">
                                {embedVideo ? (
                                  <iframe
                                    src={embedVideo}
                                    title={`Update video: ${upd.title}`}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-neutral-900 space-y-3">
                                    <Video className="w-10 h-10 text-[#EF4949]" />
                                    <div>
                                      <p className="font-bold text-sm">External Video Update Available</p>
                                      <p className="text-xs text-neutral-400 mt-0.5">Click below to watch the field reporting video</p>
                                    </div>
                                    <a
                                      href={upd.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EF4949] text-white text-xs font-bold hover:bg-[#D9363E] transition"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-current" />
                                      <span>Watch Field Video</span>
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Narrative Content */}
                            <div className="text-xs sm:text-sm text-[#404348] leading-relaxed whitespace-pre-line space-y-2 bg-[#FAF9F6] p-4 sm:p-5 rounded-2xl border border-[#E8E6E1]/60">
                              {upd.content}
                            </div>

                            {/* Photo Gallery Grid */}
                            {upd.mediaUrls && upd.mediaUrls.length > 0 && (
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                                    Field Photographs & Ground Verification ({upd.mediaUrls.length})
                                  </span>
                                  <span className="text-[10px] text-neutral-400">Click any image to enlarge</span>
                                </div>
                                <div
                                  className={`grid gap-3 ${
                                    upd.mediaUrls.length === 1
                                      ? 'grid-cols-1'
                                      : upd.mediaUrls.length === 2
                                      ? 'grid-cols-1 sm:grid-cols-2'
                                      : 'grid-cols-2 sm:grid-cols-3'
                                  }`}
                                >
                                  {upd.mediaUrls.map((url, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => setPreviewImage(url)}
                                      className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={url}
                                        alt={`Field evidence ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="p-2 rounded-full bg-white/90 text-neutral-800 shadow-sm">
                                          <Maximize2 className="w-4 h-4" />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Public Cloud Links */}
                            {publicCloudLinks.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-neutral-100">
                                <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                                  <FolderArchive className="w-3.5 h-3.5 text-neutral-400" />
                                  External Cloud Folders & Verification Documents
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {publicCloudLinks.map((link) => {
                                    const provider = getCloudProviderInfo(link.provider);
                                    return (
                                      <div
                                        key={link.id}
                                        className="p-3 rounded-xl border border-neutral-200 bg-[#FAF9F6] flex items-center justify-between gap-3 text-xs"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${provider.color}`}>
                                              {provider.name}
                                            </span>
                                            <span className="font-bold text-[#202124] truncate">{link.label}</span>
                                          </div>
                                          {link.description && (
                                            <p className="text-[11px] text-neutral-500 truncate">{link.description}</p>
                                          )}
                                        </div>
                                        <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition shrink-0"
                                          title={`Open in ${provider.name}`}
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Verified Evidence Attachments */}
                            {verifiedEvidence.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-neutral-100">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Verified Financial & Medical Proof ({verifiedEvidence.length})</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {verifiedEvidence.map((ev) => (
                                    <div
                                      key={ev.id}
                                      className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3 text-xs"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                          <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-[#202124] truncate">{ev.title}</p>
                                          <p className="text-[10px] text-emerald-700 font-semibold capitalize">
                                            {ev.evidenceCategory.replace(/_/g, ' ')} • Audited
                                          </p>
                                        </div>
                                      </div>
                                      <a
                                        href={ev.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-100 transition shrink-0"
                                        title="Inspect Audited Document"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ask Follow-up Update */}
                            <div className="pt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={handleAskUpdateClick}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#EF4949] hover:underline cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Ask organizers a question about this update</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. DONOR ACTIVITY & COMMENTS (LOGIN-GATED CONTROLS) */}
            <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E6E1]">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#EF4949] bg-[#FFF0EF] px-3 py-1 rounded-full border border-[#FEE2E2]">
                    COMMUNITY SUPPORTERS
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#202124] tracking-tight mt-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#EF4949] fill-[#EF4949]" />
                    Donor Activity ({allSucceededDonations.length})
                  </h2>
                </div>

                {/* Filter Tabs: Recent Donors (Public) vs Most Generous (Login-Gated) vs All Donations (Login-Gated) */}
                <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] text-xs">
                  <button
                    type="button"
                    onClick={() => handleDonorFilterSelect('recent')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      donorFilter === 'recent'
                        ? 'bg-white text-[#202124] shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Recent Donors
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDonorFilterSelect('most_generous')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      donorFilter === 'most_generous'
                        ? 'bg-white text-[#202124] shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {!user && <Lock className="w-3 h-3 text-neutral-400" />}
                    <span>Most Generous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDonorFilterSelect('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      donorFilter === 'all'
                        ? 'bg-white text-[#202124] shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {!user && <Lock className="w-3 h-3 text-neutral-400" />}
                    <span>All Donations</span>
                  </button>
                </div>
              </div>

              {/* Donors List */}
              <div className="divide-y divide-[#E8E6E1]">
                {displayedDonations.map((don) => (
                  <div key={don.id} className="py-4 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-[#202124] text-sm">
                        {don.isAnonymous ? 'Generous Well Wisher' : don.donorName}
                      </p>
                      {don.itemAllocations && don.itemAllocations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {don.itemAllocations.map((alloc, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                            >
                              Sponsored {alloc.quantity}× {alloc.itemName}
                            </span>
                          ))}
                        </div>
                      )}
                      {don.message && (
                        <p className="text-[#555B63] italic text-xs pt-0.5">&ldquo;{don.message}&rdquo;</p>
                      )}
                      <p className="text-[10px] text-neutral-400">{formatDate(don.createdAt)}</p>
                    </div>
                    <span className="font-black text-emerald-700 font-mono text-sm shrink-0">
                      {formatINR(don.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Frequently Asked Questions (FAQ) */}
            <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="space-y-1 pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                  QUESTIONS & ANSWERS
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#202124] tracking-tight mt-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#EF4949]" />
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-1.5">
                    <h3 className="text-xs font-bold text-[#202124]">{faq.question}</h3>
                    <p className="text-xs text-[#555B63] leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Flag This Campaign Action (LOGIN-GATED) */}
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-200 px-2">
              <span>Have trust or factual concerns about this fundraiser?</span>
              <button
                type="button"
                onClick={handleFlagClick}
                className="flex items-center gap-1.5 font-bold text-neutral-700 hover:text-red-600 transition cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-neutral-400" />
                <span>Flag this campaign</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY DONATION PANEL (4 Cols) ================= */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-[80px] space-y-3.5">
            {/* 1. Progress Summary Card */}
            <div className="bg-white rounded-3xl border border-[#E8E6E1] pt-3.5 px-4.5 pb-4 sm:pt-4 sm:px-5 sm:pb-4.5 shadow-xs space-y-3">
              {/* Monetary Progress */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-[#202124] font-mono">
                      {formatINR(netRaised)}
                    </span>
                    <span className="block text-[11px] font-bold text-emerald-700">
                      Net raised for this cause
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-700 font-bold block">
                      {percentage}% of {formatINR(campaign.goalAmount)}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      (Gross: {formatINR(campaign.raisedAmount)})
                    </span>
                  </div>
                </div>
                <ProgressBar value={percentage} height="md" />

                <div className="flex justify-between text-xs text-[#555B63] pt-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <strong>{campaign.supporterCount}</strong> Donors
                  </span>
                  {campaign.deadline && <span>Ends: {formatDate(campaign.deadline)}</span>}
                </div>
              </div>
            </div>

            {/* 2. DUAL-DONATION MODULE (DONATE PRODUCTS | DONATE MONEY) */}
            <DualDonationModule
              campaign={campaign}
              items={items}
              layout="sidebar"
              onShareClick={() => setShowShareModal(true)}
              onPhysicalPledgeClick={(it) => {
                setSelectedPhysicalItem(it);
                setPledgeQty(10);
              }}
            />

            {/* 3. Share Campaign Quick Action */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border border-[#E8E6E1] hover:bg-[#FAF9F6] text-xs font-bold text-[#202124] transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 className="w-4 h-4 text-[#EF4949]" />
              <span>Share Fundraiser with Friends</span>
            </button>
          </div>
        </div>

        {/* ---------------- RELATED VERIFIED CAMPAIGNS ---------------- */}
        {relatedCampaigns.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-[#E8E6E1]">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#EF4949]">
                  MORE CAUSES
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
                  Similar Verified Campaigns You Can Support
                </h2>
              </div>
              <Link href="/campaigns" className="text-xs font-bold text-[#EF4949] hover:underline">
                View All Campaigns &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCampaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- MODAL 1: LOGIN-GATED ACTION PROMPT ---------------- */}
      {loginGateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-[#EF4949] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#202124]">
                  {loginGateAction === 'ask_update' && 'Sign In to Ask for an Update'}
                  {loginGateAction === 'most_generous' && 'Sign In to View Top Donors'}
                  {loginGateAction === 'all_donations' && 'Sign In to View All Donations'}
                  {loginGateAction === 'flag' && 'Sign In to Report Campaign'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginGateOpen(false);
                  setLoginGateAction(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#555B63] leading-relaxed">
              {loginGateAction === 'ask_update' &&
                'To safeguard campaign organizers from spam, you must be signed in with a supporter or donor account to request field reports or medical updates.'}
              {loginGateAction === 'most_generous' &&
                'To maintain donor privacy and comply with Indian charity regulations, top contributor insights are available to registered supporters.'}
              {loginGateAction === 'all_donations' &&
                'Sign in to explore the complete verified ledger of contributions for this grassroots initiative.'}
              {loginGateAction === 'flag' &&
                'To prevent malicious reports and ensure accountability, trust & safety reports must be authenticated by a registered user.'}
            </p>

            {/* Instant Demo Role Login (1-Click for Instant Testing) */}
            <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Instant 1-Click Testing Login
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleModalInstantLogin('donor')}
                  className="p-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left cursor-pointer"
                >
                  <strong className="block text-[#202124]">As Donor</strong>
                  <span className="text-[10px] text-neutral-500">Vikramaditya S.</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModalInstantLogin('super_admin')}
                  className="p-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left cursor-pointer"
                >
                  <strong className="block text-[#202124]">As Admin</strong>
                  <span className="text-[10px] text-neutral-500">Chief Admin</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={handleNavigateToFullLogin}
                className="w-full bg-[#EF4949] hover:bg-[#D9363E] text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Sign In with Email / Password
              </Button>

              <button
                type="button"
                onClick={() => {
                  setLoginGateOpen(false);
                  setLoginGateAction(null);
                }}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-800 py-1 cursor-pointer"
              >
                Cancel and return to campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: ASK FOR UPDATE ---------------- */}
      {askUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#EF4949]" />
                <h3 className="text-base font-bold text-[#202124]">Ask for a Campaign Update</h3>
              </div>
              <button
                type="button"
                onClick={() => setAskUpdateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {updateSubmitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Update Request Dispatched!</h4>
                <p className="text-xs text-emerald-700">
                  Our field coordinators and the campaign organizers have been notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAskUpdateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#202124] block mb-1">
                    What would you like an update on? *
                  </label>
                  <select
                    value={updateInquiryType}
                    onChange={(e) => setUpdateInquiryType(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs text-[#202124]"
                  >
                    <option value="Patient Health & Medical Status">Patient Health & Medical Status</option>
                    <option value="Hospital Bill & Chemotherapy Receipts">Hospital Bill & Chemotherapy Receipts</option>
                    <option value="Product Delivery & Wholesale Procurement">Product Delivery & Wholesale Procurement</option>
                    <option value="General Milestone Progress">General Milestone Progress</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#202124] block mb-1">
                    Specific Question or Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    placeholder="e.g. Inquiring about the latest post-surgery CBC count..."
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-xs text-[#202124] focus:outline-none focus:border-[#EF4949]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAskUpdateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#EF4949] hover:bg-[#D9363E] text-white font-bold"
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: FLAG THIS CAMPAIGN ---------------- */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-[#202124]">Report Campaign Concerns</h3>
              </div>
              <button
                type="button"
                onClick={() => setFlagModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {flagSubmitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Report Under Trust & Safety Review</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for helping protect our community. An investigation case has been logged for administrative audit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#202124] block mb-1">
                    Reason for Reporting *
                  </label>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs text-[#202124]"
                  >
                    <option value="Suspected Inaccurate Medical Claim">Suspected Inaccurate Medical Claim</option>
                    <option value="Unauthorized Campaign Organizer">Unauthorized Campaign Organizer</option>
                    <option value="Missing Expenditure Receipts">Missing Expenditure Receipts</option>
                    <option value="Copyright or Identity Misuse">Copyright or Identity Misuse</option>
                    <option value="Other Trust Concern">Other Trust Concern</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#202124] block mb-1">
                    Detailed Explanation & Evidence *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={flagExplanation}
                    onChange={(e) => setFlagExplanation(e.target.value)}
                    placeholder="Provide details to assist the Trust & Safety team in reviewing this campaign..."
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-xs text-[#202124] focus:outline-none focus:border-[#EF4949]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFlagModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- MODAL 4: MODE B PHYSICAL GOODS PLEDGE ---------------- */}
      {selectedPhysicalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-[#202124]">
                  Donate Physical Goods (Mode B)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhysicalItem(null)}
                className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {pledgeSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Physical Goods Pledge Recorded!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you! Our warehouse coordinators will track your parcel and verify receipt upon arrival.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePhysicalPledgeSubmit} className="space-y-4 text-xs">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1 text-neutral-700">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    Official Receiving Hub & Instructions
                  </span>
                  <div className="font-bold text-[#202124]">
                    {selectedPhysicalItem.physicalReceivingAddress ||
                      'dokind Central Relief Warehouse, Gate #3, Okhla Phase III, New Delhi - 110020'}
                  </div>
                  <div className="text-[11px] text-neutral-500 pt-1">
                    {selectedPhysicalItem.physicalInstructions ||
                      'Please clearly mark parcels with Campaign Title and Donor Name for tracking.'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#202124]">
                    Quantity of {selectedPhysicalItem.unit} You are Shipping *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pledgeQty}
                    onChange={(e) => setPledgeQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#202124]">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={pledgeName}
                      onChange={(e) => setPledgeName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#202124]">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={pledgeEmail}
                      onChange={(e) => setPledgeEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#202124]">Courier Service</label>
                    <input
                      type="text"
                      value={pledgeCourier}
                      onChange={(e) => setPledgeCourier(e.target.value)}
                      placeholder="e.g. BlueDart / India Post"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#202124]">Courier Tracking / AWB No.</label>
                    <input
                      type="text"
                      value={pledgeTracking}
                      onChange={(e) => setPledgeTracking(e.target.value)}
                      placeholder="e.g. BD-88392109"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPhysicalItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                    Confirm Physical Shipment Pledge
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- MODAL 5: SHARE MODAL ---------------- */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Share this Fundraiser</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#555B63]">
              Every share brings an average of 4 new donors. Help spread the word!
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleShareWhatsApp}
                className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={handleShareTwitter}
                className="p-3 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Share on X (Twitter)</span>
              </button>
            </div>

            <div className="pt-2">
              <label className="text-[11px] text-neutral-500 font-semibold block mb-1">
                Direct Campaign Link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs text-neutral-600 focus:outline-hidden select-all"
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0">
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 6: PHOTO LIGHTBOX ---------------- */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center text-white pb-3">
              <span className="text-xs font-semibold text-neutral-300">Audited Field Photograph Evidence</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Enlarged verification evidence"
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20 bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
