'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Clock,
} from 'lucide-react';

export default function FundraiserPayoutsPage() {
  const [bankAccount, setBankAccount] = useState('98765432100987');
  const [ifsc, setIfsc] = useState('SBIN0001532');
  const [hospitalAccountName, setHospitalAccountName] = useState(
    'AIIMS Hospital Patient Relief Fund'
  );
  const [amount, setAmount] = useState<number>(250000);
  const [submitted, setSubmitted] = useState(false);

  const mockPayouts = [
    {
      id: 'PAYOUT-901',
      campaignTitle: 'Help 4-Year-Old Aarav Fight Acute Lymphoblastic Leukemia',
      beneficiaryHospital: 'All India Institute of Medical Sciences (AIIMS)',
      amount: 450000,
      status: 'settled',
      utr: 'CMS2026101900192',
      date: '2026-10-18',
    },
    {
      id: 'PAYOUT-902',
      campaignTitle: 'Help 4-Year-Old Aarav Fight Acute Lymphoblastic Leukemia',
      beneficiaryHospital: 'AIIMS Pharmacy & Blood Bank Cell',
      amount: 200000,
      status: 'processing',
      utr: 'Pending Bank Clearance',
      date: '2026-10-22',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/fundraiser/dashboard" className="hover:text-[#202124]">
            Fundraiser Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Hospital Disbursements & Payouts</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#202124]">Hospital Direct Disbursements</h1>
            <p className="text-xs text-[#555B63] mt-1">
              To prevent diversion, funds are wired directly to hospital accounts upon verified hospital billing.
            </p>
          </div>
          <Link href="/fundraiser/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {submitted && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#25845B] rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Disbursement request submitted. Finance audit will approve within 24 hours.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* New Payout Request Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
              Request Hospital Disbursement
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Beneficiary Hospital Account Name
                </label>
                <input
                  type="text"
                  required
                  value={hospitalAccountName}
                  onChange={(e) => setHospitalAccountName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Hospital Bank Account Number
                </label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  required
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-mono uppercase text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Requested Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs font-bold text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                Submit Disbursement Request
              </Button>
            </form>
          </div>

          {/* Past Settlements History */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
              Disbursement Settlement Audit Records
            </h3>

            <div className="divide-y divide-[#E8E6E1] text-xs">
              {mockPayouts.map((p) => (
                <div key={p.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#202124]">{formatINR(p.amount)}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        p.status === 'settled'
                          ? 'bg-emerald-50 text-[#25845B] border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[#555B63]">{p.beneficiaryHospital}</div>
                  <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
                    <span>UTR: {p.utr}</span>
                    <span>Date: {p.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
