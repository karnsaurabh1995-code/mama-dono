import React from 'react';
import Link from 'next/link';
import { Campaign } from '@/lib/types';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { formatINR, calculatePercentage } from '@/lib/utils';
import { Users, Clock, ArrowUpRight } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
}

export function CampaignCard({ campaign, featured = false }: CampaignCardProps) {
  const percentage = calculatePercentage(campaign.raisedAmount, campaign.goalAmount);

  return (
    <div className="group bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {campaign.verifiedStatus === 'verified' && (
              <Badge variant="verified" size="sm" className="shadow-xs bg-white/95">
                Verified
              </Badge>
            )}
            {campaign.has80G && (
              <Badge variant="tax80g" size="sm" className="shadow-xs bg-white/95">
                Tax Benefit
              </Badge>
            )}
          </div>

          {campaign.urgent && (
            <Badge variant="urgent" size="sm" className="shadow-xs bg-white/95">
              Urgent
            </Badge>
          )}
        </div>

        {/* Category Pill Bottom Left */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md capitalize">
            {campaign.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Organization / Organizer */}
          <div className="text-xs font-medium text-[#555B63] flex items-center gap-1.5">
            <span className="truncate">by {campaign.organizationName || campaign.organizerName}</span>
          </div>

          {/* Campaign Title */}
          <h3 className="text-base font-bold text-[#202124] line-clamp-2 leading-snug group-hover:text-[#E84B45] transition-colors">
            <Link href={`/campaigns/${campaign.slug}`}>
              {campaign.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#555B63] line-clamp-2 leading-relaxed">
            {campaign.shortDescription}
          </p>
        </div>

        {/* Funding Metrics & Progress */}
        <div className="pt-4 mt-4 border-t border-neutral-100 space-y-2.5">
          {/* Progress Bar */}
          <ProgressBar value={percentage} height="sm" />

          {/* Financial Amounts */}
          <div className="flex items-baseline justify-between text-xs">
            <div>
              <span className="text-base font-bold text-[#202124]">
                {formatINR(campaign.raisedAmount)}
              </span>
              <span className="text-[11px] text-[#555B63] ml-1">
                raised of {formatINR(campaign.goalAmount)}
              </span>
            </div>
            <span className="font-bold text-[#25845B] text-xs">
              {percentage}%
            </span>
          </div>

          {/* Footer Stats: Supporters & Time remaining */}
          <div className="flex items-center justify-between text-[11px] text-[#555B63] pt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span>{campaign.supporterCount} supporters</span>
            </span>

            {campaign.deadline && (
              <span className="flex items-center gap-1 text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Closing soon</span>
              </span>
            )}
          </div>

          {/* Quick CTA Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link href={`/campaigns/${campaign.slug}`} className="w-full">
              <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                View Details
              </Button>
            </Link>
            <Link href={`/donate/${campaign.id}`} className="w-full">
              <Button variant="primary" size="sm" className="w-full justify-center text-xs font-semibold">
                Donate Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
