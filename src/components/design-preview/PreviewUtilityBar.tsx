import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, User } from 'lucide-react';

export function PreviewUtilityBar() {
  return (
    <div
      data-component="PreviewUtilityBar"
      className="bg-[#FAF9F6] border-b border-[#E8E6E1] text-[#555B63] text-xs py-2 px-4 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left message */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-medium text-[#202124] text-[11px] sm:text-xs">
            100% Direct Medical & Cause Assistance • Zero Platform Fee for Emergencies
          </span>
        </div>

        {/* Right utility links */}
        <div className="flex items-center gap-4 text-[11px] sm:text-xs font-semibold">
          <Link
            href="/causes/medical"
            className="hidden sm:inline-flex items-center gap-1 hover:text-[#EF4949] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hospital Verified</span>
          </Link>

          <Link
            href="/start-campaign"
            className="hover:text-[#EF4949] transition-colors font-bold"
          >
            Start a Fundraiser
          </Link>

          <Link
            href="/design-preview/campaign"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4949] text-white hover:bg-[#D93838] transition font-bold shadow-2xs"
          >
            <Heart className="w-3 h-3 fill-white" />
            <span>Donate Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
