'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINR, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ArrowLeft, PlusCircle, ExternalLink } from 'lucide-react';

export default function FundraiserCampaignsListPage() {
  const campaigns = db.getCampaigns();

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/fundraiser/dashboard" className="hover:text-[#202124]">
            Fundraiser Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">My Campaigns</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#202124]">Manage All Campaigns</h1>
            <p className="text-xs text-[#555B63] mt-1">
              Track funding progress, edit details, and post medical updates for donors.
            </p>
          </div>
          <Link href="/start-campaign">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create New Campaign
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] overflow-hidden shadow-xs">
          <div className="divide-y divide-[#E8E6E1] text-xs">
            {campaigns.map((c) => {
              const pct = calculatePercentage(c.raisedAmount, c.goalAmount);
              return (
                <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors">
                  <div className="flex items-start gap-4">
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-16 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            c.status === 'active'
                              ? 'bg-emerald-50 text-[#25845B] border border-emerald-200'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="text-[11px] text-neutral-400 capitalize">{c.category}</span>
                      </div>
                      <Link
                        href={`/campaigns/${c.slug}`}
                        className="font-bold text-sm text-[#202124] hover:text-[#E84B45] line-clamp-1"
                      >
                        {c.title}
                      </Link>
                      <div className="text-[11px] text-[#555B63]">
                        Raised {formatINR(c.raisedAmount)} of {formatINR(c.goalAmount)} ({pct}%) • {c.supporterCount} Donors
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/campaigns/${c.slug}`}>
                      <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View Live
                      </Button>
                    </Link>
                    <Link href="/fundraiser/payouts">
                      <Button variant="primary" size="sm">
                        Payouts
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
