'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { formatINR, calculatePercentage, formatDate, formatTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
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
} from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const campaign = db.getCampaignBySlug(slug);

  const [activeTab, setActiveTab] = useState<'story' | 'budget' | 'documents' | 'updates'>('story');
  const [selectedAmount, setSelectedAmount] = useState<number>(1001);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
        <Link href="/campaigns">
          <Button variant="primary">Browse Active Campaigns</Button>
        </Link>
      </div>
    );
  }

  const percentage = calculatePercentage(campaign.raisedAmount, campaign.goalAmount);
  const effectiveDonationAmount = customAmount ? Number(customAmount) : selectedAmount;

  // Recent campaign donations
  const recentDonations = db.getDonations({ campaignId: campaign.id, status: 'succeeded' }).slice(0, 5);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Please help support "${campaign.title}" on SevaSetu: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Please help support "${campaign.title}" on @SevaSetuIndia: `);
    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="py-8 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/campaigns" className="hover:text-[#202124]">
            Campaigns
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold truncate max-w-xs">
            {campaign.title}
          </span>
        </nav>

        {/* Campaign Title & Meta Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#FFF0EF] text-[#E84B45] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              {campaign.category.replace('-', ' ')}
            </span>
            {campaign.verifiedStatus === 'verified' && (
              <Badge variant="verified">100% Medical & NGO Verified</Badge>
            )}
            {campaign.has80G && <Badge variant="tax80g">50% Tax Exemption 80G</Badge>}
            {campaign.urgent && <Badge variant="urgent">Urgent Support Needed</Badge>}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#202124] tracking-tight leading-tight">
            {campaign.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-[#555B63] flex-wrap">
            <span>
              Organized by <strong>{campaign.organizationName || campaign.organizerName}</strong>
            </span>
            {campaign.hospitalName && (
              <span className="flex items-center gap-1 text-[#202124] font-medium">
                <Hospital className="w-3.5 h-3.5 text-[#E84B45]" />
                <span>{campaign.hospitalName}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Created {formatDate(campaign.createdAt)}</span>
            </span>
          </div>
        </div>

        {/* Main 2-Column Grid: Content Left, Sticky Donation Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Hero Image, Story, Tabs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Hero Image */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm border border-[#E8E6E1]">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#E8E6E1] bg-white rounded-t-xl px-4 text-xs sm:text-sm font-semibold">
              <button
                onClick={() => setActiveTab('story')}
                className={`py-3.5 px-4 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'story'
                    ? 'border-[#E84B45] text-[#E84B45]'
                    : 'border-transparent text-[#555B63] hover:text-[#202124]'
                }`}
              >
                Story & Cause
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`py-3.5 px-4 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'budget'
                    ? 'border-[#E84B45] text-[#E84B45]'
                    : 'border-transparent text-[#555B63] hover:text-[#202124]'
                }`}
              >
                Itemized Budget ({campaign.itemizedBudget.length})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-3.5 px-4 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'documents'
                    ? 'border-[#E84B45] text-[#E84B45]'
                    : 'border-transparent text-[#555B63] hover:text-[#202124]'
                }`}
              >
                Verification Documents ({campaign.documents?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('updates')}
                className={`py-3.5 px-4 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'updates'
                    ? 'border-[#E84B45] text-[#E84B45]'
                    : 'border-transparent text-[#555B63] hover:text-[#202124]'
                }`}
              >
                Updates & Milestones
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-white p-6 sm:p-8 rounded-b-xl border border-t-0 border-[#E8E6E1] shadow-2xs space-y-6">
              {activeTab === 'story' && (
                <div className="space-y-6 text-[#202124]">
                  {/* Beneficiary Card */}
                  <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                        Beneficiary
                      </span>
                      <strong className="text-sm text-[#202124]">{campaign.beneficiaryName}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                        Location / Hospital
                      </span>
                      <span className="text-xs text-[#202124]">{campaign.beneficiaryLocation}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                        Use of Funds
                      </span>
                      <span className="text-xs text-[#25845B] font-semibold">
                        Direct Hospital / Vendor Disbursement
                      </span>
                    </div>
                  </div>

                  {/* Story Text */}
                  <div className="prose max-w-none text-sm leading-relaxed text-[#404348] whitespace-pre-line space-y-4 font-normal">
                    {campaign.story}
                  </div>
                </div>
              )}

              {activeTab === 'budget' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#202124]">Itemized Medical & Expenditure Budget</h3>
                  <p className="text-xs text-[#555B63]">
                    Every rupee requested is backed by doctor prescription, hospital estimate certificate, or vendor quotations.
                  </p>

                  <div className="divide-y divide-[#E8E6E1] border border-[#E8E6E1] rounded-xl overflow-hidden">
                    {campaign.itemizedBudget.map((b) => (
                      <div key={b.id} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                        <div>
                          <p className="font-semibold text-[#202124]">{b.item}</p>
                          {b.description && (
                            <p className="text-xs text-[#555B63] mt-0.5">{b.description}</p>
                          )}
                        </div>
                        <span className="font-bold text-[#202124] ml-4 text-right shrink-0">
                          {formatINR(b.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="p-4 bg-[#FAF9F6] flex items-center justify-between text-sm font-bold">
                      <span>Total Verified Target</span>
                      <span className="text-[#E84B45] text-base">{formatINR(campaign.goalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#202124]">Verified Medical & Compliance Documents</h3>
                  <p className="text-xs text-[#555B63]">
                    These documents were submitted during campaign onboarding and verified by SevaSetu’s medical social work team.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {campaign.documents?.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-start gap-3"
                      >
                        <div className="p-2 bg-white rounded-lg border border-[#E8E6E1] text-[#E84B45]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#202124] truncate">{doc.title}</p>
                          <span className="text-[11px] text-[#25845B] font-medium flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Directly Verified with AIIMS / Authority</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'updates' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#202124]">Campaign Updates & Medical Milestones</h3>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <p className="font-bold">Latest Milestone: Phase 1 Chemotherapy Initiated</p>
                    <p className="text-emerald-700">
                      Thanks to the first 400 supporters, Aarav has successfully completed cycle 1 chemotherapy with no adverse allergic reactions. Doctors have scheduled cycle 2 next week.
                    </p>
                    <span className="text-[11px] text-emerald-600 block pt-1">
                      Posted by {campaign.organizerName} • 2 days ago
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Supporters List */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#E84B45] fill-[#E84B45]" />
                  <span>Recent Supporters ({campaign.supporterCount})</span>
                </h3>
                <span className="text-xs text-[#555B63]">Real community donors</span>
              </div>

              <div className="divide-y divide-[#E8E6E1]">
                {recentDonations.map((don) => (
                  <div key={don.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#202124]">
                        {don.isAnonymous ? 'Generous Well Wisher' : don.donorName}
                      </p>
                      {don.message && (
                        <p className="text-[#555B63] italic font-normal">"{don.message}"</p>
                      )}
                      <p className="text-[10px] text-neutral-400">{formatTimeAgo(don.createdAt)}</p>
                    </div>
                    <span className="font-bold text-[#25845B] shrink-0 text-sm">
                      {formatINR(don.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Donation Widget */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#E8E6E1] p-6 shadow-md space-y-5">
              {/* Financial Progress Box */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-[#202124]">
                    {formatINR(campaign.raisedAmount)}
                  </span>
                  <span className="text-xs text-[#25845B] font-bold">
                    {percentage}% of {formatINR(campaign.goalAmount)}
                  </span>
                </div>
                <ProgressBar value={percentage} height="md" />

                <div className="flex justify-between text-xs text-[#555B63] pt-1">
                  <span>{campaign.supporterCount} Donors</span>
                  {campaign.deadline && <span>Deadline: {formatDate(campaign.deadline)}</span>}
                </div>
              </div>

              {/* Tax 80G Highlight Banner */}
              {campaign.has80G && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your donation is eligible for <strong>50% Tax Deduction</strong> under Section 80G.
                  </span>
                </div>
              )}

              {/* Amount Selection Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#202124] block">
                  Select Donation Amount (INR):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[251, 501, 1001, 2501, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-[#E84B45] text-white border-[#E84B45] shadow-xs'
                          : 'bg-[#FAF9F6] text-[#202124] border-[#E8E6E1] hover:border-[#D5D1C8]'
                      }`}
                    >
                      {formatINR(amt)}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Field */}
                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#555B63]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                    }}
                    placeholder="Other custom amount"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E84B45]"
                  />
                </div>
              </div>

              {/* Primary Donate CTA */}
              <Link
                href={`/donate/${campaign.id}?amount=${effectiveDonationAmount || 1001}`}
                className="block w-full"
              >
                <Button variant="primary" size="lg" className="w-full justify-center font-bold text-base shadow-md">
                  <span>Donate {formatINR(effectiveDonationAmount || 1001)}</span>
                </Button>
              </Link>

              {/* Share Button & Modal trigger */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E8E6E1] hover:bg-[#FAF9F6] text-xs font-semibold text-[#202124] transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#E84B45]" />
                <span>Share Fundraiser with Friends</span>
              </button>

              {/* Security & Payment Icons */}
              <div className="pt-2 text-center text-[11px] text-neutral-400 space-y-1 border-t border-neutral-100">
                <p>🔒 256-bit Bank Grade Encrypted Razorpay Checkout</p>
                <p>UPI • Cards • Net Banking • Section 80G Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Share this Fundraiser</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm"
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
                className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={handleShareTwitter}
                className="p-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs text-neutral-600 focus:outline-none select-all"
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0">
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
