'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { AuditLog } from '@/lib/types';
import {
  TrendingUp,
  DollarSign,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  SlidersHorizontal,
  FileSpreadsheet,
  BookOpen,
  Shield,
  CreditCard,
  History,
  LayoutList,
  Paintbrush,
  X,
} from 'lucide-react';

export interface AdminMetricsSnapshot {
  grossSuccessfulAmount: number;
  totalRefundedAmount: number;
  netRecognizedAmount: number;
  totalSuccessfulCount: number;
  averageDonationAmount: number;
  activeCampaigns: number;
  pausedCampaigns: number;
  completedCampaigns: number;
  suspendedCampaigns: number;
  submittedCampaigns: number;
  verifiedNGOs: number;
  pendingNGOs: number;
  pendingPayments: number;
  failedPayments: number;
  activeRecurring: number;
  recurringFailures: number;
  refundsAwaitingAction: number;
  pendingReconciliations: number;
  trafficSources: Array<{
    source: string;
    visitors: number;
    donors: number;
    conversionRate: string;
  }>;
  categoryBreakdown: Array<{
    id: string;
    name: string;
    campaignsCount: number;
    raisedAmount: number;
  }>;
  periodDays: number;
}

export interface AdminOverviewSnapshot {
  metrics: AdminMetricsSnapshot;
  auditLogs: AuditLog[];
  totalAuditLogs: number;
  campaignsCount: number;
  pendingApprovalsCount: number;
  pendingWiresCount: number;
}

interface AdminOverviewClientProps {
  initialSnapshot: AdminOverviewSnapshot;
}

