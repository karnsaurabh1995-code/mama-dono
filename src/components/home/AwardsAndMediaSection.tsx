'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Award, Sparkles, Newspaper } from 'lucide-react';
import { db } from '@/lib/db';
import { MediaRecognition } from '@/lib/types';
import { DokindMark } from '../common/DokindLogo';

interface AwardsAndMediaSectionProps {
  customItems?: MediaRecognition[];
  className?: string;
  speed?: 'normal' | 'fast' | 'slow';
}

export function AwardsAndMediaSection({
  customItems,
  className = '',
  speed = 'normal',
}: AwardsAndMediaSectionProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Fetch from database or use custom passed items
  const items = customItems || db.getMediaRecognitions({ onlyFeatured: true });

  if (!items || items.length === 0) {
    return null;
  }

  // Duplicate items for infinite seamless CSS marquee loop
  const displayItems = [...items, ...items, ...items];

  const speedDuration = {
    fast: '25s',
    normal: '40s',
    slow: '60s',
  }[speed];

  return (
    <section className={`py-16 sm:py-20 bg-[#FAF9F6] border-b border-[#E8E6E1] overflow-hidden select-none ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0EF] border border-red-100 text-[#EF4949] text-[11px] font-extrabold uppercase tracking-widest mb-2.5">
          <Award className="w-3.5 h-3.5" />
          <span>TRUST & RECOGNITION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
          Featured In National Media
        </h2>
        <p className="text-xs sm:text-sm text-[#555B63] max-w-xl mx-auto mt-1.5 leading-relaxed">
          Leading Indian publications and national broadcast news organizations covering Dokind&apos;s verified item-level transparency and grassroots impact.
        </p>
      </div>

      {/* Continuous Carousel Container */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        role="region"
        aria-label="National Media Recognition Marquee"
      >
        {/* Left and Right Smooth Fade Masks */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#FAF9F6] to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#FAF9F6] to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Marquee Track */}
        <div
          className={`flex items-center gap-5 shrink-0 ${isPaused ? '' : 'animate-marquee'}`}
          style={{
            animationDuration: speedDuration,
            willChange: 'transform',
          }}
        >
          {displayItems.map((item, idx) => {
            const cardContent = (
              <div className="w-[300px] sm:w-[340px] shrink-0 bg-white border border-[#E8E6E1] rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#EF4949]/40 transition-all duration-300 flex flex-col justify-between h-[190px] group text-left">
                {/* Outlet Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    {item.logoUrl ? (
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 p-1">
                        <img
                          src={item.logoUrl}
                          alt={item.outletName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                        <Newspaper className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif font-black text-xs sm:text-sm text-[#202124] tracking-tight group-hover:text-[#EF4949] transition-colors line-clamp-1">
                        {item.outletName}
                      </h4>
                      {item.category && (
                        <span className="text-[10px] text-neutral-400 font-semibold tracking-wide uppercase">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.articleUrl && (
                    <span className="p-1 rounded-lg text-neutral-300 group-hover:text-[#EF4949] transition-colors" title="Read coverage">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Impact Quote */}
                <p className="text-xs sm:text-[13px] text-[#33373D] italic leading-relaxed line-clamp-3 my-auto">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-2 text-[10px] text-neutral-400 font-medium">
                  <span>{item.publishedOn ? `Coverage • ${item.publishedOn}` : 'Verified Press Coverage'}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Verified
                  </span>
                </div>
              </div>
            );

            return (
              <React.Fragment key={`${item.id}-${idx}`}>
                {item.articleUrl ? (
                  <a
                    href={item.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus:outline-hidden"
                  >
                    {cardContent}
                  </a>
                ) : (
                  cardContent
                )}

                {/* Subtle Dokind Red Brand Dot Separator */}
                <div className="inline-flex items-center px-1 text-neutral-300 pointer-events-none" aria-hidden="true">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D91E25]/40" />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
