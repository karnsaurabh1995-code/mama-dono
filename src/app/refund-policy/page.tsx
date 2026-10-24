import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Refund & Cancellation Policy</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-black text-[#202124]">Refund & Cancellation Policy</h1>
          <p className="text-xs text-neutral-400">Effective Date: October 2026</p>

          <div className="prose text-xs sm:text-sm text-[#404348] space-y-4 leading-relaxed whitespace-pre-line">
            <h3 className="text-base font-bold text-[#202124]">1. Unintentional or Erroneous Transactions</h3>
            If a donor makes an unintended duplicate payment or enters an erroneous donation amount, they may request a refund within 7 days of the transaction date by emailing support@dokind.org.in with the transaction reference ID, provided the funds have not already been disbursed to the treating hospital.

            <h3 className="text-base font-bold text-[#202124]">2. Suspended or Rejected Campaigns</h3>
            If a campaign is suspended or found non-compliant during our post-audit verification, all undistributed funds are automatically refunded back to donors' original payment methods.

            <h3 className="text-base font-bold text-[#202124]">3. Monthly Giving Cancellation</h3>
            Donors may pause, alter the donation sum, or cancel their monthly recurring mandate at any time with immediate effect directly from their donor account. No cancellation fees or penalties apply.
          </div>
        </div>
      </div>
    </div>
  );
}
