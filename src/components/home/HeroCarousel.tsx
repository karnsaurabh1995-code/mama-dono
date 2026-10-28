'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { Campaign } from '@/lib/types';

export interface HeroSlide {
  id: string;
  campaignUrl: string;
  image: string;
  category: string;
  isVerified: boolean;
  verificationBadgeText?: string;
  headline: string;
  subtext: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'camp-aarav-cancer',
    campaignUrl: '/campaigns/save-4-year-old-aarav-leukemia-treatment',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80',
    category: 'Urgent Medical Emergency',
    isVerified: true,
    verificationBadgeText: 'AIIMS Verified • Tax Benefits',
    headline: 'Help 4-Year-Old Aarav Defeat Acute Leukemia at AIIMS',
    subtext: 'His rickshaw-driver father has exhausted all family savings. Every rupee contributed directly relieves hospital chemotherapy bills and gives Aarav a fighting chance at life.',
    primaryAction: { label: 'Donate to Aarav', href: '/donate/camp-aarav-cancer' },
    secondaryAction: { label: 'Read Medical Story', href: '/campaigns/save-4-year-old-aarav-leukemia-treatment' },
  },
  {
    id: 'camp-girl-education-rural',
    campaignUrl: '/campaigns/sponsor-schooling-digital-labs-500-rural-girls',
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
    id: 'camp-hunger-mumbai-hospital',
    campaignUrl: '/campaigns/feed-1000-cancer-patient-attendants-mumbai',
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

interface HeroCarouselProps {
  initialCampaigns?: Campaign[];
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  settings?: Record<string, any>;
}

/**
 * Calculates perceived relative luminance to enforce WCAG AA text contrast.
 * Returns true if the hex color provides sufficient dark contrast for white foreground text.
 */
function isSafeDarkBackground(hex?: string): boolean {
  if (!hex || typeof hex !== 'string') return true;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return true;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return true;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum <= 0.40; // True only for dark surfaces with >= 4.5:1 contrast against white
}

export function HeroCarousel({
  initialCampaigns,
  title,
  subtitle,
  badge,
  ctaText,
  ctaLink,
  settings,
}: HeroCarouselProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe / drag tracking refs
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const swipeDelta = useRef(0);
  const isDragging = useRef(false);

  // Transform campaigns into curated slides, or fall back to default slides
  const baseSlides: HeroSlide[] =
    initialCampaigns && initialCampaigns.length > 0
      ? initialCampaigns.map((camp) => ({
          id: camp.id,
          campaignUrl: `/campaigns/${camp.slug}`,
          image: camp.imageUrl,
          category: camp.category.replace('-', ' '),
          isVerified: camp.verifiedStatus === 'verified',
          verificationBadgeText: camp.has80G
            ? 'Verified • Tax Benefits'
            : 'Verified Fundraiser',
          headline: camp.title,
          subtext: camp.shortDescription,
          primaryAction: {
            label: 'Donate Now',
            href: `/donate/${camp.id}`,
          },
          secondaryAction: {
            label: 'View Campaign',
            href: `/campaigns/${camp.slug}`,
          },
        }))
      : DEFAULT_HERO_SLIDES;

  // Apply configured hero section overrides from Website Builder to the lead slide
  const slides: HeroSlide[] = baseSlides.map((s, idx) => {
    if (idx === 0) {
      return {
        ...s,
        headline: title && title.trim() ? title.trim() : s.headline,
        subtext: subtitle && subtitle.trim() ? subtitle.trim() : s.subtext,
        verificationBadgeText: badge && badge.trim() ? badge.trim() : s.verificationBadgeText,
        primaryAction: {
          label: ctaText && ctaText.trim() ? ctaText.trim() : s.primaryAction.label,
          href: ctaLink && ctaLink.trim() ? ctaLink.trim() : s.primaryAction.href,
        },
      };
    }
    return s;
  });

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      timerRef.current = setInterval(nextSlide, 7000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length, nextSlide]);

  const slide = slides[current] || slides[0];

  // Direct slide navigation handler: Clicking or tapping anywhere on the carousel navigates to campaign page
  const handleSlideClick = (e: React.MouseEvent) => {
    // If this was a swipe/drag gesture, don't navigate
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    const target = e.target as HTMLElement;
    // Allow interactive buttons, links to execute their default action without conflict
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(slide.campaignUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('a')) {
        e.preventDefault();
        router.push(slide.campaignUrl);
      }
    }
  };

  // --- Touch swipe handlers ---
  const SWIPE_THRESHOLD = 50; // Minimum px to register as a swipe

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
    swipeDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    swipeDelta.current = e.touches[0].clientX - swipeStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeDelta.current) > SWIPE_THRESHOLD) {
      isDragging.current = true;
      if (swipeDelta.current < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    swipeStartX.current = null;
    swipeStartY.current = null;
    swipeDelta.current = 0;
  };

  // --- Mouse drag handlers (desktop swipe) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't capture drags on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    swipeStartX.current = e.clientX;
    swipeDelta.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (swipeStartX.current === null) return;
    swipeDelta.current = e.clientX - swipeStartX.current;
  };

  const handleMouseUp = () => {
    if (swipeStartX.current !== null && Math.abs(swipeDelta.current) > SWIPE_THRESHOLD) {
      isDragging.current = true;
      if (swipeDelta.current < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    swipeStartX.current = null;
    swipeDelta.current = 0;
  };

  // Contrast safe-fallback: only honor custom bgColor if it is a verified dark surface.
  // Light values like #FAF9F6 or #FFFFFF fall back to the structural deep black/charcoal gradient.
  const hasCustomDarkBg = isSafeDarkBackground(settings?.bgColor);
  const baseBgColor = hasCustomDarkBg && settings?.bgColor ? settings.bgColor : '#0A0A0C';

  return (
    <div className="w-full max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <section
        aria-label="Featured Urgent Causes Carousel"
        role="link"
        tabIndex={0}
        onClick={handleSlideClick}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsPaused(false);
          // Cancel any in-progress drag if mouse leaves
          if (swipeStartX.current !== null) {
            swipeStartX.current = null;
            swipeDelta.current = 0;
          }
        }}
        className="relative text-white rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-neutral-800/80 cursor-pointer group focus:outline-none focus:ring-3 focus:ring-[#EF4949] transition-all min-h-[520px] sm:min-h-[560px] md:min-h-[580px] lg:min-h-[600px] xl:min-h-[620px] flex items-center select-none"
        style={{ backgroundColor: baseBgColor }}
        onMouseEnter={() => setIsPaused(true)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        title="Swipe or tap to navigate campaigns"
      >
        {/* 1. Full-Canvas Photographic Background Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              aria-hidden={idx !== current}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                idx === current ? 'opacity-100 z-0' : 'opacity-0 z-0'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.headline}
                className="w-full h-full object-cover object-center lg:object-[center_right] brightness-[0.92] scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                loading={idx === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* 2. Seamless Cinematic Gradients for Guaranteed Readability & Contrast
             - Desktop: Horizontal deep black on left (96%) fading smoothly to transparent/dim on right (0-15%)
             - Mobile: Vertical dark gradient from bottom/middle to ensure clear contrast across all viewports
        */}
        <div
          className="absolute inset-0 pointer-events-none z-10 hidden md:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(10,10,12,0.97) 0%, rgba(10,10,12,0.92) 36%, rgba(10,10,12,0.68) 56%, rgba(10,10,12,0.28) 76%, rgba(10,10,12,0.05) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-10 md:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,12,0.45) 0%, rgba(10,10,12,0.85) 45%, rgba(10,10,12,0.98) 85%)',
          }}
        />

        {/* 3. Text & Call-to-Action Content Panel (Left-aligned, high contrast) */}
        <div className="relative z-20 w-full md:w-3/5 lg:w-[54%] xl:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-between min-h-[520px] sm:min-h-[560px] md:min-h-[580px] lg:min-h-[600px] xl:min-h-[620px]">
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-500 my-auto pt-6 md:pt-0">
            {/* Badges: Category & Verification */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-[#EF4949] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
                {slide.category}
              </span>

              {slide.isVerified && slide.verificationBadgeText && (
                <span className="bg-white/15 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/25 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{slide.verificationBadgeText}</span>
                </span>
              )}
            </div>

            {/* Crisp Pure White Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px] font-black text-white tracking-tight leading-[1.18] drop-shadow-md max-w-xl group-hover:text-[#FFF0EF] transition-colors">
              {slide.headline}
            </h1>

            {/* Subtext with High-Contrast Neutral-200 Tone */}
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-neutral-200 leading-relaxed font-normal max-w-lg drop-shadow-xs">
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
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm rounded-full px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              >
                <span>{slide.secondaryAction.label}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Slide Pagination Indicators */}
          <div className="pt-6 sm:pt-8 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`h-2 rounded-full transition-all focus:outline-none cursor-pointer ${
                  i === current ? 'w-8 bg-[#EF4949]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Switch to campaign slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
