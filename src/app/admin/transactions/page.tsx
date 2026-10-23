'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { ManualDonation, Campaign } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react';

export default function TransactionsReconciliationPage() {
  const { user } = useAuth();
  const [manualDonations, setManualDonations] = useState<ManualDonation[]>(db.getManualDonations());
  const [campaigns] = useState<Campaign[]>(db.getCampaigns());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Form State for Recording Offline Donation
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorPan, setDonorPan] = useState('');
  const [amount, setAmount] = useState<number>(25000);
  const [paymentReference, setPaymentReference] = useState('');
  const [bankName, setBankName] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [supportingProofUrl, setSupportingProofUrl] = useState('');
  const [notes, setNotes] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredWires = manualDonations.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesName = d.donorName.toLowerCase().includes(q);
      const matchesRef = d.paymentReference.toLowerCase().includes(q);
      const matchesBank = d.bankName.toLowerCase().includes(q);
      const matchesCamp = d.campaignTitle.toLowerCase().includes(q);
      if (!matchesName && !matchesRef && !matchesBank && !matchesCamp) return false;
    }
    return true;
  });

  const handleRecordOfflineDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign) {
      alert('Please select a valid campaign.');
      return;
    }

    const created = db.createManualDonation(
      {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim() || undefined,
        donorPan: donorPan.trim().toUpperCase() || undefined,
        amount,
        paymentReference: paymentReference.trim(),
        bankName: bankName.trim(),
        depositDate,
        supportingProofUrl: supportingProofUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        taxExemption80G: !!donorPan.trim(),
      },
      user?.name || 'Finance Team'
    );

    setManualDonations([...db.getManualDonations()]);
    setShowAddModal(false);
    // Reset
    setDonorName('');
    setDonorEmail('');
    setDonorPhone('');
    setDonorPan('');
    setPaymentReference('');
    setBankName('');
    setNotes('');
    notify(`Offline bank transfer voucher of ${formatINR(created.amount)} recorded for reconciliation.`);
  };

  const handleReconcile = (wireId: string, status: 'approved' | 'rejected') => {
    const note = prompt(
      status === 'approved'
        ? 'Enter bank statement reconciliation note (optional):'
        : 'Enter rejection reason (e.g. UTR not found on bank statement):'
    );
    if (note !== null) {
      const res = db.reconcileManualDonation(wireId, status, user?.name || 'Finance Ops', note);
      if (res) {
        setManualDonations([...db.getManualDonations()]);
        notify(
          status === 'approved'
            ? `Voucher reconciled! ${formatINR(res.amount)} credited to campaign balance with verified 80G receipt.`
            : `Voucher rejected.`
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Financial Reconciliation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Bank Transactions & Offline Wire Reconciliation
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Match high-value NEFT/RTGS bank transfers, CSR grants, and cheques against escrow accounts.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Record Offline Transfer
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

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by UTR reference, donor, bank name, or campaign..."
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
          <option value="all">All Statuses</option>
          <option value="pending">Pending Statement Match</option>
          <option value="approved">Reconciled & Credited</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">UTR Reference / Bank</th>
                <th className="py-3 px-4">Donor & PAN</th>
                <th className="py-3 px-4">Target Campaign</th>
                <th className="py-3 px-4">Deposit Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Reconciliation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredWires.map((wire) => (
                <tr key={wire.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-neutral-900">{wire.paymentReference}</p>
                    <p className="text-[11px] text-neutral-500">{wire.bankName}</p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-[#202124]">{wire.donorName}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                      <span>{wire.donorEmail}</span>
                      {wire.donorPan && (
                        <span className="font-mono bg-neutral-100 text-neutral-700 px-1 rounded font-bold">
                          PAN: {wire.donorPan}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-neutral-800 line-clamp-1">{wire.campaignTitle}</p>
                    {wire.notes && <p className="text-[10px] text-neutral-400 line-clamp-1 italic">{wire.notes}</p>}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-neutral-600">{wire.depositDate}</td>

                  <td className="py-3 px-4 font-mono font-black text-sm text-[#202124]">
                    {formatINR(wire.amount)}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        wire.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : wire.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {wire.status === 'approved' ? 'Reconciled' : wire.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {wire.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleReconcile(wire.id, 'approved')}
                          className="bg-[#25845B] hover:bg-[#1E6B49] text-white text-[11px] px-2.5 py-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve & Credit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReconcile(wire.id, 'rejected')}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] px-2 py-1"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400">
                        {wire.reconciledBy ? `By ${wire.reconciledBy}` : 'Completed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- RECORD OFFLINE DONATION MODAL ----------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleRecordOfflineDonation}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Record Manual Offline Bank Wire</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Target Campaign *</label>
              <select
                required
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Donor / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Trusts CSR or Individual"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Donor Email *</label>
                <input
                  type="email"
                  required
                  placeholder="donor@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Amount (INR) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Donor PAN (For 80G)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={donorPan}
                  onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Bank UTR / Cheque Ref *</label>
                <input
                  type="text"
                  required
                  placeholder="NEFT-HDFC-N991823910"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Bank Name & Branch *</label>
                <input
                  type="text"
                  required
                  placeholder="HDFC Bank, Fort Mumbai"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Deposit Date *</label>
                <input
                  type="date"
                  required
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Proof Document URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={supportingProofUrl}
                  onChange={(e) => setSupportingProofUrl(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Reconciliation Notes</label>
              <textarea
                rows={2}
                placeholder="Details of direct corporate CSR transfer or cheque clearance confirmation"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Record Transfer Voucher
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
