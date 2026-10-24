'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Donation } from '@/lib/types';
import { formatINR, formatTimeAgo } from '@/lib/utils';
import { Heart, ShieldCheck, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface LiveDonationCarouselProps {
  donations: Donation[];
}

export function LiveDonationCarousel({ donations }: LiveDonationCarouselProps) {
  // Only display genuine succeeded verified donations
  const verifiedDonations = donations.filter((d) => d.status === 'succeeded');
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const displayCount = 3; // Number of items visible simultaneously on desktop

  const handleNext = () => {
    if (verifiedDonations.length <= 1) return;
    setStartIndex((prev) => (prev + 1) % verifiedDonations.length);
  };

  const handlePrev = () => {
    if (verifiedDonations.length <= 1) return;
    setStartIndex((prev) => (prev - 1 + verifiedDonations.length) % verifiedDonations.length);
  };

  useEffect(() => {
    if (!isPaused && verifiedDonations.length > 1) {
      timerRef.current = setInterval(handleNext, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, verifiedDonations.length]);

  if (verifiedDonations.length === 0) return null;

  // Window of items to display
  const visibleItems = [];
  for (let i = 0; i < Math.min(displayCount, verifiedDonations.length); i++) {
    const idx = (startIndex + i) % verifiedDonations.length;
    visibleItems.push(verifiedDonations[idx]);
  }

  return (
    <div
      className="w-full bg-[#18191B] text-white border-y border-neutral-800/80 shadow-md my-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Lead Pill & Header */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4949] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EF4949]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Live Giving Feed
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Verified 80G
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Real-time contributions reaching Indian grassroots beneficiaries
              </p>
            </div>
          </div>

          {/* Center: Live Donation Strip Cards */}
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleItems.map((d) => (
                <div
                  key={d.id}
                  className="bg-neutral-900/90 border border-neutral-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 hover:border-neutral-700 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#EF4949]/15 text-[#EF4949] flex items-center justify-center shrink-0">
                      <Heart className="w-3.5 h-3.5 fill-[#EF4949]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {d.isAnonymous ? 'Anonymous Donor' : d.donorName}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-[140px] sm:max-w-[170px]">
                        {d.campaignTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-emerald-400 font-mono">
                      {formatINR(d.amount)}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {formatTimeAgo(d.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Carousel Navigation Controls */}
          {verifiedDonations.length > displayCount && (
            <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous donation"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next donation"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
