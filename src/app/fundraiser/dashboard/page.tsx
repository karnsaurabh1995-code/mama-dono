'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { formatINR, calculatePercentage, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  Heart,
  Users,
  Eye,
  PlusCircle,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Building,
} from 'lucide-react';

export default function FundraiserDashboardPage() {
  const { user } = useAuth();
  const campaigns = db.getCampaigns().slice(0, 3); // Campaigner's campaigns

  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + c.goalAmount, 0);
  const totalSupporters = campaigns.reduce((acc, c) => acc + c.supporterCount, 0);

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Fundraiser Dashboard</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#202124]">
              Fundraiser Command Center
            </h1>
            <p className="text-xs text-[#555B63] mt-1">
              Logged in as <strong>{user?.name}</strong> • Role: {user?.role}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/fundraiser/payouts">
              <Button variant="outline" size="sm" leftIcon={<Building className="w-4 h-4" />}>
                Hospital Payouts
              </Button>
            </Link>
            <Link href="/start-campaign">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Start New Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#555B63] font-semibold">Total Raised</span>
            <div className="text-2xl font-black text-[#E84B45] mt-1">{formatINR(totalRaised)}</div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Across {campaigns.length} campaigns
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#555B63] font-semibold">Overall Goal</span>
            <div className="text-2xl font-black text-[#202124] mt-1">{formatINR(totalGoal)}</div>
            <span className="text-[11px] text-[#25845B] font-semibold mt-1 block">
              {calculatePercentage(totalRaised, totalGoal)}% Funded
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#555B63] font-semibold">Total Supporters</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{totalSupporters}</div>
            <span className="text-[11px] text-[#555B63] mt-1 block">Verified community donors</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#555B63] font-semibold">Verification State</span>
            <div className="text-lg font-black text-[#25845B] mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5" />
              <span>Hospital Audited</span>
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">AIIMS New Delhi Patient Cell</span>
          </div>
        </div>

        {/* Managed Campaigns Table */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#202124]">My Campaigns</h2>
            <Link href="/fundraiser/campaigns" className="text-xs text-[#E84B45] font-semibold hover:underline">
              Manage All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#E8E6E1] border border-[#E8E6E1] rounded-2xl overflow-hidden text-xs">
            {campaigns.map((c) => {
              const pct = calculatePercentage(c.raisedAmount, c.goalAmount);
              return (
                <div key={c.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors">
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
                        <span className="text-[11px] text-neutral-400">
                          {c.supporterCount} Donors
                        </span>
                      </div>
                      <Link
                        href={`/campaigns/${c.slug}`}
                        className="font-bold text-sm text-[#202124] hover:text-[#E84B45] line-clamp-1"
                      >
                        {c.title}
                      </Link>
                      <div className="text-[11px] text-[#555B63]">
                        Raised <strong>{formatINR(c.raisedAmount)}</strong> of {formatINR(c.goalAmount)} ({pct}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/campaigns/${c.slug}`}>
                      <Button variant="outline" size="sm">
                        Public Page
                      </Button>
                    </Link>
                    <Link href={`/fundraiser/payouts`}>
                      <Button variant="primary" size="sm">
                        Request Payout
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
