'use client';

import React, { useRef, useState } from 'react';
import {
  HeartPulse,
  GraduationCap,
  UtensilsCrossed,
  PawPrint,
  Baby,
  Accessibility,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function PreviewCategoryCarousel() {
  const [activeCategory, setActiveCategory] = useState('medical');
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'urgent', name: 'Urgent Appeals', count: 6, icon: Flame, isUrgent: true },
    { id: 'medical', name: 'Medical Emergencies', count: 24, icon: HeartPulse },
    { id: 'education', name: 'Child Education', count: 18, icon: GraduationCap },
    { id: 'food-hunger', name: 'Hunger Relief', count: 19, icon: UtensilsCrossed },
    { id: 'children', name: 'Child Welfare', count: 15, icon: Baby },
    { id: 'animals', name: 'Animal Care', count: 12, icon: PawPrint },
    { id: 'disability', name: 'Disability Support', count: 11, icon: Accessibility },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      data-component="PreviewCategoryCarousel"
      className="relative flex items-center gap-2 py-4"
    >
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll categories left"
        className="hidden md:flex w-9 h-9 rounded-full bg-white border border-[#E8E6E1] hover:border-neutral-400 items-center justify-center text-neutral-600 hover:text-black transition shadow-2xs shrink-0 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Horizontal Pills Row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto scroll-smooth py-1 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 border cursor-pointer ${
                isActive
                  ? 'bg-[#EF4949] text-white border-[#EF4949] shadow-sm scale-102'
                  : 'bg-white/80 hover:bg-white text-neutral-700 border-[#E8E6E1] hover:border-neutral-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#EF4949]'}`} />
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll categories right"
        className="hidden md:flex w-9 h-9 rounded-full bg-white border border-[#E8E6E1] hover:border-neutral-400 items-center justify-center text-neutral-600 hover:text-black transition shadow-2xs shrink-0 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
