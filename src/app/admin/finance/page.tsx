'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Donation, ManualDonation, Campaign } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  DollarSign,
  ArrowRightLeft,
  Undo2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Plus,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminFinanceHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'wires' | 'refunds' | 'campaigns'>('overview');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [manualDonations, setManualDonations] = useState<ManualDonation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedDonationForRefund, setSelectedDonationForRefund] = useState<Donation | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Wire Voucher Modal State
  const [showWireModal, setShowWireModal] = useState(false);
  const [wireCampaignId, setWireCampaignId] = useState('');
  const [wireDonorName, setWireDonorName] = useState('');
  const [wireDonorEmail, setWireDonorEmail] = useState('');
  const [wireDonorPhone, setWireDonorPhone] = useState('');
  const [wireDonorPan, setWireDonorPan] = useState('');
  const [wireAmount, setWireAmount] = useState<number>(25000);
  const [wireUtr, setWireUtr] = useState('');
  const [wireBankName, setWireBankName] = useState('State Bank of India');
  const [wireDepositDate, setWireDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [wireNotes, setWireNotes] = useState('');

  const refreshData = () => {
    setDonations(db.getDonations());
    setManualDonations(db.getManualDonations());
    setCampaigns(db.getCampaigns());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Calculations
  const succeededDonations = donations.filter((d) => d.status === 'succeeded');
  const refundedDonations = donations.filter((d) => d.status === 'refunded');
  const pendingWires = manualDonations.filter((w) => w.status === 'pending');

  const grossSuccessful = succeededDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalRefunded = refundedDonations.reduce((sum, d) => sum + d.amount, 0);
  const netRecognized = grossSuccessful - totalRefunded;
  const pendingWireTotal = pendingWires.reduce((sum, w) => sum + w.amount, 0);

  // Filtered Donations
  const filteredDonations = donations.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesReceipt = d.receiptNumber.toLowerCase().includes(q);
      const matchesDonor = d.donorName.toLowerCase().includes(q);
      const matchesEmail = d.donorEmail.toLowerCase().includes(q);
      const matchesCamp = d.campaignTitle.toLowerCase().includes(q);
      if (!matchesReceipt && !matchesDonor && !matchesEmail && !matchesCamp) return false;
    }
    return true;
  });

  // Filtered Wires
  const filteredWires = manualDonations.filter((w) => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesUtr = w.paymentReference.toLowerCase().includes(q);
      const matchesDonor = w.donorName.toLowerCase().includes(q);
      const matchesBank = w.bankName.toLowerCase().includes(q);
      const matchesCamp = w.campaignTitle.toLowerCase().includes(q);
      if (!matchesUtr && !matchesDonor && !matchesBank && !matchesCamp) return false;
    }
    return true;
  });

  // Handle Approve Wire
  const handleApproveWire = (voucherId: string) => {
    try {
      const updated = db.reconcileManualDonation(
        voucherId,
        'approved',
        user?.name || 'Finance Administrator',
        'Bank credit verified via online corporate banking statement'
      );
      if (updated) {
        refreshData();
        notify(`Wire voucher ${voucherId} confirmed and reconciled. Campaign total updated.`);
      }
    } catch (err: any) {
      notify(`Reconciliation failed: ${err.message}`);
    }
  };

  // Handle Process Refund
  const handleExecuteRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonationForRefund || !refundReason.trim()) return;

    try {
      const actor = user
        ? { id: user.id, name: user.name, role: user.role }
        : { id: 'usr-finance-1', name: 'Finance Administrator', role: 'finance' as const };

      db.processRefund(selectedDonationForRefund.id, refundReason.trim(), actor);
      refreshData();
      setShowRefundModal(false);
      setSelectedDonationForRefund(null);
      setRefundReason('');
      notify(`Donation ${selectedDonationForRefund.receiptNumber} refunded successfully.`);
    } catch (err: any) {
      notify(`Refund failed: ${err.message}`);
    }
  };

  // Handle Submit Wire Voucher
  const handleCreateWireVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCamp = campaigns.find((c) => c.id === wireCampaignId) || campaigns[0];
    if (!targetCamp) return;

    try {
      const newVoucher: ManualDonation = {
        id: `wire-${Date.now()}`,
        campaignId: targetCamp.id,
        campaignTitle: targetCamp.title,
        donorName: wireDonorName.trim(),
        donorEmail: wireDonorEmail.trim(),
        donorPhone: wireDonorPhone.trim(),
        donorPan: wireDonorPan.trim().toUpperCase(),
        amount: Number(wireAmount),
        paymentReference: wireUtr.trim(),
        bankName: wireBankName.trim(),
        depositDate: wireDepositDate,
        status: 'pending',
        notes: wireNotes.trim(),
        taxExemption80G: true,
        createdAt: new Date().toISOString(),
      };

      db.createManualDonation(newVoucher);
      refreshData();
      setShowWireModal(false);
      setWireDonorName('');
      setWireDonorEmail('');
      setWireUtr('');
      notify(`Offline wire voucher of ${formatINR(newVoucher.amount)} recorded for review.`);
    } catch (err: any) {
      notify(`Failed to record voucher: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E84B45]">
            <DollarSign className="w-4 h-4" />
            <span>Finance & Gateway Reconciliation Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Financial Ledger & Settlement Operations
          </h1>
          <p className="text-xs text-[#555B63] mt-1 max-w-2xl">
            Authoritative transactional ledger, bank wire voucher reconciliations, gateway fees, and statutory 80G tax receipt records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/reports">
            <Button variant="outline" size="sm" className="text-xs font-bold border-[#E2E4E9] hover:bg-neutral-50">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-[#E84B45]" />
              Export Financial Reports
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => {
              if (campaigns.length > 0) setWireCampaignId(campaigns[0].id);
              setShowWireModal(true);
            }}
            className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Record Offline Wire
          </Button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
      )}

      {/* 2. Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Gross Collections</span>
          <div className="text-2xl font-black text-[#202124]">{formatINR(grossSuccessful)}</div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{succeededDonations.length} successful donations</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Net Recognized Funds</span>
          <div className="text-2xl font-black text-[#15803D]">{formatINR(netRecognized)}</div>
          <p className="text-[11px] text-neutral-400 font-medium">Net after refund reversals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Pending Wire Vouchers</span>
          <div className="text-2xl font-black text-amber-600">{formatINR(pendingWireTotal)}</div>
          <p className="text-[11px] text-amber-700 font-medium">{pendingWires.length} deposits awaiting bank match</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Refunds Processed</span>
          <div className="text-2xl font-black text-rose-600">{formatINR(totalRefunded)}</div>
          <p className="text-[11px] text-neutral-400 font-medium">{refundedDonations.length} reversed transactions</p>
        </div>
      </div>

      {/* 3. Operational Navigation Tabs */}
      <div className="flex border-b border-[#E2E4E9] space-x-2 overflow-x-auto bg-white px-4 pt-3 rounded-t-2xl border-t border-x">
        {[
          { id: 'overview', label: '1. Financial Summary', count: null },
          { id: 'donations', label: '2. Donations Ledger', count: donations.length },
          { id: 'wires', label: '3. Wire Vouchers & Settlements', count: pendingWires.length > 0 ? pendingWires.length : manualDonations.length },
          { id: 'refunds', label: '4. Refunds Engine', count: refundedDonations.length },
          { id: 'campaigns', label: '5. Campaign Financial Details', count: campaigns.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-[#E84B45] text-[#E84B45]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-[#FFF0EF] text-[#E84B45]' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-b-2xl border border-[#E2E4E9] shadow-2xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#202124]">Financial Accounting Breakdown</h2>
            <p className="text-xs text-neutral-500">
              Platform accounting summary according to established Indian trust and escrow accounting standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Inflow Sources</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Razorpay Online Gateway (Cards, UPI, Netbanking):</span>
                  <span className="font-bold text-[#202124]">
                    {formatINR(succeededDonations.reduce((s, d) => s + d.amount, 0))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Reconciled Corporate & Bank Wire Transfers:</span>
                  <span className="font-bold text-[#202124]">
                    {formatINR(manualDonations.filter((w) => w.status === 'approved').reduce((s, w) => s + w.amount, 0))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Donor Voluntary Tips (Platform Sustainability):</span>
                  <span className="font-bold text-emerald-700">
                    {formatINR(succeededDonations.reduce((s, d) => s + (d.tipAmount || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-neutral-900">
                  <span>Total Gross Platform Inflows:</span>
                  <span>{formatINR(grossSuccessful)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Outflows & Reversals</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Donor Refund Reversals:</span>
                  <span className="font-bold text-rose-600">{formatINR(totalRefunded)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Estimated Gateway Processing Escrow (Approx 2%):</span>
                  <span className="font-bold text-neutral-700">
                    {formatINR(Math.round(grossSuccessful * 0.02))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-200/60">
                  <span className="text-neutral-600">Net Hospital & NGO Beneficiary Proceeds:</span>
                  <span className="font-bold text-emerald-800">
                    {formatINR(Math.round(netRecognized * 0.98))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-neutral-900">
                  <span>Net Recognized Platform Funds:</span>
                  <span className="text-emerald-700">{formatINR(netRecognized)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DONATIONS LEDGER */}
      {activeTab === 'donations' && (
        <div className="bg-white p-6 rounded-b-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by receipt #, donor name, email, or campaign..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E4E9] rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              >
                <option value="all">All Statuses</option>
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <Link href="/admin/reports">
                <Button size="sm" variant="outline" className="text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                  Export Ledger
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Receipt / ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Donor</th>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400">
                      No donation records matching the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#202124]">
                        {d.receiptNumber}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                        {formatDate(d.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#202124]">
                          {d.isAnonymous ? 'Anonymous Donor' : d.donorName}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">{d.donorEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 max-w-xs truncate">
                        {d.campaignTitle}
                      </td>
                      <td className="px-4 py-3 font-bold text-neutral-900 whitespace-nowrap">
                        {formatINR(d.amount)}
                        {d.tipAmount ? (
                          <span className="text-[10px] text-neutral-400 font-normal block">
                            + {formatINR(d.tipAmount)} tip
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-neutral-600 uppercase">
                        {d.paymentMethod}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            d.status === 'succeeded'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : d.status === 'refunded'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {d.status === 'succeeded' && (
                          <button
                            onClick={() => {
                              setSelectedDonationForRefund(d);
                              setShowRefundModal(true);
                            }}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: WIRE VOUCHERS */}
      {activeTab === 'wires' && (
        <div className="bg-white p-6 rounded-b-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by UTR reference, donor name, or bank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E4E9] rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <Button
              size="sm"
              onClick={() => {
                if (campaigns.length > 0) setWireCampaignId(campaigns[0].id);
                setShowWireModal(true);
              }}
              className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Record New Deposit
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">UTR / Reference</th>
                  <th className="px-4 py-3">Bank Name</th>
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Reconciliation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredWires.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400">
                      No offline wire vouchers found.
                    </td>
                  </tr>
                ) : (
                  filteredWires.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#202124]">
                        {w.paymentReference}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{w.bankName}</td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{w.donorName}</td>
                      <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{w.campaignTitle}</td>
                      <td className="px-4 py-3 font-black text-neutral-900">{formatINR(w.amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {w.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleApproveWire(w.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg"
                          >
                            Confirm Deposit
                          </Button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Reconciled ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: REFUNDS */}
      {activeTab === 'refunds' && (
        <div className="bg-white p-6 rounded-b-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#202124]">Processed Refund Audit Records</h2>
            <p className="text-xs text-neutral-500">
              Audit log of reversed donations. Each refund automatically reverses the campaign's raised amount in the ledger.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Receipt Number</th>
                  <th className="px-4 py-3">Donor</th>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Refund Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {refundedDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-400">
                      No refunds have been processed on the platform.
                    </td>
                  </tr>
                ) : (
                  refundedDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-neutral-900">{d.receiptNumber}</td>
                      <td className="px-4 py-3 text-neutral-700">{d.donorName}</td>
                      <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{d.campaignTitle}</td>
                      <td className="px-4 py-3 font-bold text-rose-600">{formatINR(d.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                          Refunded & Reversed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CAMPAIGNS BREAKDOWN */}
      {activeTab === 'campaigns' && (
        <div className="bg-white p-6 rounded-b-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#202124]">Campaign-Level Financial Performance</h2>
            <p className="text-xs text-neutral-500">
              Breakdown of gross donations, platform accounting, and net proceeds for each active fundraiser.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Campaign Title</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Goal</th>
                  <th className="px-4 py-3">Gross Raised</th>
                  <th className="px-4 py-3">Net Proceeds (95%)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {campaigns.map((c) => {
                  const net = c.netRaisedAmount || Math.round(c.raisedAmount * 0.95);
                  return (
                    <tr key={c.id} className="hover:bg-neutral-50/60 transition">
                      <td className="px-4 py-3 font-bold text-[#202124] max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{c.organizerName}</td>
                      <td className="px-4 py-3 text-neutral-900">{formatINR(c.goalAmount)}</td>
                      <td className="px-4 py-3 font-bold text-neutral-900">{formatINR(c.raisedAmount)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">{formatINR(net)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/campaigns/${c.id}`}
                          className="text-[11px] font-bold text-[#E84B45] hover:underline"
                        >
                          View Hub →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: PROCESS REFUND */}
      {showRefundModal && selectedDonationForRefund && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-neutral-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Undo2 className="w-4 h-4" />
                <span>Authorize Refund</span>
              </div>
              <button onClick={() => setShowRefundModal(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <div>Receipt: <strong className="font-mono text-neutral-900">{selectedDonationForRefund.receiptNumber}</strong></div>
              <div>Donor: <strong className="text-neutral-900">{selectedDonationForRefund.donorName}</strong></div>
              <div>Amount: <strong className="text-rose-600 text-sm font-bold">{formatINR(selectedDonationForRefund.amount)}</strong></div>
              <div>Campaign: <span className="text-neutral-800">{selectedDonationForRefund.campaignTitle}</span></div>
            </div>

            <form onSubmit={handleExecuteRefund} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Audit Reason for Refund *</label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Donor accidental duplicate payment / Beneficiary target reached early"
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRefundModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                  Confirm Refund
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD WIRE VOUCHER */}
      {showWireModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-[#E84B45] font-bold text-sm">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Record Offline Bank Wire / Cheque Deposit</span>
              </div>
              <button onClick={() => setShowWireModal(false)} className="text-neutral-400 hover:text-neutral-700">✕</button>
            </div>

            <form onSubmit={handleCreateWireVoucher} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Target Campaign *</label>
                <select
                  required
                  value={wireCampaignId}
                  onChange={(e) => setWireCampaignId(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Donor Name *</label>
                  <input
                    type="text"
                    required
                    value={wireDonorName}
                    onChange={(e) => setWireDonorName(e.target.value)}
                    placeholder="Full individual or CSR entity name"
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Deposit Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={wireAmount}
                    onChange={(e) => setWireAmount(Number(e.target.value))}
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">UTR / Cheque Ref Number *</label>
                  <input
                    type="text"
                    required
                    value={wireUtr}
                    onChange={(e) => setWireUtr(e.target.value)}
                    placeholder="e.g. SBIN22091823901"
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={wireBankName}
                    onChange={(e) => setWireBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Donor Email *</label>
                  <input
                    type="email"
                    required
                    value={wireDonorEmail}
                    onChange={(e) => setWireDonorEmail(e.target.value)}
                    placeholder="For 80G tax receipt dispatch"
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Donor PAN (Optional)</label>
                  <input
                    type="text"
                    value={wireDonorPan}
                    onChange={(e) => setWireDonorPan(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Internal Audit Notes</label>
                <textarea
                  rows={2}
                  value={wireNotes}
                  onChange={(e) => setWireNotes(e.target.value)}
                  placeholder="CSR sanction letter reference or branch credit slip details"
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowWireModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold">
                  Record Deposit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
