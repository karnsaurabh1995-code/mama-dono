'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export function PreviewHeroCarousel() {
  const slides = [
    {
      id: 'slide-1',
      badge: 'URGENT MEDICAL AID',
      verification: '100% Medical Verified',
      title: 'Save 4-Year-Old Aarav: Urgent Chemotherapy & Bone Marrow Transplant',
      description:
        'Aarav is fighting acute lymphoblastic leukemia. His daily wage laborer parents have exhausted their life savings. Immediate hospital funding is required.',
      image:
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80',
      ctaUrl: '/design-preview/campaign',
    },
    {
      id: 'slide-2',
      badge: 'CHILD EDUCATION',
      verification: 'Partner NGO Audited',
      title: 'Digital Classrooms & STEM Labs for 500 Rural Girl Students',
      description:
        'Help bridge the digital divide in remote eastern Uttar Pradesh with solar tablets, science kits, and qualified female mentors.',
      image:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
      ctaUrl: '/design-preview/campaign',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section
      data-component="PreviewHeroCarousel"
      className="relative bg-[#202124] text-white overflow-hidden min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center"
    >
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover object-center filter brightness-[0.78] transition-all duration-700"
        />
        {/* Directional Shading: deep rich shadow on left where text sits, preserving bright photography on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="max-w-2xl space-y-5">
          {/* Aligned Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full bg-[#EF4949] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              {slide.badge}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{slide.verification}</span>
            </span>
          </div>

          {/* Headline with High Contrast */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-sm">
            {slide.title}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm lg:text-base text-neutral-200 leading-relaxed max-w-xl font-normal drop-shadow-xs">
            {slide.description}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link href={slide.ctaUrl}>
              <Button
                size="lg"
                className="bg-[#EF4949] hover:bg-[#D93838] text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition transform hover:scale-102"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Donate Now</span>
              </Button>
            </Link>

            <Link href="/campaigns">
              <Button
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/15 backdrop-blur-sm font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition"
              >
                <span>Explore All Causes</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-xs font-mono font-bold text-white px-2">
          0{currentSlide + 1} / 0{slides.length}
        </div>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
