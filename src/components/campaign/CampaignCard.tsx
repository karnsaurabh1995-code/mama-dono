'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Campaign } from '@/lib/types';
import { Badge } from '../ui/Badge';
import { CampaignBadgeGroup } from './CampaignBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { formatINR, calculatePercentage } from '@/lib/utils';
import { Users, Share2, Check, Heart } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
}

export function CampaignCard({ campaign, featured = false }: CampaignCardProps) {
  const router = useRouter();
  const [shared, setShared] = useState(false);

  const netRaised = campaign.netRaisedAmount || Math.round(campaign.raisedAmount * 0.95);
  const percentage = calculatePercentage(netRaised, campaign.goalAmount);

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked directly on a button or link, don't double navigate
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/campaigns/${campaign.slug}`);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/campaigns/${campaign.slug}`
        : `https://dokind.org.in/campaigns/${campaign.slug}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `Support this verified fundraiser on dokind: ${campaign.title}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was cancelled or denied
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 2200);
      } catch (err) {}
    }
  };

  const handleDonateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          router.push(`/campaigns/${campaign.slug}`);
        }
      }}
      className="group bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EF4949]/30"
    >
      {/* 1. Prioritized Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges Overlay (Admin-Managed Appearance & Factual Eligibility) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <CampaignBadgeGroup campaign={campaign} variant="card" includeCategory={false} />
        </div>

        {/* Category Pill Bottom Left */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="bg-black/65 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize">
            {campaign.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* 2. Simplified Content Body: Prominent Headline & Net Progress */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Organization / Organizer Label */}
          <div className="text-xs font-semibold text-[#555B63] truncate pb-1">
            by {campaign.organizationName || campaign.organizerName}
          </div>

          {/* Larger Prominent Headline */}
          <h3 className="text-base sm:text-lg font-bold text-[#202124] line-clamp-2 leading-snug group-hover:text-[#EF4949] transition-colors">
            {campaign.title}
          </h3>
        </div>

        {/* Funding Metrics & Net Raised Progress Bar */}
        <div className="space-y-2.5 pt-2 border-t border-neutral-100">
          <ProgressBar value={percentage} height="sm" />

          {/* Financial Amounts (Reflecting Net Raised) */}
          <div className="flex items-baseline justify-between text-xs">
            <div>
              <span className="text-base font-extrabold text-[#202124] font-mono">
                {formatINR(netRaised)}
              </span>
              <span className="text-[11px] text-[#555B63] ml-1">
                net raised of {formatINR(campaign.goalAmount)}
              </span>
            </div>
            <span className="font-bold text-[#25845B] text-xs font-mono">
              {percentage}%
            </span>
          </div>

          {/* Supporters Count */}
          <div className="flex items-center text-[11px] text-[#555B63] pt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span>{campaign.supporterCount} supporters</span>
            </span>
          </div>

          {/* Actions: Prominent Share Button & Donate Now Button */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleShareClick}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                shared
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-[#FAF9F6] text-[#202124] border-[#E8E6E1] hover:bg-neutral-100'
              }`}
              title="Share this campaign with family & friends"
            >
              {shared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#555B63]" />
                  <span>Share</span>
                </>
              )}
            </button>

            <Link
              href={`/donate/${campaign.id}`}
              onClick={handleDonateClick}
              className="w-full inline-flex items-center justify-center text-xs font-bold bg-[#EF4949] hover:bg-[#D9363E] text-white rounded-xl shadow-xs py-2 px-3 transition-colors cursor-pointer"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
