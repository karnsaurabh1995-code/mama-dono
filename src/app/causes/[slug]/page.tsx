'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CAUSES_DATA } from '@/lib/data/causes';
import { db } from '@/lib/db';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function CauseSpecificPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const cause = CAUSES_DATA.find((c) => c.slug === slug || c.id === slug);

  if (!cause) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-xl font-bold text-[#202124]">Cause Not Found</h1>
        <Link href="/causes">
          <Button variant="primary">View All Causes</Button>
        </Link>
      </div>
    );
  }

  const campaigns = db.getCampaigns({ category: cause.id, status: 'active' });

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/causes" className="hover:text-[#202124]">
            Causes
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">{cause.name}</span>
        </nav>

        {/* Cause Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-md">
          <div className="relative h-64 sm:h-72 w-full">
            <img
              src={cause.bannerImage}
              alt={cause.name}
              className="w-full h-full object-cover brightness-[0.4]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white max-w-3xl space-y-2">
              <span className="bg-[#E84B45] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full w-max">
                Verified Cause
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white">{cause.name}</h1>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed max-w-2xl">
                {cause.description}
              </p>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#202124]">
              Active Campaigns in {cause.name} ({campaigns.length})
            </h2>
            <Link href="/start-campaign">
              <Button variant="outline" size="sm">
                Start a Fundraiser for this Cause
              </Button>
            </Link>
          </div>

          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {campaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E6E1] p-12 text-center max-w-md mx-auto space-y-3">
              <p className="text-sm text-[#555B63]">
                There are currently no active campaigns in this category.
              </p>
              <Link href="/campaigns">
                <Button variant="primary" size="sm">
                  Explore Other Causes
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
