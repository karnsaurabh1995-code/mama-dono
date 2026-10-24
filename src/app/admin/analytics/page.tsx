'use client';

import React, { useState, useMemo } from 'react';
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
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Heart,
  Package,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

export default function AnalyticsHubPage() {
  const [period, setPeriod] = useState<string>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'createdAt' | 'amount' | 'netCampaignAmount' | 'platformFeeAmount' | 'dokindContributionAmount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const allCampaigns = db.getCampaigns();

  // Fetch detailed analytics with reactive filters
  const analyticsData = useMemo(() => {
    return db.getDetailedFinancialAnalytics({
      period,
      startDate: period === 'custom' ? customStartDate : undefined,
      endDate: period === 'custom' ? customEndDate : undefined,
      campaignId: selectedCampaignId,
      status: selectedStatus,
    });
  }, [period, customStartDate, customEndDate, selectedCampaignId, selectedStatus]);

  const { summary, timeline, paymentOutcomes, itemGivingAnalytics, filteredDonations } = analyticsData;

  // Filtered and sorted table data
  const processedTableData = useMemo(() => {
    let list = [...filteredDonations];

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      list = list.filter(
        (d) =>
          d.donorName.toLowerCase().includes(q) ||
          d.donorEmail.toLowerCase().includes(q) ||
          d.campaignTitle.toLowerCase().includes(q) ||
          d.receiptNumber.toLowerCase().includes(q) ||
          (d.razorpayPaymentId && d.razorpayPaymentId.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      let valA: any = a[sortField] ?? 0;
      let valB: any = b[sortField] ?? 0;

      if (sortField === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    return list;
  }, [filteredDonations, tableSearch, sortField, sortDirection]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Donation ID',
      'Receipt Number',
      'Date & Time',
      'Donor Name',
      'Donor Email',
      'PAN',
      'Campaign Title',
      'Gross Amount (INR)',
      'Platform Fee 5% (INR)',
      'Net Campaign Amount (INR)',
      'Dokind Foundation Extra (INR)',
      'Voluntary Tip (INR)',
      'Total Paid (INR)',
      'Payment Status',
      'Payment Method',
    ];

    const rows = processedTableData.map((d) => [
      d.id,
      d.receiptNumber,
      `"${new Date(d.createdAt).toLocaleString('en-IN')}"`,
      `"${d.isAnonymous ? 'Anonymous' : d.donorName}"`,
      d.donorEmail,
      d.donorPan || 'N/A',
      `"${d.campaignTitle.replace(/"/g, '""')}"`,
      d.grossAmount || d.amount,
      d.platformFeeAmount ?? Math.round((d.grossAmount || d.amount) * 0.05),
      d.netCampaignAmount ?? Math.round((d.grossAmount || d.amount) * 0.95),
      d.dokindContributionAmount ?? 0,
      d.tipAmount,
      d.totalAmount,
      d.status,
      d.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dokind_financial_analytics_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // SVG Chart Maximum calculation for scaling
  const maxTimelineAmount = Math.max(
    1000,
    ...timeline.map((t) => Math.max(t.grossAmount, t.netCampaignAmount, t.platformFeeAmount * 5))
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Quick Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Executive Analytics & Accounting
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Financial & Campaign Analytics
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Transparent gross vs. net reconciliation, 5% platform fee accounting, Dokind Foundation contributions, and donor velocities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/admin/analytics/campaigns">
            <Button size="sm" variant="outline" className="text-xs">
              <Layers className="w-3.5 h-3.5 mr-1 text-[#EF4949]" />
              Campaign Comparison
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="bg-[#202124] hover:bg-black text-white text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV ({processedTableData.length})
          </Button>
        </div>
      </div>

      {/* 2. Interactive Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Period Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-xs font-bold text-neutral-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Period:</span>
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-[#202124] text-white shadow-xs'
                    : 'bg-neutral-100 text-[#555B63] hover:bg-neutral-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Campaign Selector & Status Filter */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Campaign Select */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-500">Campaign:</span>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E84B45] max-w-[200px] truncate"
              >
                <option value="all">All Campaigns ({allCampaigns.length})</option>
                {allCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E84B45]"
              >
                <option value="all">All Statuses</option>
                <option value="succeeded">Succeeded</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Date Pickers if 'custom' is active */}
        {period === 'custom' && (
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-3 text-xs animate-in fade-in">
            <span className="font-bold text-neutral-700">From Date:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs"
            />
            <span className="font-bold text-neutral-700">To Date:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs"
            />
          </div>
        )}
      </div>

      {/* 3. High-Fidelity Financial KPI Cards (Separated Accounting Formulas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Donations */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Donations</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#202124] font-mono">
            {formatINR(summary.grossDonations)}
          </p>
          <p className="text-[11px] text-neutral-500">
            {summary.successfulDonorsCount} successful donor gifts • Avg {formatINR(summary.averageGift)}
          </p>
        </div>

        {/* Net Campaign Allocation */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Net Campaign Proceeds</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
            {formatINR(summary.netCampaignAllocation)}
          </p>
          <p className="text-[11px] text-neutral-500">
            Allocated directly to hospital/NGO beneficiary accounts
          </p>
        </div>

        {/* Platform Fee & Dokind Extra */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Dokind Allocation</span>
            <ShieldCheck className="w-4 h-4 text-[#EF4949]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#EF4949] font-mono">
            {formatINR(summary.totalDokindAllocation)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
            <span>5% Fee: {formatINR(summary.platformFees)}</span>
            <span>Extra: {formatINR(summary.dokindContributions)}</span>
          </div>
        </div>

        {/* Refunds & Item Giving */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Refunds & Reversals</span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {formatINR(summary.refunds)}
          </p>
          <p className="text-[11px] text-neutral-500">
            {paymentOutcomes.refunded} settled chargeback/refund adjustments
          </p>
        </div>
      </div>

      {/* 4. Graph-Based Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline SVG Chart: Financial Volume & Fee Trends (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-[#202124]">
                Financial Flow & Allocation Trend Over Time
              </h3>
              <p className="text-xs text-[#555B63]">
                Daily timeline tracking gross incoming donations, net campaign allocation, and Dokind operational allocation.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-neutral-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#202124]" />
                Gross
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Net Campaign
              </span>
              <span className="flex items-center gap-1.5 text-[#EF4949]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4949]" />
                Platform Fee (5%)
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="h-64 w-full relative pt-4 flex flex-col justify-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="0" x2="700" y2="0" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="50" x2="700" y2="50" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="#f1f3f5" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="200" x2="700" y2="200" stroke="#e2e4e9" strokeWidth="1.5" />

              {/* Data bars / points */}
              {timeline.map((point, idx) => {
                const step = 700 / (timeline.length || 1);
                const x = idx * step + step / 2;
                const grossHeight = Math.min(185, (point.grossAmount / maxTimelineAmount) * 185);
                const netHeight = Math.min(185, (point.netCampaignAmount / maxTimelineAmount) * 185);
                const feeHeight = Math.min(185, (point.platformFeeAmount / maxTimelineAmount) * 185 * 3);

                return (
                  <g key={point.date} className="group cursor-pointer">
                    {/* Gross Bar */}
                    <rect
                      x={x - 14}
                      y={200 - grossHeight}
                      width={12}
                      height={grossHeight}
                      rx={3}
                      className="fill-neutral-800 hover:fill-neutral-900 transition-all opacity-90"
                    />
                    {/* Net Bar */}
                    <rect
                      x={x + 1}
                      y={200 - netHeight}
                      width={12}
                      height={netHeight}
                      rx={3}
                      className="fill-blue-500 hover:fill-blue-600 transition-all opacity-90"
                    />

                    {/* Tooltip on hover */}
                    <title>{`${point.label}: Gross ${formatINR(point.grossAmount)} | Net ${formatINR(point.netCampaignAmount)} | Fee ${formatINR(point.platformFeeAmount)} (${point.donationCount} donations)`}</title>
                  </g>
                );
              })}
            </svg>

            {/* X-axis date labels */}
            <div className="flex justify-between pt-2 border-t border-neutral-100 text-[10px] text-neutral-400 font-medium">
              {timeline.map((p, i) => (
                <span
                  key={p.date}
                  className={i % 2 === 0 ? 'block' : 'hidden sm:block'}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Payment Outcomes & Item Analytics (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Outcomes Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#202124] flex items-center justify-between">
              <span>Payment Gateway Outcomes</span>
              <span className="text-[11px] font-mono text-neutral-400">
                {paymentOutcomes.total} total
              </span>
            </h3>

            <div className="space-y-2 pt-1 text-xs">
              <div>
                <div className="flex justify-between font-semibold pb-1">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Succeeded ({paymentOutcomes.succeeded})
                  </span>
                  <span className="font-mono">
                    {paymentOutcomes.total > 0
                      ? `${Math.round((paymentOutcomes.succeeded / paymentOutcomes.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${paymentOutcomes.total > 0 ? (paymentOutcomes.succeeded / paymentOutcomes.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold pb-1">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Pending ({paymentOutcomes.pending})
                  </span>
                  <span className="font-mono">
                    {paymentOutcomes.total > 0
                      ? `${Math.round((paymentOutcomes.pending / paymentOutcomes.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${paymentOutcomes.total > 0 ? (paymentOutcomes.pending / paymentOutcomes.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold pb-1">
                  <span className="text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Refunded ({paymentOutcomes.refunded})
                  </span>
                  <span className="font-mono">
                    {paymentOutcomes.total > 0
                      ? `${Math.round((paymentOutcomes.refunded / paymentOutcomes.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${paymentOutcomes.total > 0 ? (paymentOutcomes.refunded / paymentOutcomes.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item-Giving & Product Fulfillment Metric */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Product Giving Analytics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E2E4E9]">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Items Funded
                </span>
                <span className="text-xl font-black text-[#202124] font-mono mt-1 block">
                  {itemGivingAnalytics.totalItemsFunded} units
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E2E4E9]">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Wholesale Value
                </span>
                <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">
                  {formatINR(itemGivingAnalytics.totalItemValueFunded)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#555B63] leading-relaxed">
              Wholesale procurement pipelines verified with GST invoices and geotagged delivery acknowledgments.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive Performance & Accounting Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#202124]">
              Transaction Performance & Reconciliation Table
            </h3>
            <p className="text-xs text-[#555B63]">
              Showing {processedTableData.length} records matching current filter criteria.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search donor, receipt, campaign..."
              className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#E84B45]"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="border-y border-neutral-200 bg-[#FAF9F6] text-neutral-600 font-bold">
                <th
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-4 cursor-pointer hover:text-black"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Receipt</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Donor & PAN</th>
                <th className="py-3 px-4">Campaign</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Gross</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('platformFeeAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Fee (5%)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dokindContributionAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Dokind Extra</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('netCampaignAmount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-black"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net to Cause</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {processedTableData.slice(0, 50).map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#202124] block">
                      {d.receiptNumber}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(d.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#202124] block">
                      {d.isAnonymous ? 'Anonymous Donor' : d.donorName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {d.donorPan || d.donorEmail}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-[200px]">
                    <span className="truncate block font-medium text-[#202124]" title={d.campaignTitle}>
                      {d.campaignTitle}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                    {formatINR(d.grossAmount || d.amount)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                    {formatINR(d.platformFeeAmount ?? Math.round((d.grossAmount || d.amount) * 0.05))}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-[#EF4949] font-semibold">
                    {(d.dokindContributionAmount ?? 0) > 0 ? `+ ${formatINR(d.dokindContributionAmount ?? 0)}` : '₹0'}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                    {formatINR(d.netCampaignAmount ?? Math.round((d.grossAmount || d.amount) * 0.95))}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        d.status === 'succeeded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : d.status === 'refunded'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : d.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}

              {processedTableData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
