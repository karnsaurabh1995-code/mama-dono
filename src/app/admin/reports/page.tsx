'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileCheck,
  Calendar,
  Building2,
  DollarSign,
  ArrowRightLeft,
} from 'lucide-react';

export default function ExportReportsPage() {
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encoded);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify(`Report "${filename}" downloaded.`);
  };

  // 1. 80G Tax Compliance Report
  const handleDownload80GReport = () => {
    const donations = db.getDonations({ status: 'succeeded' }).filter((d) => d.taxExemption80G);
    const headers = ['Receipt Number', 'Date', 'Donor Name', 'Donor PAN', 'Donor Email', 'Donor Phone', 'Campaign Title', 'Amount (INR)', '80G Deduction Eligible'];
    const rows = donations.map((d) => [
      d.receiptNumber,
      d.createdAt.split('T')[0],
      `"${d.donorName}"`,
      d.donorPan || 'N/A',
      d.donorEmail,
      d.donorPhone || 'N/A',
      `"${d.campaignTitle}"`,
      d.amount,
      'YES (50% Deduction under Sec 80G)',
    ]);
    downloadCSV(`sevasetu_80G_tax_report_${Date.now()}.csv`, headers, rows);
  };

  // 2. All Transactions Master Ledger
  const handleDownloadMasterLedger = () => {
    const donations = db.getDonations();
    const headers = ['Donation ID', 'Receipt Number', 'Date', 'Donor', 'Email', 'Campaign', 'Amount', 'Tip', 'Status', 'Gateway Order ID', 'Payment Mode'];
    const rows = donations.map((d) => [
      d.id,
      d.receiptNumber,
      d.createdAt,
      `"${d.donorName}"`,
      d.donorEmail,
      `"${d.campaignTitle}"`,
      d.amount,
      d.tipAmount,
      d.status,
      d.razorpayOrderId,
      d.paymentMethod,
    ]);
    downloadCSV(`sevasetu_master_ledger_${Date.now()}.csv`, headers, rows);
  };

  // 3. Campaign Performance Summary
  const handleDownloadCampaignsReport = () => {
    const campaigns = db.getCampaigns();
    const headers = ['Campaign ID', 'Title', 'Category', 'Goal Amount', 'Raised Amount', 'Percentage Funded', 'Donors Count', 'Status', 'Has 80G', 'Organizer Name'];
    const rows = campaigns.map((c) => [
      c.id,
      `"${c.title}"`,
      c.category,
      c.goalAmount,
      c.raisedAmount,
      `${Math.round((c.raisedAmount / c.goalAmount) * 100)}%`,
      c.supporterCount,
      c.status,
      c.has80G ? 'YES' : 'NO',
      `"${c.organizerName}"`,
    ]);
    downloadCSV(`sevasetu_campaigns_summary_${Date.now()}.csv`, headers, rows);
  };

  // 4. Offline Wire Vouchers Report
  const handleDownloadWiresReport = () => {
    const wires = db.getManualDonations();
    const headers = ['Voucher ID', 'Deposit Date', 'UTR Reference', 'Bank Name', 'Donor Name', 'PAN', 'Amount (INR)', 'Target Campaign', 'Status', 'Reconciled By'];
    const rows = wires.map((w) => [
      w.id,
      w.depositDate,
      w.paymentReference,
      `"${w.bankName}"`,
      `"${w.donorName}"`,
      w.donorPan || 'N/A',
      w.amount,
      `"${w.campaignTitle}"`,
      w.status,
      w.reconciledBy || 'Pending',
    ]);
    downloadCSV(`sevasetu_bank_wire_reconciliations_${Date.now()}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Compliance & Exports</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Financial Reports & Tax Export Center
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Download certified audit extracts formatted for Indian Income Tax Form 10BE and statutory trust audits.
          </p>
        </div>
      </div>

      {/* Toast notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: Section 80G Compliance */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#25845B] flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">
              Section 80G Tax Exemption Statement (Form 10BE)
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Complete register of all donor PAN numbers, receipt dates, donation amounts, and unique receipt numbers for annual Income Tax portal upload.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">CSV Spreadsheet</span>
            <Button size="sm" onClick={handleDownload80GReport} className="bg-[#25845B] hover:bg-[#1E6B49] text-white text-xs">
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Form 10BE CSV
            </Button>
          </div>
        </div>

        {/* Report 2: Transactions Master Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">
              Master Financial Transactions Register
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Every settled, pending, and refunded donation across UPI, cards, and simulated payment gateways with timestamps and order IDs.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Full Transaction Log</span>
            <Button size="sm" onClick={handleDownloadMasterLedger} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Master Ledger
            </Button>
          </div>
        </div>

        {/* Report 3: Campaign Performance */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">
              Campaign Performance & Milestone Summary
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Goal amount vs verified raised balance, supporter counts, category taxonomy, and organizer details for all campaigns.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Campaign Analytics</span>
            <Button size="sm" variant="outline" onClick={handleDownloadCampaignsReport} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Summary CSV
            </Button>
          </div>
        </div>

        {/* Report 4: Bank Wire Reconciliation */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">
              Offline Wire Reconciliation Log
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Audit log of all manual NEFT/RTGS bank transfers, cheque vouchers, depositor references, and finance operator sign-offs.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Banking Ledger</span>
            <Button size="sm" variant="outline" onClick={handleDownloadWiresReport} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Wires CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
