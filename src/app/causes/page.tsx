import React from 'react';
import Link from 'next/link';
import { CAUSES_DATA } from '@/lib/data/causes';
import { db } from '@/lib/db';
import { formatINRCompact } from '@/lib/utils';
import { ChevronRight, ArrowRight, Heart } from 'lucide-react';

export default function CausesDirectoryPage() {
  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Causes Directory</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            Explore Causes That Transform Lives
          </h1>
          <p className="text-sm text-[#555B63] max-w-2xl leading-relaxed">
            Every cause represents verified grassroots campaigns, audited non-profit partnerships, and documented beneficiaries across India.
          </p>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAUSES_DATA.map((cause) => {
            const count = db.getCampaigns({ category: cause.id, status: 'active' }).length;
            return (
              <div
                key={cause.id}
                className="bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                  <img
                    src={cause.bannerImage}
                    alt={cause.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white drop-shadow-sm">{cause.name}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-[#555B63] leading-relaxed line-clamp-3">
                    {cause.description}
                  </p>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[#25845B] font-semibold">
                      {count} Active Campaigns
                    </span>
                    <Link
                      href={`/causes/${cause.slug}`}
                      className="text-[#E84B45] font-bold inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
