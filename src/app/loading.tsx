import React from 'react';
import { HeroCarouselSkeleton, CampaignCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <div aria-busy="true" className="space-y-8 pb-16">
      {/* Hero Carousel Skeleton */}
      <HeroCarouselSkeleton />

      {/* Horizontal Ticker Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="w-full h-12 rounded-2xl bg-neutral-200/70" />
      </div>

      {/* Campaign Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-8 rounded-xl" />
          <Skeleton className="w-24 h-4 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
