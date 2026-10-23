'use client';

import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ChevronRight, FileText, Heart, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AccountDonationsListPage() {
  const donations = db.getDonations({ status: 'succeeded' });

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/account" className="hover:text-[#202124]">
            Donor Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">My Donations & Receipts</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#202124]">My Donations & 80G Receipts</h1>
            <p className="text-xs text-[#555B63] mt-1">
              Download tax certificates for Income Tax return filings.
            </p>
          </div>
          <Link href="/account">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] overflow-hidden shadow-xs">
          <div className="divide-y divide-[#E8E6E1] text-xs">
            {donations.map((d) => (
              <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-[#202124]">{d.campaignTitle}</div>
                  <div className="text-[#555B63] text-xs">
                    Date: {formatDate(d.createdAt)} • Mode: {d.paymentMethod.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Receipt: <span className="font-bold text-[#202124]">{d.receiptNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-[#202124] text-base">{formatINR(d.amount)}</div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                      80G Tax Deductible
                    </span>
                  </div>

                  <Link href={`/account/donations/${d.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                      View 80G Receipt
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
