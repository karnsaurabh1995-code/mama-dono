'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Campaign, CauseMeta, TagItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  HeartHandshake,
  Tag,
  Filter,
  Layers,
  FileCheck2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function ExportReportsPage() {
  const [reportType, setReportType] = useState<'donations_ledger' | 'tax_80g_compliance' | 'campaigns_summary'>('donations_ledger');
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [causes, setCauses] = useState<CauseMeta[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setCampaigns(db.getCampaigns());
    setCauses(db.getCauses());
    setTags(db.getTags());
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDownload = async (customType?: 'donations_ledger' | 'tax_80g_compliance' | 'campaigns_summary', customFormat?: 'xlsx' | 'csv') => {
    const targetType = customType || reportType;
    const targetFormat = customFormat || format;
    setIsExporting(true);

    try {
      const params = new URLSearchParams({
        type: targetType,
        format: targetFormat,
      });

      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedCampaignId !== 'all') params.set('campaignId', selectedCampaignId);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedTag !== 'all') params.set('tag', selectedTag);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const url = `/api/admin/reports/export?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition') || '';
      let filename = `dokind-${targetType}-${Date.now()}.${targetFormat}`;
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      notify(`Report "${filename}" generated and downloaded successfully.`);
    } catch (err: any) {
      console.error('Download error:', err);
      notify(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E84B45]">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Compliance, Auditing & Exports</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Certified Reports & Spreadsheet Export Center
          </h1>
          <p className="text-xs text-[#555B63] mt-1 max-w-2xl">
            Download certified audit records and financial extracts formatted for Indian Income Tax Form 10BE and statutory platform reporting in Excel (.xlsx) and CSV (.csv).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleDownload()}
            disabled={isExporting}
            className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating Report...' : `Export ${format.toUpperCase()}`}</span>
          </Button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
      )}

      {/* 2. Custom Report Configurator Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-6">
        <div className="border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#E84B45]" />
            <span>Report Parameter Selection & Filters</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure report type, date range, campaign, primary category, and output format before generating the export.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Report Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
            >
              <option value="donations_ledger">1. Donations Master Ledger (All Transactions)</option>
              <option value="tax_80g_compliance">2. Section 80G Statutory Compliance (Form 10BE)</option>
              <option value="campaigns_summary">3. Campaign Performance & Financial Audit</option>
            </select>
          </div>

          {/* Export File Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">File Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  format === 'xlsx'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-[#E2E4E9] text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  format === 'csv'
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-white border-[#E2E4E9] text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Campaign Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Filter Campaign Scope</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
            >
              <option value="all">All Campaigns (Platform Wide)</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title.length > 45 ? `${c.title.slice(0, 45)}...` : c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>
          </div>

          {/* Primary Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Primary Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
            >
              <option value="all">All Categories</option>
              {causes.map((c) => (
                <option key={c.id} value={c.slug || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Filter by Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
            >
              <option value="all">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.slug}>
                  #{t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="succeeded">Succeeded (Donations)</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            Formula injection protection active • UTF-8 Unicode compliant • Indian currency preserved
          </div>

          <Button
            onClick={() => handleDownload()}
            disabled={isExporting}
            className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : `Download ${format.toUpperCase()}`}</span>
          </Button>
        </div>
      </div>

      {/* 3. One-Click Standard Certified Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 80G Tax */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              80G
            </div>
            <h3 className="text-sm font-bold text-[#202124]">
              Section 80G Statutory Compliance Report
            </h3>
            <p className="text-xs text-[#555B63] leading-relaxed">
              Certified donor list with PAN cards, receipt numbers, and eligible deduction values for income tax Form 10BE filing.
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload('tax_80g_compliance', 'xlsx')}
              className="text-xs flex-1 text-emerald-800 border-emerald-200 hover:bg-emerald-50"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Excel (.xlsx)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload('tax_80g_compliance', 'csv')}
              className="text-xs text-neutral-600 hover:bg-neutral-50"
            >
              CSV
            </Button>
          </div>
        </div>

        {/* Card 2: Donations Master Ledger */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#202124]">
              Donations Master Transaction Ledger
            </h3>
            <p className="text-xs text-[#555B63] leading-relaxed">
              Every online card, UPI, netbanking, and offline bank transfer record with payment gateway IDs, tips, and fees.
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload('donations_ledger', 'xlsx')}
              className="text-xs flex-1 text-blue-800 border-blue-200 hover:bg-blue-50"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Excel (.xlsx)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload('donations_ledger', 'csv')}
              className="text-xs text-neutral-600 hover:bg-neutral-50"
            >
              CSV
            </Button>
          </div>
        </div>

        {/* Card 3: Campaigns Financial Summary */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#202124]">
              Campaign Financial & Performance Audit
            </h3>
            <p className="text-xs text-[#555B63] leading-relaxed">
              Target goals, gross collections, net receipts, donor counts, and homepage placements across all campaigns.
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload('campaigns_summary', 'xlsx')}
              className="text-xs flex-1 text-purple-800 border-purple-200 hover:bg-purple-50"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Excel (.xlsx)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload('campaigns_summary', 'csv')}
              className="text-xs text-neutral-600 hover:bg-neutral-50"
            >
              CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
