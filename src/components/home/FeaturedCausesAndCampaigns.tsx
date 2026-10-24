'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Campaign } from '@/lib/types';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { GlassCategoryCarousel } from '@/components/home/GlassCategoryCarousel';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedCausesAndCampaignsProps {
  initialCampaigns: Campaign[];
}

export function FeaturedCausesAndCampaigns({ initialCampaigns }: FeaturedCausesAndCampaignsProps) {
  // Show up to 6 campaigns in a clean 3x2 grid on desktop, 2x3 on tablet, 1 col on mobile
  const displayedCampaigns = initialCampaigns.slice(0, 6);

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1.5 rounded-full inline-block border border-[#FEE2E2]">
            EXPLORE CAUSES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#202124] tracking-tight leading-tight">
            Behind Every Cause Is a Chance to Make a Difference.
          </h2>
          <p className="text-xs sm:text-sm text-[#555B63] max-w-xl mx-auto leading-relaxed">
            Choose a cause category below to discover urgent patient needs, community nourishment drives, and educational missions across India.
          </p>
        </div>

        {/* Horizontal Cause-Category Glass Carousel */}
        <div className="py-2">
          <GlassCategoryCarousel />
        </div>

        {/* Featured Campaign Responsive Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedCampaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>

          {/* Section Action Link */}
          <div className="text-center pt-12">
            <Link href="/campaigns">
              <Button
                variant="outline"
                size="lg"
                className="border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition shadow-2xs group"
              >
                <span>View All Active Campaigns</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
