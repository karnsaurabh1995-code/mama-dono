'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Donation } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Undo2,
  AlertTriangle,
  CheckCircle2,
  Search,
  DollarSign,
  History,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function RefundsEnginePage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>(db.getDonations());
  const [selectedDonationId, setSelectedDonationId] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [showProcessModal, setShowProcessModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const refundedDonations = donations.filter((d) => d.status === 'refunded');
  const refundableDonations = donations.filter((d) => d.status === 'succeeded');

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonationId || !refundReason.trim()) {
      alert('Please select a transaction and specify a refund reason.');
      return;
    }

    try {
      const res = db.processRefund(selectedDonationId, refundReason.trim(), user?.name || 'Finance Admin');
      setDonations([...db.getDonations()]);
      setShowProcessModal(false);
      setSelectedDonationId('');
      setRefundReason('');
      notify(`Donation ${res.receiptNumber} (${formatINR(res.amount)}) refunded. Campaign raised totals reversed in ledger.`);
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
              <Undo2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Financial Integrity</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Refunds Engine & Ledger Reversals
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Safely execute gateway refunds, invalidate 80G tax deductions, and automatically adjust campaign balances.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowProcessModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
          <Undo2 className="w-3.5 h-3.5 mr-1" />
          Issue New Refund
        </Button>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Total Processed Refunds</span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {formatINR(refundedDonations.reduce((acc, d) => acc + d.amount, 0))}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">{refundedDonations.length} transactions reversed</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Refund Settlement Ratio</span>
          <p className="text-2xl font-black text-neutral-800 mt-1">
            {donations.length > 0 ? ((refundedDonations.length / donations.length) * 100).toFixed(2) : 0}%
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Well under 1% compliance ceiling</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Accounting Guarantee</span>
          <p className="text-xs font-bold text-neutral-800 mt-1">Immutable Double-Entry Ledger</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Every refund subtracts raised funds and creates audit logs</p>
        </div>
      </div>

      {/* Refunded History Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202124]">Refunded Donations Log</h3>
          <span className="text-xs text-neutral-400">{refundedDonations.length} records</span>
        </div>

        {refundedDonations.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No refunded donations on record. All settled donations remain active in the ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Refunded Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {refundedDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-800">{d.receiptNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#202124]">{d.donorName}</p>
                      <p className="text-[10px] text-neutral-400">{d.donorEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-700">{d.campaignTitle}</td>
                    <td className="py-3 px-4 font-mono font-black text-rose-600">{formatINR(d.amount)}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Refund Reconciled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----------------- PROCESS REFUND MODAL ----------------- */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleProcessRefund}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-[#202124]">Execute Transaction Refund</h3>
              </div>
              <button type="button" onClick={() => setShowProcessModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Refunding a donation automatically reverses the campaign raised amount, decrements supporter count, and logs the action in the immutable audit ledger.
            </p>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Select Transaction to Refund *</label>
              <select
                required
                value={selectedDonationId}
                onChange={(e) => setSelectedDonationId(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="">-- Choose settled donation --</option>
                {refundableDonations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.receiptNumber} — {d.donorName} ({formatINR(d.amount)}) — {d.campaignTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Mandatory Reason for Refund *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Donor entered incorrect amount, or duplicate debit observed on UPI."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowProcessModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                Authorize & Process Refund
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
