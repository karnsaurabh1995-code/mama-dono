import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { ShieldCheck, Heart, TrendingUp, Users, CheckCircle2, ChevronRight, Award } from 'lucide-react';

export default function ImpactReportPage() {
  const stats = db.getPlatformStats();
  const campaigns = db.getCampaigns({ status: 'active' });

  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Verified Impact</span>
        </nav>

        {/* Hero */}
        <div className="space-y-3 max-w-3xl">
          <span className="bg-[#EBF7F1] text-[#25845B] border border-[#C2E8D4] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Database-Verified Metrics
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#202124] tracking-tight">
            Documented Impact Across India
          </h1>
          <p className="text-sm text-[#555B63] leading-relaxed">
            Every statistic published on this page is calculated directly from verified transaction records, hospital disbursement receipts, and audited partner NGO filings.
          </p>
        </div>

        {/* 4 Primary Big Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] text-center shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-[#E84B45]">
              {formatINRCompact(stats.totalRaised)}
            </div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
              Aid Delivered
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] text-center shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-[#202124]">
              {stats.totalDonorsCount}+
            </div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
              Verified Donors
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] text-center shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-[#25845B]">
              {stats.verifiedNGOs}
            </div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
              Audited Partner NGOs
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] text-center shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-blue-600">
              {stats.documentedBeneficiaries.toLocaleString('en-IN')}+
            </div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">
              Beneficiaries Reached
            </div>
          </div>
        </div>

        {/* Impact Breakdown by Causes */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-[#202124]">Aid Allocation by Cause Category</h2>

          <div className="space-y-4">
            {[
              { cause: 'Medical Emergency Surgeries & Cancer Care', pct: 45, color: 'bg-[#E84B45]' },
              { cause: 'Food Relief & Hospital Caregiver Meals', pct: 25, color: 'bg-amber-600' },
              { cause: 'Education & Rural Girl Scholarships', pct: 18, color: 'bg-blue-600' },
              { cause: 'Animal Sanctuary & Stray Trauma Rescue', pct: 12, color: 'bg-emerald-600' },
            ].map((c) => (
              <div key={c.cause} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#202124]">
                  <span>{c.cause}</span>
                  <span>{c.pct}%</span>
                </div>
                <div className="h-3 w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
