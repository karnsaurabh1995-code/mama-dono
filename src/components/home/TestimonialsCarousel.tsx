'use client';

import React, { useState, useRef } from 'react';
import { Testimonial } from '@/lib/types';
import { Quote, ChevronLeft, ChevronRight, Star, BadgeCheck } from 'lucide-react';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function TestimonialsCarousel({ testimonials, title, subtitle, badge }: TestimonialsCarouselProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!testimonials || testimonials.length === 0) return null;

  const handlePrev = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-white border-b border-[#E8E6E1] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Prev/Next Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1.5 rounded-full inline-block mb-2 border border-[#FEE2E2]">
              {badge || 'STORIES OF TRUST'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#202124] tracking-tight">
              {title || 'Loved by Donors, Doctors & Beneficiaries'}
            </h2>
            <p className="text-xs sm:text-sm text-[#555B63] mt-1 max-w-xl">
              {subtitle || 'Real reflections from compassionate individuals and medical professionals who trust dokind every day.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonials"
              className="w-10 h-10 rounded-full border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonials"
              className="w-10 h-10 rounded-full border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Shifting Row */}
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="w-[320px] sm:w-[380px] shrink-0 snap-start bg-[#FAF9F6] rounded-2xl p-6 sm:p-7 border border-[#E8E6E1] hover:border-neutral-300 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#EF4949]/30" />
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-[#404348] leading-relaxed line-clamp-4 font-normal italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-6 mt-4 border-t border-[#E8E6E1] flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                  {t.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatarUrl} alt={t.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#EF4949] text-white flex items-center justify-center font-bold text-xs">
                      {t.authorName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-[#202124] truncate">{t.authorName}</h4>
                    {t.badge && (
                      <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm font-semibold shrink-0">
                        <BadgeCheck className="w-3 h-3 mr-0.5" />
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#555B63] truncate">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
