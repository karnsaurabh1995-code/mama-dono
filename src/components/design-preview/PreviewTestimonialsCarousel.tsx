'use client';

import React, { useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star, BadgeCheck } from 'lucide-react';

export function PreviewTestimonialsCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      id: 't-1',
      authorName: 'Dr. Suresh Sen, Chief Cardiac Surgeon',
      role: 'AIIMS Child Heart Centre',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      quote: 'dokind has eliminated critical delays for underprivileged children requiring emergency heart surgery. Funds reach the hospital account directly before surgical procedures commence.',
      rating: 5,
      badge: 'Verified Surgeon',
    },
    {
      id: 't-2',
      authorName: 'Kiran Bedi Verma',
      role: 'Regular Monthly Donor (Bengaluru)',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      quote: 'Receiving instant Form 10BE tax receipts and verified video updates of rural children receiving notebooks and meals gives me 100% confidence in my monthly pledge.',
      rating: 5,
      badge: 'Monthly Donor',
    },
    {
      id: 't-3',
      authorName: 'Aarav’s Father, Ramesh',
      role: 'Beneficiary Caregiver',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      quote: 'When my 3-year-old son collapsed with cardiac failure, I had no money. 2,400 compassionate donors on dokind funded his surgery within 48 hours. He is now healthy and smiling.',
      rating: 5,
      badge: 'Caregiver',
    },
    {
      id: 't-4',
      authorName: 'Meenakshi Sundaram',
      role: 'Animal Welfare Trust Founder',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      quote: 'The item-based giving model on dokind allowed us to receive 150 bags of veterinary feed directly at our trauma sanctuary without worrying about procurement shortages.',
      rating: 5,
      badge: 'Partner NGO',
    },
  ];

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
    <section
      data-component="PreviewTestimonialsCarousel"
      className="py-20 bg-white border-b border-[#E8E6E1] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1.5 rounded-full inline-block mb-2 border border-[#FEE2E2]">
              STORIES OF TRUST
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#202124] tracking-tight">
              Loved by Donors, Doctors & Beneficiaries
            </h2>
            <p className="text-xs sm:text-sm text-[#555B63] mt-1 max-w-xl">
              Real reflections from compassionate individuals and medical professionals who trust dokind every day.
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

        {/* Horizontal Row */}
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="w-[320px] sm:w-[380px] shrink-0 snap-start bg-[#FAF9F6] rounded-3xl p-6 sm:p-7 border border-[#E8E6E1] hover:border-neutral-300 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#EF4949]/30" />
                </div>

                <p className="text-xs sm:text-sm text-[#404348] leading-relaxed line-clamp-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-[#E8E6E1] flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatarUrl} alt={t.authorName} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-[#202124] truncate">{t.authorName}</h4>
                    <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm font-semibold shrink-0">
                      <BadgeCheck className="w-3 h-3 mr-0.5" />
                      {t.badge}
                    </span>
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
