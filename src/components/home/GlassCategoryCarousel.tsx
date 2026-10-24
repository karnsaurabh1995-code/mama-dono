'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartPulse,
  GraduationCap,
  Baby,
  UtensilsCrossed,
  Accessibility,
  Users,
  PawPrint,
  ShieldAlert,
  Sparkles,
  Building2,
  Flame,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CAUSES_DATA } from '@/lib/data/causes';

interface CategoryTab {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isUrgent?: boolean;
  count?: number;
}

const CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'urgent',
    name: 'Urgent Needs',
    href: '/campaigns?filter=urgent',
    icon: Flame,
    isUrgent: true,
    count: 6,
  },
  {
    id: 'medical',
    name: 'Medical Emergencies',
    href: '/causes/medical',
    icon: HeartPulse,
    count: 24,
  },
  {
    id: 'education',
    name: 'Child Education',
    href: '/causes/education',
    icon: GraduationCap,
    count: 18,
  },
  {
    id: 'food-hunger',
    name: 'Hunger Relief',
    href: '/causes/food-hunger',
    icon: UtensilsCrossed,
    count: 19,
  },
  {
    id: 'children',
    name: 'Child Welfare',
    href: '/causes/children',
    icon: Baby,
    count: 15,
  },
  {
    id: 'animals',
    name: 'Animal Care',
    href: '/causes/animals',
    icon: PawPrint,
    count: 12,
  },
  {
    id: 'disability',
    name: 'Disability Support',
    href: '/causes/disability',
    icon: Accessibility,
    count: 11,
  },
  {
    id: 'elderly',
    name: 'Elderly Care',
    href: '/causes/elderly',
    icon: Users,
    count: 9,
  },
  {
    id: 'disaster-relief',
    name: 'Disaster Relief',
    href: '/causes/disaster-relief',
    icon: ShieldAlert,
    count: 8,
  },
  {
    id: 'women',
    name: 'Women Empowerment',
    href: '/causes/women',
    icon: Sparkles,
    count: 14,
  },
  {
    id: 'community',
    name: 'Community Uplift',
    href: '/causes/community',
    icon: Building2,
    count: 10,
  },
  {
    id: 'all',
    name: 'All Causes',
    href: '/causes',
    icon: Compass,
  },
];

export function GlassCategoryCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeTab, setActiveTab] = useState('urgent');
  const pathname = usePathname();

  // Update scroll arrow availability
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section
      aria-label="Cause Categories"
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10 z-20"
    >
      {/* Glassmorphic Container (Inspired by Reference Image 2 & True Hope Foundation) */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-[#EAE7E2] shadow-sm shadow-neutral-900/5 p-3 sm:p-4 overflow-hidden group">
        {/* Subtle Ambient Glass Surface Shimmer Animation */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
          style={{ willChange: 'transform' }}
        />

        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll categories left"
            className={`shrink-0 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#202124] shadow-xs border border-[#EAE7E2] flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'opacity-100 cursor-pointer hover:scale-105 active:scale-95'
                : 'opacity-30 cursor-not-allowed pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-[#202124]" />
          </button>

          {/* Horizontal Navigable Category Track */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            tabIndex={0}
            role="region"
            aria-label="Cause category horizontal strip"
            className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none scroll-smooth py-1 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4949]/30 rounded-xl"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group/item shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-[#EF4949] text-white shadow-sm shadow-[#EF4949]/30 scale-[1.02]'
                      : 'bg-white/70 hover:bg-white text-[#202124] hover:text-[#EF4949] border border-[#EAE7E2]/80 hover:border-[#EF4949]/30 hover:shadow-2xs hover:-translate-y-0.5'
                  }`}
                >
                  {/* Category Icon */}
                  <span
                    className={`w-7 h-7 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FAF9F6] group-hover/item:bg-[#FFF0EF] text-[#62666D] group-hover/item:text-[#EF4949]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>

                  {/* Category Name */}
                  <span className="whitespace-nowrap font-medium tracking-tight">
                    {tab.name}
                  </span>

                  {/* Active / Counter badge */}
                  {tab.count !== undefined && !isActive && (
                    <span className="text-[10px] text-neutral-400 group-hover/item:text-[#EF4949] transition-colors font-mono">
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll categories right"
            className={`shrink-0 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#202124] shadow-xs border border-[#EAE7E2] flex items-center justify-center transition-all ${
              canScrollRight
                ? 'opacity-100 cursor-pointer hover:scale-105 active:scale-95'
                : 'opacity-30 cursor-not-allowed pointer-events-none'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-[#202124]" />
          </button>
        </div>
      </div>
    </section>
  );
}
