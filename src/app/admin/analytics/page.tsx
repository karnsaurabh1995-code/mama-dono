'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  Calendar,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export default function AnalyticsHubPage() {
  const [period, setPeriod] = useState<number>(30);
  const metrics = db.getAdminMetrics(period);
  const campaigns = db.getCampaigns().sort((a, b) => b.raisedAmount - a.raisedAmount);
  const donations = db.getDonations({ status: 'succeeded' });

  // Top Donors Leaderboard
  const donorMap: Record<string, { name: string; email: string; total: number; count: number }> = {};
  donations.forEach((d) => {
    if (!donorMap[d.donorEmail]) {
      donorMap[d.donorEmail] = { name: d.donorName, email: d.donorEmail, total: 0, count: 0 };
    }
    donorMap[d.donorEmail].total += d.amount;
    donorMap[d.donorEmail].count += 1;
  });
  const topDonors = Object.values(donorMap).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Financial Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Platform Financial Analytics & Conversions
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Verified financial ledger summaries, conversion rates, and donor retention indicators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold">
            {[7, 30, 90, 365].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  period === days ? 'bg-white shadow-xs text-[#202124] font-bold' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {days === 365 ? '1 Year' : `${days} Days`}
              </button>
            ))}
          </div>

          <Link href="/admin/reports">
            <Button size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
              Download Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs font-bold uppercase text-neutral-400">Gross Donations</span>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">
            {formatINR(metrics.grossSuccessfulAmount)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">{metrics.totalSuccessfulCount} completed contributions</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs font-bold uppercase text-neutral-400">Net Recognized</span>
          <p className="text-2xl font-black text-blue-600 mt-2 font-mono">
            {formatINR(metrics.netRecognizedAmount)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Post refund adjustments</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs font-bold uppercase text-neutral-400">Average Gift Size</span>
          <p className="text-2xl font-black text-purple-600 mt-2 font-mono">
            {formatINR(metrics.averageDonationAmount)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Median ₹1,500 across platform</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-xs font-bold uppercase text-neutral-400">Active Recurring MRR</span>
          <p className="text-2xl font-black text-[#E84B45] mt-2 font-mono">
            {formatINR(metrics.activeRecurring * 1800)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">{metrics.activeRecurring} monthly donors</p>
        </div>
      </div>

      {/* Two Column Layout: Top Campaigns & Top Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Fundraisers */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-[#202124]">Top Performing Fundraisers</h3>
            <Link href="/admin/campaigns" className="text-xs font-semibold text-[#E84B45] hover:underline">
              All Campaigns
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {campaigns.slice(0, 5).map((camp, idx) => (
              <div key={camp.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-bold text-neutral-400 w-4">{idx + 1}.</span>
                  <div className="min-w-0">
                    <p className="font-bold text-[#202124] truncate">{camp.title}</p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {camp.supporterCount} donors • Goal: {formatINR(camp.goalAmount)}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-700 whitespace-nowrap">
                  {formatINR(camp.raisedAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Donor Champions */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-[#202124]">Top Generous Donors</h3>
            <span className="text-xs text-neutral-400">CSR & HNI Patrons</span>
          </div>

          <div className="divide-y divide-neutral-100">
            {topDonors.map((d, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-bold text-neutral-400 w-4">{idx + 1}.</span>
                  <div className="min-w-0">
                    <p className="font-bold text-[#202124] truncate">{d.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{d.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-neutral-900 block">{formatINR(d.total)}</span>
                  <span className="text-[10px] text-neutral-400">{d.count} donations</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
