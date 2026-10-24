import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { ShieldCheck, Heart, MapPin, Package } from 'lucide-react';

export interface PreviewCampaignProps {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  raisedAmount: number;
  goalAmount: number;
  supporterCount: number;
  beneficiaryLocation?: string;
  hasProductGiving?: boolean;
}

export function PreviewCampaignCard({
  id,
  title,
  category,
  imageUrl,
  raisedAmount,
  goalAmount,
  supporterCount,
  beneficiaryLocation = 'New Delhi',
  hasProductGiving = true,
}: PreviewCampaignProps) {
  const percentage = Math.min(100, Math.round((raisedAmount / goalAmount) * 100));

  return (
    <div
      data-component="PreviewCampaignCard"
      className="bg-white rounded-3xl border border-[#E8E6E1] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Card Artwork */}
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
              {category}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>

          {hasProductGiving && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-emerald-800 flex items-center gap-1 shadow-xs">
              <Package className="w-3 h-3 text-emerald-600" />
              <span>Items Needed</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <MapPin className="w-3.5 h-3.5 text-[#EF4949]" />
            <span>{beneficiaryLocation}</span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-[#202124] leading-snug line-clamp-2 group-hover:text-[#EF4949] transition-colors">
            <Link href="/design-preview/campaign">{title}</Link>
          </h3>

          {/* Progress Bar & Amount */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-700 font-mono font-bold">
                {formatINR(raisedAmount)}
              </span>
              <span className="text-neutral-500 text-[11px]">
                {percentage}% of {formatINR(goalAmount)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-[#EF4949] rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[11px] text-neutral-400 pt-0.5">
              {supporterCount} Donors Supporting
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0">
        <Link href="/design-preview/campaign" className="block w-full">
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-[#FAF9F6] group-hover:bg-[#EF4949] border border-[#E8E6E1] group-hover:border-[#EF4949] text-neutral-800 group-hover:text-white text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Donate Now</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
