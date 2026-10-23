'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSlide {
  id: string;
  image: string;
  category: string;
  badge: string;
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
    badge: 'AIIMS Verified • 80G Tax Benefit',
    headline: 'Help 4-Year-Old Aarav Defeat Acute Leukemia at AIIMS',
    subtext: 'His rickshaw-driver father has exhausted all savings. Every rupee contributed directly relieves hospital chemotherapy bills and gives Aarav a fighting chance at life.',
    primaryAction: { label: 'Donate to Aarav', href: '/donate/camp-aarav-cancer' },
    secondaryAction: { label: 'Read Medical Story', href: '/campaigns/save-4-year-old-aarav-leukemia-treatment' },
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    category: 'Education & Girl Child',
    badge: 'Verified Grassroots NGO • 100% Retained',
    headline: 'Sponsor Schooling & STEM Digital Learning for 500 Rural Girls',
    subtext: 'Prevent dropouts and child marriage in eastern Uttar Pradesh. Provide durable school backpacks, uniforms, and shared tablet learning hubs for the full academic year.',
    primaryAction: { label: 'Sponsor a Student (₹4,000)', href: '/donate/camp-girl-education-rural' },
    secondaryAction: { label: 'Explore Education Drives', href: '/causes/education' },
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80',
    category: 'Zero Hunger Mission',
    badge: '1,000 Meals Served Daily • Mumbai Hospitals',
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
      timerRef.current = setInterval(nextSlide, 6500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const slide = HERO_SLIDES[current];

  return (
    <section
      aria-label="Featured Urgent Causes"
      className="relative bg-neutral-900 text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Background Slide Image with Dark Gradient Overlay */}
      <div className="relative h-[480px] sm:h-[540px] lg:h-[600px] w-full">
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            aria-hidden={idx !== current}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.headline}
              className="w-full h-full object-cover object-center brightness-[0.4]"
            />
          </div>
        ))}

        {/* Ambient Gradient Overlay for Readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Slide Content */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20">
          <div className="max-w-3xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Category and Verification Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#E84B45] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                {slide.category}
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white/95 text-xs font-medium px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {slide.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {slide.headline}
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl drop-shadow-xs">
              {slide.subtext}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex items-center gap-3 sm:gap-4 flex-wrap">
              <Link href={slide.primaryAction.href}>
                <Button
                  variant="primary"
                  size="lg"
                  className="font-bold shadow-lg shadow-[#E84B45]/40"
                  leftIcon={<Heart className="w-5 h-5 fill-white" />}
                >
                  {slide.primaryAction.label}
                </Button>
              </Link>
              <Link href={slide.secondaryAction.href}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {slide.secondaryAction.label}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all focus:outline-none"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all focus:outline-none"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all focus:outline-none ${
                i === current ? 'w-8 bg-[#E84B45]' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
