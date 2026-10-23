'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Donation, PaymentStatus } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  DollarSign,
  Search,
  Filter,
  FileSpreadsheet,
  FileCheck,
  Undo2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export default function DonationsLedgerPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>(db.getDonations());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [taxOnly, setTaxOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredDonations = donations.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (methodFilter !== 'all' && d.paymentMethod !== methodFilter) return false;
    if (taxOnly && !d.taxExemption80G) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesName = d.donorName.toLowerCase().includes(q);
      const matchesEmail = d.donorEmail.toLowerCase().includes(q);
      const matchesReceipt = d.receiptNumber.toLowerCase().includes(q);
      const matchesCamp = d.campaignTitle.toLowerCase().includes(q);
      if (!matchesName && !matchesEmail && !matchesReceipt && !matchesCamp) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Date', 'Donor Name', 'Donor Email', 'PAN', 'Campaign', 'Amount (INR)', 'Tip', 'Status', 'Payment Method'];
    const rows = filteredDonations.map((d) => [
      d.receiptNumber,
      d.createdAt,
      `"${d.donorName}"`,
      d.donorEmail,
      d.donorPan || 'N/A',
      `"${d.campaignTitle}"`,
      d.amount,
      d.tipAmount,
      d.status,
      d.paymentMethod,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sevasetu_donations_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Exported ${filteredDonations.length} transactions to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <DollarSign className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Financial Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Donations Ledger & 80G Tax Receipts
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Real-time transaction register with donor tax compliance and direct gateway audit IDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/refunds">
            <Button variant="outline" size="sm" className="text-xs">
              <Undo2 className="w-3.5 h-3.5 mr-1" />
              Refunds Center
            </Button>
          </Link>
          <Button size="sm" onClick={handleExportCSV} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
            Export Filtered CSV
          </Button>
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

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by receipt #, donor name, email, or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-800"
        >
          <option value="all">All Payment Statuses</option>
          <option value="succeeded">Succeeded (Settled)</option>
          <option value="pending">Pending Gateway</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>

        {/* Payment Method Filter */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-800"
        >
          <option value="all">All Payment Methods</option>
          <option value="upi">UPI (GPay / PhonePe)</option>
          <option value="card">Cards (RuPay/Visa/MC)</option>
          <option value="netbanking">NetBanking & Direct Wire</option>
        </select>

        {/* 80G Tax Only Checkbox */}
        <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 cursor-pointer px-2">
          <input
            type="checkbox"
            checked={taxOnly}
            onChange={(e) => setTaxOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
          />
          <span>80G Tax Claims Only</span>
        </label>
      </div>

      {/* Master Donations Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Receipt & Date</th>
                <th className="py-3 px-4">Donor Details</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredDonations.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-neutral-900">{d.receiptNumber}</p>
                    <p className="text-[10px] text-neutral-400">{formatDate(d.createdAt)}</p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-[#202124]">{d.donorName}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <span>{d.donorEmail}</span>
                      {d.donorPan && (
                        <span className="font-mono bg-neutral-100 text-neutral-700 px-1 rounded font-bold">
                          {d.donorPan}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-neutral-800 line-clamp-1">{d.campaignTitle}</p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-neutral-600 capitalize bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                      {d.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-black text-sm text-[#202124]">
                    {formatINR(d.amount)}
                    {d.tipAmount > 0 && (
                      <span className="text-[10px] text-neutral-400 block font-normal">+ ₹{d.tipAmount} tip</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'succeeded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : d.status === 'refunded'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/account/donations/${d.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E84B45] hover:underline"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>80G Receipt</span>
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
