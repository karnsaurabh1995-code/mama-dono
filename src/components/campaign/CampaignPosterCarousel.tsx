'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Layers } from 'lucide-react';
import { CampaignBadgeGroup } from './CampaignBadge';
import { Campaign } from '@/lib/types';

interface CampaignPosterCarouselProps {
  campaign: Campaign;
  posters: string[];
  onOpenLightbox?: (url: string) => void;
}

export function CampaignPosterCarousel({
  campaign,
  posters,
  onOpenLightbox,
}: CampaignPosterCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validPosters = posters && posters.length > 0 ? posters : [campaign.imageUrl];
  const hasMultiple = validPosters.length > 1;

  const nextPoster = () => {
    setCurrentIdx((prev) => (prev === validPosters.length - 1 ? 0 : prev + 1));
  };

  const prevPoster = () => {
    setCurrentIdx((prev) => (prev === 0 ? validPosters.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!isPaused && hasMultiple) {
      timerRef.current = setInterval(nextPoster, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, hasMultiple, validPosters.length]);

  return (
    <div className="space-y-3">
      {/* 1. Main Interactive Poster Window */}
      <div
        className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-neutral-900 shadow-md border border-[#E8E6E1] group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Slides rendering with crossfade */}
        {validPosters.map((url, idx) => (
          <div
            key={idx}
            aria-hidden={idx !== currentIdx}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out cursor-pointer ${
              idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => onOpenLightbox?.(url)}
            title="Click to view full-size poster & medical documents"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${campaign.title} - Poster ${idx + 1}`}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Badges Overlay at Top Left of Image */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20 pointer-events-none">
          <CampaignBadgeGroup
            campaign={campaign}
            variant="detail"
            includeCategory={true}
          />
        </div>

        {/* Counter Badge at Top Right (e.g. "Poster 1 of 3") */}
        {hasMultiple && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xs">
              <Layers className="w-3 h-3 text-[#EF4949]" />
              <span>Poster {currentIdx + 1} of {validPosters.length}</span>
            </span>
          </div>
        )}

        {/* Bottom Expand to Fullscreen Lightbox Button */}
        <button
          type="button"
          onClick={() => onOpenLightbox?.(validPosters[currentIdx])}
          className="absolute bottom-4 right-4 z-20 bg-black/60 hover:bg-black/85 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg cursor-pointer"
          title="Inspect high-resolution poster"
          aria-label="Enlarge campaign poster"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Left & Right Chevron Controls */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevPoster();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#EF4949] opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
              aria-label="Previous campaign poster"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextPoster();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#EF4949] opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
              aria-label="Next campaign poster"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Carousel Indicator Pills */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {validPosters.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(i);
                }}
                className={`h-1.5 rounded-full transition-all focus:outline-none cursor-pointer ${
                  i === currentIdx ? 'w-6 bg-[#EF4949]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Jump to campaign poster ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Thumbnail Strip (Allows 1-Click Jump to Any of the 2-3 Posters) */}
      {hasMultiple && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {validPosters.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`relative aspect-[16/10] w-20 sm:w-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                idx === currentIdx
                  ? 'border-[#EF4949] ring-2 ring-[#EF4949]/30 scale-102'
                  : 'border-[#E8E6E1] opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Thumbnail poster ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-0.5 right-1 bg-black/70 text-[9px] font-mono text-white px-1 rounded-sm">
                #{idx + 1}
              </span>
            </button>
          ))}
          <div className="text-[11px] text-[#72777F] pl-1 font-medium hidden sm:block">
            Tap poster to enlarge or cycle through 2–3 campaign artworks
          </div>
        </div>
      )}
    </div>
  );
}
