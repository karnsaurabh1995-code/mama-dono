'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINR, formatINRCompact, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  Layers,
  ArrowLeft,
  Download,
  Search,
  Users,
  Target,
  ShieldCheck,
  Package,
  TrendingUp,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

export default function CampaignAnalyticsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'raisedAmount' | 'netRaisedAmount' | 'goalAmount' | 'supporterCount' | 'completionPct'>('raisedAmount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const analyticsData = db.getDetailedFinancialAnalytics({ period: 'year' });
  const comparisons = analyticsData.campaignComparisons;

  // Filter & Sort
  const processedCampaigns = useMemo(() => {
    let list = [...comparisons];

    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const valA = Number((a as any)[sortField]) || 0;
      const valB = Number((b as any)[sortField]) || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [comparisons, selectedCategory, searchQuery, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Campaign ID',
      'Title',
      'Category',
      'Goal Amount (INR)',
      'Gross Raised (INR)',
      'Net Allocated to Campaign (INR)',
      'Platform Fee 5% (INR)',
      'Dokind Contribution (INR)',
      'Supporters Count',
      'Completion %',
      'Items Funded',
      'Items Required',
    ];

    const rows = processedCampaigns.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.goalAmount,
      c.raisedAmount,
      c.netRaisedAmount,
      Math.round(c.raisedAmount * 0.05),
      c.dokindContribution,
      c.donorsCount,
      `${c.completionPct}%`,
      c.itemsFunded,
      c.itemsRequired,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dokind_campaign_comparisons_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxGross = Math.max(1, ...processedCampaigns.map((c) => c.raisedAmount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/analytics" className="text-neutral-400 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Comparative Intelligence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Campaign Financial Comparisons & Performance
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Side-by-side analysis of Gross Raised, Net Beneficiary Funds, 5% Platform Fees, and Product Giving Progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/analytics">
            <Button size="sm" variant="outline" className="text-xs">
              Back to Analytics Hub
            </Button>
          </Link>
          <Button size="sm" onClick={handleExportCSV} className="bg-[#202124] hover:bg-black text-white text-xs font-bold">
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV ({processedCampaigns.length})
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'medical', 'education', 'food-hunger', 'animals', 'children'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#202124] text-white'
                  : 'bg-neutral-100 text-[#555B63] hover:bg-neutral-200'
              }`}
            >
              {cat === 'all' ? 'All Causes' : cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#E84B45]"
          />
        </div>
      </div>

      {/* Visual Bar Comparison Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-[#202124]">
              Visual Comparison: Gross Raised vs. Net Beneficiary Allocation
            </h3>
            <p className="text-xs text-[#555B63]">
              Dark gray indicates total gross funds; blue bar represents net funds transferred to beneficiary.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-neutral-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#202124]" />
              Gross Raised
            </span>
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Net Allocation (95%)
            </span>
          </div>
        </div>

        {/* Comparison Bars */}
        <div className="space-y-4">
          {processedCampaigns.slice(0, 8).map((c) => {
            const grossWidth = Math.min(100, Math.round((c.raisedAmount / maxGross) * 100));
            const netWidth = Math.min(100, Math.round((c.netRaisedAmount / maxGross) * 100));

            return (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#202124] truncate max-w-md">
                    {c.title}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-neutral-500 font-normal">
                      Goal: {formatINR(c.goalAmount)}
                    </span>
                    <span className="font-bold text-neutral-900">
                      Gross: {formatINR(c.raisedAmount)}
                    </span>
                    <span className="font-bold text-blue-600">
                      Net: {formatINR(c.netRaisedAmount)}
                    </span>
                  </div>
                </div>

                {/* Dual Progress Stack */}
                <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden relative">
                  <div
                    className="h-full bg-neutral-800 rounded-full absolute left-0 top-0"
                    style={{ width: `${grossWidth}%` }}
                  />
                  <div
                    className="h-full bg-blue-500 rounded-full absolute left-0 top-0 opacity-90"
                    style={{ width: `${netWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Detailed Performance Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#202124]">
            Campaign Financial Breakdown & Item Status
          </h3>
          <p className="text-xs text-[#555B63]">
            Complete ledger of active campaigns, goal progress, supporters, and 5% platform fee allocations.
          </p>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-y border-neutral-200 bg-[#FAF9F6] text-neutral-600 font-bold">
                <th className="py-3 px-4">Campaign Title & Cause</th>
                <th
                  onClick={() => handleSort('goalAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Target Goal</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('raisedAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Gross Raised</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('netRaisedAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net to Cause</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Fee (5%)</th>
                <th
                  onClick={() => handleSort('completionPct')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Progress %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('supporterCount')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Donors</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Items Funded</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {processedCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-bold text-[#202124] block truncate" title={c.title}>
                      {c.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded capitalize">
                      {c.category.replace('-', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-neutral-600">
                    {formatINR(c.goalAmount)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                    {formatINR(c.raisedAmount)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                    {formatINR(c.netRaisedAmount)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                    {formatINR(Math.round(c.raisedAmount * 0.05))}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-emerald-700 font-mono">
                      {c.completionPct}%
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono">
                    {c.donorsCount}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {c.itemsRequired > 0 ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {c.itemsFunded}/{c.itemsRequired}
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/campaigns/${c.slug}`}
                      target="_blank"
                      className="p-1.5 text-neutral-500 hover:text-[#EF4949] inline-block"
                      title="View Public Campaign"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