export function AdminOverviewClient({ initialSnapshot }: AdminOverviewClientProps) {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'this_month' | 'this_year'>('30d');
  const [metrics, setMetrics] = useState<AdminMetricsSnapshot>(initialSnapshot.metrics);
  const [campaignsCount, setCampaignsCount] = useState<number>(initialSnapshot.campaignsCount);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(initialSnapshot.pendingApprovalsCount);
  const [pendingWiresCount, setPendingWiresCount] = useState<number>(initialSnapshot.pendingWiresCount);
  const [actionNotice, setActionNotice] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Widget visibility toggles
  const [visibleWidgets, setVisibleWidgets] = useState({
    quickShortcuts: true,
    financials: true,
    campaigns: true,
    categoryChart: true,
    trafficFunnel: true,
    recentActivity: true,
  });

  const toggleWidget = (key: keyof typeof visibleWidgets) => {
    setVisibleWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const handleDateFilterChange = async (
    newFilter: '7d' | '30d' | '90d' | 'this_month' | 'this_year',
    label: string
  ) => {
    setDateFilter(newFilter);
    notify(`Report range updated to: ${label}`);
    const days = newFilter === '7d' ? 7 : newFilter === '30d' ? 30 : newFilter === '90d' ? 90 : 365;

    try {
      const res = await fetch(`/api/admin/metrics?periodDays=${days}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.metrics) {
          setMetrics(data.metrics);
        }
        if (typeof data?.campaignsCount === 'number') {
          setCampaignsCount(data.campaignsCount);
        }
        if (typeof data?.pendingApprovalsCount === 'number') {
          setPendingApprovalsCount(data.pendingApprovalsCount);
        }
        if (typeof data?.pendingWiresCount === 'number') {
          setPendingWiresCount(data.pendingWiresCount);
        }
      }
    } catch (e) {
      // In offline or fallback scenario, keep existing metrics
    }
  };

  return (
    <div className="space-y-6">
      {/* ----------------- TOP BANNER & FILTER BAR ----------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
            Platform Intelligence &amp; Operations
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Real-time financial reconciliation, campaign pipelines, and editorial control center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reporting Period Selector */}
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'this_year', label: 'YTD 2026' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  handleDateFilterChange(
                    p.id as '7d' | '30d' | '90d' | 'this_month' | 'this_year',
                    p.label
                  )
                }
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === p.id
                    ? 'bg-white text-[#202124] shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Customize Widgets Button */}
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E2E4E9] hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-700 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>

          {/* Export Report CSV */}
          <Link href="/admin/reports">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-[#E84B45] hover:bg-[#BD302D] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Reports</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Global Toast */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-emerald-700 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Action alert banner if pending items exist */}
      {(pendingApprovalsCount > 0 || pendingWiresCount > 0) && (
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Action Required: {pendingApprovalsCount} Fundraiser(s) &amp; {pendingWiresCount} Offline Wire(s) Awaiting Review
              </p>
              <p className="text-[11px] text-amber-700">
                Hospital verification estimates and bank deposit reconciliations are awaiting operator confirmation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pendingApprovalsCount > 0 && (
              <Link href="/admin/campaigns/approvals">
                <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100">
                  Review Campaigns ({pendingApprovalsCount})
                </Button>
              </Link>
            )}
            {pendingWiresCount > 0 && (
              <Link href="/admin/finance">
                <Button size="sm" className="text-xs bg-amber-600 hover:bg-amber-700 text-white">
                  Reconcile Wires ({pendingWiresCount})
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ----------------- 6 WORKSPACE SHORTCUT HUBS ----------------- */}
      {visibleWidgets.quickShortcuts && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/campaigns"
            className="p-3.5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45] transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E84B45] flex items-center justify-center group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-bold text-[#202124]">Campaigns</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{campaignsCount} total • Control</p>
            </div>
          </Link>

          <Link
            href="/admin/homepage-curation"
            className="p-3.5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45] transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LayoutList className="w-4 h-4" />
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-bold text-[#202124]">Placements</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Hero &amp; Featured Grid</p>
            </div>
          </Link>

          <Link
            href="/admin/finance"
            className="p-3.5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45] transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-bold text-[#202124]">Finance Hub</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Reconciliation &amp; Vouchers</p>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-3.5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45] transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-bold text-[#202124]">Reports</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Excel &amp; CSV Exports</p>
            </div>
          </Link>

          <Link
            href="/admin/blogs"
            className="p-3.5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45] transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-bold text-[#202124]">Blog Studio</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Stories &amp; Impact</p>
            </div>
          </Link>

          <Link
            href="/admin/team"
            className="p-3.5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45] transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4" />
            </div>
            <div className="mt-2.5">
              <p className="text-xs font-bold text-[#202124]">Team &amp; Access</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Staff &amp; Super Admin</p>
            </div>
          </Link>
        </div>
      )}

      {/* ----------------- PRIMARY FINANCIAL & KPI CARDS ----------------- */}
      {visibleWidgets.financials && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Successful Donations */}
          <Link
            href="/admin/finance"
            className="p-5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45]/50 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Gross Donations</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-[#202124] mt-2 tracking-tight">
                {formatINR(metrics.grossSuccessfulAmount)}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>100% verified gateway transactions</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
              <span>{metrics.totalSuccessfulCount} total donations</span>
              <span className="group-hover:text-[#E84B45] font-semibold flex items-center gap-0.5">
                Inspect <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Net Recognized Donations */}
          <Link
            href="/admin/finance"
            className="p-5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45]/50 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Net Recognized</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-[#202124] mt-2 tracking-tight">
                {formatINR(metrics.netRecognizedAmount)}
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium mt-1">
                Gross minus ₹{formatINR(metrics.totalRefundedAmount)} refunds
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Accounting audit standard</span>
              <span className="group-hover:text-[#E84B45] font-semibold flex items-center gap-0.5">
                Ledger <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Average Donation Amount */}
          <Link
            href="/admin/finance"
            className="p-5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45]/50 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Avg Gift Size</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-[#202124] mt-2 tracking-tight">
                {formatINR(metrics.averageDonationAmount)}
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium mt-1">
                Across UPI, Cards, NetBanking
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
              <span>{metrics.activeRecurring} recurring donors</span>
              <span className="group-hover:text-[#E84B45] font-semibold flex items-center gap-0.5">
                Details <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Offline Wire Pending Reconciliation */}
          <Link
            href="/admin/finance"
            className="p-5 bg-white rounded-2xl border border-[#E2E4E9] hover:border-[#E84B45]/50 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Offline Wire Queue</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-[#202124] mt-2 tracking-tight">
                {metrics.pendingReconciliations} Pending
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                Awaiting bank advice statement
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Direct NGO bank wires</span>
              <span className="group-hover:text-[#E84B45] font-semibold flex items-center gap-0.5">
                Reconcile <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* ----------------- OPERATIONAL PIPELINE BREAKDOWN ----------------- */}
      {visibleWidgets.campaigns && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/campaigns?status=active"
            className="p-3.5 bg-white rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 transition-colors"
          >
            <p className="text-[10px] font-bold uppercase text-neutral-400">Active Live</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{metrics.activeCampaigns}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Accepting donations</p>
          </Link>

          <Link
            href="/admin/campaigns/approvals"
            className="p-3.5 bg-white rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 transition-colors"
          >
            <p className="text-[10px] font-bold uppercase text-neutral-400">Awaiting Review</p>
            <p className="text-xl font-black text-amber-600 mt-1">{metrics.submittedCampaigns}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Submitted queue</p>
          </Link>

          <Link
            href="/admin/campaigns?status=paused"
            className="p-3.5 bg-white rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 transition-colors"
          >
            <p className="text-[10px] font-bold uppercase text-neutral-400">Paused</p>
            <p className="text-xl font-black text-neutral-700 mt-1">{metrics.pausedCampaigns}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Temporarily halted</p>
          </Link>

          <Link
            href="/admin/campaigns?status=completed"
            className="p-3.5 bg-white rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 transition-colors"
          >
            <p className="text-[10px] font-bold uppercase text-neutral-400">Completed</p>
            <p className="text-xl font-black text-blue-600 mt-1">{metrics.completedCampaigns}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">100% goal achieved</p>
          </Link>

          <Link
            href="/admin/organizations"
            className="p-3.5 bg-white rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 transition-colors"
          >
            <p className="text-[10px] font-bold uppercase text-neutral-400">Verified NGOs</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{metrics.verifiedNGOs}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Darpan &amp; 80G vetted</p>
          </Link>

          <Link
            href="/admin/finance"
            className="p-3.5 bg-white rounded-xl border border-[#E2E4E9] hover:bg-neutral-50 transition-colors"
          >
            <p className="text-[10px] font-bold uppercase text-neutral-400">Refunds Queue</p>
            <p className="text-xl font-black text-rose-600 mt-1">{metrics.refundsAwaitingAction}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Pending action</p>
          </Link>
        </div>
      )}

      {/* ----------------- CHARTS & ANALYTICS GRIDS ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cause Category Volume Breakdown */}
        {visibleWidgets.categoryChart && (
          <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-[#202124]">Performance by Cause Category</h3>
                <Link href="/admin/causes" className="text-xs text-[#E84B45] hover:underline font-semibold">
                  Manage Causes
                </Link>
              </div>

              <div className="mt-4 space-y-3.5">
                {metrics.categoryBreakdown.slice(0, 5).map((item) => {
                  const maxRaised = Math.max(...metrics.categoryBreakdown.map((x) => x.raisedAmount)) || 1;
                  const pct = Math.round((item.raisedAmount / maxRaised) * 100);
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">{item.name}</span>
                        <span className="font-mono text-neutral-600 font-bold">{formatINR(item.raisedAmount)}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#E84B45] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>{item.campaignsCount} active campaigns</span>
                        <span>{pct}% of peak volume</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              href="/admin/reports"
              className="mt-4 pt-3 border-t border-neutral-100 text-xs font-semibold text-[#E84B45] flex items-center justify-between hover:underline"
            >
              <span>Export Category Performance Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Traffic Sources & Conversion Funnel */}
        {visibleWidgets.trafficFunnel && (
          <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-[#202124]">Traffic &amp; Conversion Attribution</h3>
                <span className="text-[11px] font-bold text-neutral-400">Channel Analytics</span>
              </div>

              <div className="mt-4 divide-y divide-neutral-100">
                {metrics.trafficSources.map((ts, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-neutral-800">{ts.source}</p>
                      <p className="text-[10px] text-neutral-400">
                        {ts.visitors.toLocaleString()} visitors • {ts.donors} donors
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                      {ts.conversionRate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/admin/homepage-curation"
              className="mt-4 pt-3 border-t border-neutral-100 text-xs font-semibold text-[#E84B45] flex items-center justify-between hover:underline"
            >
              <span>Manage Curated Merchandising</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Quick Operations Highlight */}
        <div className="p-5 bg-gradient-to-br from-[#202124] to-[#2B2D33] text-white rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#E84B45] text-white text-[10px] font-bold uppercase tracking-wider">
                Merchandising
              </span>
              <span className="text-xs text-neutral-400">Homepage Control</span>
            </div>

            <h3 className="text-lg font-black mt-2 leading-tight">
              Curate Homepage Placements
            </h3>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Pin top urgent emergencies to the Hero Carousel, arrange featured cards, and schedule monthly giving missions directly.
            </p>

            <div className="mt-5 space-y-2">
              <Link
                href="/admin/homepage-curation"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#E84B45] hover:bg-[#BD302D] text-white rounded-xl text-xs font-bold transition-colors"
              >
                <LayoutList className="w-4 h-4" />
                <span>Open Homepage Placements</span>
              </Link>

              <Link
                href="/admin/website-builder"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Paintbrush className="w-4 h-4" />
                <span>Visual Website Builder</span>
              </Link>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Instant Public Sync</span>
            <span className="text-emerald-400 font-semibold">Live Active</span>
          </div>
        </div>
      </div>

      {/* ----------------- RECENT AUDIT ACTIVITY LEDGER ----------------- */}
      {visibleWidgets.recentActivity && (
        <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E4E9] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202124]">Real-Time Administrative Audit Trail</h3>
              <p className="text-xs text-[#555B63] mt-0.5">
                Every campaign modification, payout reconciliation, and setting update is logged immutably.
              </p>
            </div>
            <Link href="/admin/audit-logs">
              <Button size="sm" variant="outline" className="text-xs">
                View Full Ledger ({initialSnapshot.totalAuditLogs})
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {initialSnapshot.auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 text-xs font-mono">
                    <History className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#202124]">{log.actorName}</span>
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5">{log.details}</p>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 whitespace-nowrap sm:text-right">
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- CUSTOMIZE DASHBOARD MODAL ----------------- */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Customize Overview Widgets</h3>
              <button onClick={() => setShowCustomizeModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Show or hide specific modules based on your administrative workflow:
            </p>

            <div className="space-y-3 pt-2">
              {[
                { key: 'quickShortcuts', label: 'Primary Workspace Quick Navigation' },
                { key: 'financials', label: 'Financial & Ledger Gross KPI Cards' },
                { key: 'campaigns', label: 'Campaign Pipeline Status Strips' },
                { key: 'categoryChart', label: 'Cause Category Performance Chart' },
                { key: 'trafficFunnel', label: 'Traffic & Channel Conversion Funnel' },
                { key: 'recentActivity', label: 'Immutable Audit Trail Ledger' },
              ].map((w) => (
                <label key={w.key} className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                  <span className="text-xs font-semibold text-neutral-700">{w.label}</span>
                  <input
                    type="checkbox"
                    checked={visibleWidgets[w.key as keyof typeof visibleWidgets]}
                    onChange={() => toggleWidget(w.key as keyof typeof visibleWidgets)}
                    className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                  />
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <Button size="sm" onClick={() => setShowCustomizeModal(false)}>
                Save Widget Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
