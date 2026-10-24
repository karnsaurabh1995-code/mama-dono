'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  image: string;
  category: string;
  isVerified: boolean;
  verificationBadgeText?: string;
  headline: string;
  subtext: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80',
    category: 'Urgent Medical Emergency',
    isVerified: true,
    verificationBadgeText: 'AIIMS Verified • 80G Tax Benefit',
    headline: 'Help 4-Year-Old Aarav Defeat Acute Leukemia at AIIMS',
    subtext: 'His rickshaw-driver father has exhausted all family savings. Every rupee contributed directly relieves hospital chemotherapy bills and gives Aarav a fighting chance at life.',
    primaryAction: { label: 'Donate to Aarav', href: '/donate/camp-aarav-cancer' },
    secondaryAction: { label: 'Read Medical Story', href: '/campaigns/save-4-year-old-aarav-leukemia-treatment' },
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    category: 'Education & Girl Child',
    isVerified: true,
    verificationBadgeText: 'Verified Grassroots NGO • 100% Retained',
    headline: 'Sponsor Schooling & STEM Digital Learning for 500 Rural Girls',
    subtext: 'Prevent dropouts and child marriage in eastern Uttar Pradesh. Provide durable school backpacks, uniforms, and shared tablet learning hubs for the full academic year.',
    primaryAction: { label: 'Sponsor a Student (₹4,000)', href: '/donate/camp-girl-education-rural' },
    secondaryAction: { label: 'Explore Education Drives', href: '/causes/education' },
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80',
    category: 'Zero Hunger Mission',
    isVerified: true,
    verificationBadgeText: '1,000 Meals Daily • Municipal Hospitals',
    headline: 'Serve Daily Hot Wholesome Meals to Impoverished Hospital Attendants',
    subtext: 'Families sleeping on footpaths outside Mumbai cancer hospitals should never endure hunger while caring for critical patients. At ₹35 per hot meal, you can feed hope.',
    primaryAction: { label: 'Feed Today (₹350 for 10 Meals)', href: '/donate/camp-hunger-mumbai-hospital' },
    secondaryAction: { label: 'Join Monthly Food Circle', href: '/monthly-giving' },
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrent((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 7000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const slide = HERO_SLIDES[current];

  return (
    <div className="w-full max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <section
        aria-label="Featured Urgent Causes Carousel"
        className="relative bg-[#18191B] text-white rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-neutral-800/80"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Split-Panel Composition: Left Charcoal Text Panel + Right Photographic Panel with True Hope diagonal division */}
        <div className="flex flex-col md:flex-row min-h-[540px] md:min-h-[560px] lg:min-h-[580px] xl:min-h-[620px] w-full items-stretch">
          {/* Left Solid Charcoal Text Panel (~48% desktop width, generous breathing room) */}
          <div className="w-full md:w-1/2 lg:w-[48%] shrink-0 flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 z-20 relative bg-[#18191B] order-2 md:order-1">
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-500">
              {/* Badges: Category & Verification */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-[#EF4949] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
                  {slide.category}
                </span>

                {slide.isVerified && slide.verificationBadgeText && (
                  <span className="bg-white/10 backdrop-blur-md text-white/95 text-[11px] sm:text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{slide.verificationBadgeText}</span>
                  </span>
                )}
              </div>

              {/* Crisp pure white headline with guaranteed high contrast (True Hope prominent typography) */}
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px] font-black !text-white tracking-tight leading-[1.18] drop-shadow-xs max-w-xl">
                {slide.headline}
              </h1>

              {/* Subtext with high-contrast neutral tone */}
              <p className="text-xs sm:text-sm md:text-sm lg:text-base text-neutral-200 leading-relaxed font-normal max-w-lg">
                {slide.subtext}
              </p>

              {/* Primary & Secondary Hero CTAs */}
              <div className="pt-2 sm:pt-4 flex items-center gap-3 sm:gap-4 flex-wrap">
                <Link
                  href={slide.primaryAction.href}
                  className="inline-flex items-center justify-center gap-2 font-bold bg-[#EF4949] hover:bg-[#D9363E] text-white rounded-full px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm shadow-xl shadow-[#EF4949]/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white shrink-0" />
                  <span>{slide.primaryAction.label}</span>
                </Link>

                <Link
                  href={slide.secondaryAction.href}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-sm rounded-full px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                >
                  <span>{slide.secondaryAction.label}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>
            </div>

            {/* Slide Pagination & Indicators */}
            <div className="pt-6 sm:pt-8 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all focus:outline-none cursor-pointer ${
                      i === current ? 'w-8 bg-[#EF4949]' : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Switch to campaign slide ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono tracking-wider text-neutral-400">
                0{current + 1} / 0{HERO_SLIDES.length}
              </span>
            </div>
          </div>

          {/* Right Photographic Panel: Stretches full height, True Hope diagonal edge */}
          <div className="w-full md:w-1/2 lg:w-[54%] xl:w-[56%] min-h-[300px] sm:min-h-[380px] md:min-h-[500px] lg:min-h-[580px] xl:min-h-[620px] self-stretch relative overflow-hidden order-1 md:order-2 md:-ml-[2%] md:[clip-path:polygon(4%_0,100%_0,100%_100%,0%_100%)]">
            {HERO_SLIDES.map((s, idx) => (
              <div
                key={s.id}
                aria-hidden={idx !== current}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === current ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img
                  src={s.image}
                  alt={s.headline}
                  className="w-full h-full object-cover object-center brightness-[0.95] scale-100 transition-transform duration-700 ease-out"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                {/* Mobile overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#18191B] via-transparent to-transparent md:hidden" />
              </div>
            ))}

            {/* Desktop Next Slide Hint */}
            <div className="hidden xl:flex absolute bottom-8 right-10 z-30 items-center gap-3 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl max-w-xs transition-opacity shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#EF4949]">Next</span>
              <div className="text-xs text-white truncate max-w-[170px]">
                {HERO_SLIDES[(current + 1) % HERO_SLIDES.length].headline}
              </div>
              <button
                onClick={nextSlide}
                className="text-white hover:text-[#EF4949] transition-colors p-1 cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Centered Circular Previous / Next Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#EF4949] shadow-xl cursor-pointer"
          aria-label="Previous campaign slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#EF4949] shadow-xl cursor-pointer"
          aria-label="Next campaign slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </section>
    </div>
  );
}
