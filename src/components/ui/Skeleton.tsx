'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Accessible Skeleton Primitive
 * Uses subtle pulse shimmer animation, respects prefers-reduced-motion, aria-hidden.
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-neutral-200/80 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Header Account Control Skeleton Placeholder
 * Prevents layout shifts in both Utility Bar and Main Navigation
 */
export function HeaderAccountSkeleton({ variant = 'desktop' }: { variant?: 'utility' | 'desktop' | 'mobile' }) {
  if (variant === 'utility') {
    return <Skeleton className="w-28 h-4 rounded-md bg-neutral-200/70 inline-block" />;
  }

  if (variant === 'mobile') {
    return <Skeleton className="w-full h-10 rounded-xl bg-neutral-200/60" />;
  }

  return (
    <div className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-[#E8E6E1] bg-white w-28 h-9">
      <Skeleton className="w-6 h-6 rounded-full shrink-0" />
      <Skeleton className="w-12 h-3.5 rounded" />
    </div>
  );
}

/**
 * Homepage Hero Split-Panel Skeleton
 * Matches dimensions of HeroCarousel (True Hope Foundation layout)
 */
export function HeroCarouselSkeleton() {
  return (
    <div className="w-full max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div
        aria-busy="true"
        aria-label="Loading featured cause"
        className="relative bg-[#18191B] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-neutral-800/80 flex flex-col md:flex-row min-h-[540px] md:min-h-[560px] lg:min-h-[580px] xl:min-h-[620px] w-full items-stretch"
      >
        {/* Left Charcoal Text Panel */}
        <div className="w-full md:w-1/2 lg:w-[48%] shrink-0 flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 z-20 bg-[#18191B] order-2 md:order-1">
          <div className="space-y-5">
            {/* Badges placeholder */}
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-32 h-6 rounded-full bg-neutral-800" />
              <Skeleton className="w-44 h-6 rounded-full bg-neutral-800" />
            </div>

            {/* Headline placeholders */}
            <div className="space-y-3 pt-2">
              <Skeleton className="w-full h-8 sm:h-10 rounded-lg bg-neutral-800" />
              <Skeleton className="w-4/5 h-8 sm:h-10 rounded-lg bg-neutral-800" />
            </div>

            {/* Subtext placeholder */}
            <div className="space-y-2 pt-2">
              <Skeleton className="w-full h-4 rounded bg-neutral-800/70" />
              <Skeleton className="w-5/6 h-4 rounded bg-neutral-800/70" />
              <Skeleton className="w-2/3 h-4 rounded bg-neutral-800/70" />
            </div>

            {/* CTA buttons placeholder */}
            <div className="pt-4 flex items-center gap-3">
              <Skeleton className="w-36 sm:w-44 h-12 rounded-full bg-neutral-800" />
              <Skeleton className="w-32 sm:w-40 h-12 rounded-full bg-neutral-800/70" />
            </div>
          </div>

          {/* Pagination indicators placeholder */}
          <div className="pt-8 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-2 rounded-full bg-neutral-700" />
              <Skeleton className="w-2 h-2 rounded-full bg-neutral-800" />
              <Skeleton className="w-2 h-2 rounded-full bg-neutral-800" />
            </div>
            <Skeleton className="w-12 h-3 rounded bg-neutral-800" />
          </div>
        </div>

        {/* Right Photographic Panel Placeholder */}
        <div className="w-full md:w-1/2 lg:w-[54%] xl:w-[56%] min-h-[300px] sm:min-h-[380px] md:min-h-[500px] lg:min-h-[580px] xl:min-h-[620px] self-stretch bg-neutral-800/60 relative overflow-hidden order-1 md:order-2 md:-ml-[2%] md:[clip-path:polygon(4%_0,100%_0,100%_100%,0%_100%)]">
          <Skeleton className="w-full h-full bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

/**
 * Campaign Card Skeleton
 * Matches dimensions and layout of CampaignCard
 */
export function CampaignCardSkeleton() {
  return (
    <div
      aria-busy="true"
      className="bg-white rounded-2xl border border-[#E8E6E1] shadow-xs flex flex-col overflow-hidden"
    >
      {/* 1. Image Placeholder */}
      <div className="relative aspect-[16/10] bg-neutral-200/80">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-3 left-3">
          <Skeleton className="w-20 h-5 rounded-full bg-white/70" />
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Skeleton className="w-28 h-3.5 rounded bg-neutral-200" />
          <Skeleton className="w-full h-5 rounded bg-neutral-250" />
          <Skeleton className="w-4/5 h-5 rounded bg-neutral-250" />
        </div>

        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <Skeleton className="w-full h-2 rounded-full bg-neutral-200" />
          <div className="flex justify-between items-center">
            <Skeleton className="w-28 h-4 rounded bg-neutral-200" />
            <Skeleton className="w-12 h-4 rounded bg-neutral-200" />
          </div>
          <Skeleton className="w-24 h-3 rounded bg-neutral-200" />

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Skeleton className="w-full h-9 rounded-xl bg-neutral-200" />
            <Skeleton className="w-full h-9 rounded-xl bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Campaign Detail Page Skeleton
 * Matches DonateKart 2-Column Responsive Layout
 */
export function CampaignDetailSkeleton() {
  return (
    <div aria-busy="true" className="py-8 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-12 h-4 rounded" />
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-16 h-4 rounded" />
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-48 h-4 rounded" />
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="space-y-4">
              {/* Hero Image Skeleton */}
              <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-neutral-200">
                <Skeleton className="w-full h-full rounded-none" />
              </div>

              {/* Title and metadata */}
              <div className="space-y-3">
                <Skeleton className="w-full h-8 sm:h-10 rounded-lg" />
                <Skeleton className="w-3/4 h-8 sm:h-10 rounded-lg" />
                <div className="flex items-center gap-4 pt-1">
                  <Skeleton className="w-28 h-4 rounded" />
                  <Skeleton className="w-36 h-4 rounded" />
                  <Skeleton className="w-24 h-4 rounded" />
                </div>
              </div>

              {/* Organization Card Skeleton */}
              <div className="p-5 bg-white rounded-2xl border border-[#E8E6E1] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="w-36 h-4 rounded" />
                    <Skeleton className="w-48 h-3 rounded" />
                  </div>
                </div>
                <Skeleton className="w-32 h-6 rounded-lg" />
              </div>
            </div>

            {/* Story & Updates Tabs Skeleton */}
            <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 space-y-6">
              <div className="flex gap-4 border-b border-neutral-100 pb-4">
                <Skeleton className="w-24 h-8 rounded-lg" />
                <Skeleton className="w-24 h-8 rounded-lg" />
              </div>

              <div className="space-y-3">
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-5/6 h-4 rounded" />
                <Skeleton className="w-4/5 h-4 rounded" />
              </div>

              <Skeleton className="w-full h-48 rounded-2xl" />

              <div className="space-y-3">
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-3/4 h-4 rounded" />
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Donation Panel Skeleton - 4 cols desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-lg p-6 space-y-6">
              {/* Tab selector */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-2xl">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>

              {/* Progress and metrics */}
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <Skeleton className="w-28 h-6 rounded" />
                  <Skeleton className="w-16 h-6 rounded" />
                </div>
                <Skeleton className="w-full h-2.5 rounded-full" />
                <div className="flex justify-between pt-1">
                  <Skeleton className="w-24 h-4 rounded" />
                  <Skeleton className="w-24 h-4 rounded" />
                </div>
              </div>

              {/* Items / Presets placeholder */}
              <div className="space-y-3">
                <Skeleton className="w-full h-16 rounded-2xl" />
                <Skeleton className="w-full h-16 rounded-2xl" />
                <Skeleton className="w-full h-16 rounded-2xl" />
              </div>

              {/* Big CTA */}
              <Skeleton className="w-full h-12 rounded-2xl" />

              {/* Trust disclosures */}
              <div className="flex justify-around pt-2">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-20 h-4 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
