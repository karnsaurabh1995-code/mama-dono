import React from 'react';
import { CampaignCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function CampaignsLoading() {
  return (
    <div aria-busy="true" className="py-8 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <Skeleton className="w-64 sm:w-96 h-10 rounded-xl" />
          <Skeleton className="w-full max-w-xl h-4 rounded" />
        </div>

        {/* Search & Filter Bar Skeleton */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E6E1] flex flex-wrap gap-3 items-center justify-between">
          <Skeleton className="w-64 h-10 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="w-28 h-10 rounded-xl" />
            <Skeleton className="w-28 h-10 rounded-xl" />
          </div>
        </div>

        {/* 4-column Grid of Campaign Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
