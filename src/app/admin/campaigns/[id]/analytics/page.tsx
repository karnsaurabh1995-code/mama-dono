'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Campaign, Donation } from '@/lib/types';
import { formatINR, formatDate, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Heart,
  Package,
  Calendar,
  Receipt,
  Download,
  CheckCircle2,
} from 'lucide-react';

export default function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(JSON.parse(JSON.stringify(found)));
    }
  }, [campaignId]);

  if (!campaign) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E2E4E9] text-center text-xs text-neutral-500">
        Campaign not found.
      </div>
    );
  }

  const donations = db.getDonations({ campaignId: campaign.id, status: 'succeeded' });
  const netRaised = campaign.netRaisedAmount || Math.round(campaign.raisedAmount * 0.95);
  const pct = calculatePercentage(netRaised, campaign.goalAmount);
  const totalDonations = donations.length;
  const avgDonation = totalDonations > 0 ? Math.round(campaign.raisedAmount / totalDonations) : 0;
  const with80GCount = donations.filter((d) => d.taxExemption80G).length;
  const taxExemptionRate = totalDonations > 0 ? Math.round((with80GCount / totalDonations) * 100) : 0;
  const items = db.getCampaignItemNeeds(campaign.id);
  const totalItemNeeds = items.reduce((sum, it) => sum + it.quantityRequired, 0);
  const totalItemFunded = items.reduce((sum, it) => sum + it.quantityFunded, 0);

  // Top donors sorted by amount
  const topDonors = [...donations].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* ----------------- BREADCRUMB ----------------- */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaign Hub</span>
        </Link>

        <span className="text-xs text-neutral-400 font-mono">
          Campaign ID: {campaign.id}
        </span>
      </div>

      {/* ----------------- HEADER CARD ----------------- */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E4E9] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-amber-50 text-amber-700">
            <BarChart3 className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Performance Analytics
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
          Financial &amp; Supporter Telemetry
        </h1>
        <p className="text-xs text-[#555B63] max-w-2xl">
          Deep-dive analysis on donor velocity, Section 80G tax receipt claims, average ticket size, and wholesale item fulfillment progress.
        </p>
      </div>

      {/* ----------------- STATS GRID ----------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Net Recognized</span>
          <p className="text-2xl font-black text-neutral-900">{formatINR(netRaised)}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{pct}% of Goal</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Avg Ticket Size</span>
          <p className="text-2xl font-black text-neutral-900">{formatINR(avgDonation)}</p>
          <span className="text-[10px] text-neutral-400 font-medium">Per verified order</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">80G Claim Rate</span>
          <p className="text-2xl font-black text-neutral-900">{taxExemptionRate}%</p>
          <span className="text-[10px] text-blue-600 font-medium">{with80GCount} receipts issued</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Item Fulfillment</span>
          <p className="text-2xl font-black text-neutral-900">{totalItemFunded}/{totalItemNeeds}</p>
          <span className="text-[10px] text-teal-600 font-medium">Physical items sponsored</span>
        </div>
      </div>

      {/* ----------------- TOP SUPPORTERS TABLE ----------------- */}
      <div className="bg-white rounded-3xl border border-[#E2E4E9] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#EF4949]" />
            <h3 className="text-sm font-bold text-neutral-900">Top Campaign Benefactors</h3>
          </div>
          <span className="text-xs text-neutral-400">{donations.length} total donors</span>
        </div>

        {topDonors.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">No donations recorded yet for this fundraiser.</div>
        ) : (
          <div className="divide-y divide-neutral-100 text-xs">
            {topDonors.map((d, idx) => (
              <div key={d.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/60 transition">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-[11px] text-neutral-600">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-neutral-800">{d.donorName || 'Generous Supporter'}</p>
                    <p className="text-[11px] text-neutral-400">{formatDate(d.createdAt)} • {d.paymentMethod}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-neutral-900 font-mono">{formatINR(d.amount)}</p>
                  {d.taxExemption80G && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      80G Claimed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
