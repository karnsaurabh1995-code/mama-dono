'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Heart,
  ArrowLeft,
  Download,
} from 'lucide-react';

export default function TaxReceiptViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const donation = db.getDonationById(id);

  if (!donation) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-xl font-bold text-[#202124]">Receipt Not Found</h1>
        <Link href="/account/donations">
          <Button variant="primary">Return to Donations</Button>
        </Link>
      </div>
    );
  }

  const campaign = db.getCampaignById(donation.campaignId);

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between no-print">
          <Link href="/account/donations">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Donations
            </Button>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#202124] text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        </div>

        {/* Official 80G Tax Receipt Document */}
        <div className="bg-white rounded-3xl border-2 border-[#E8E6E1] p-8 sm:p-12 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[#202124] pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E84B45] text-white flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <span className="text-xl font-black text-[#202124]">SevaSetu Foundation</span>
              </div>
              <p className="text-[11px] text-[#555B63] max-w-sm">
                Registered under Societies Registration Act XXI of 1860.
                Regd Office: 4th Floor, Barakhamba Road, Connaught Place, New Delhi - 110001
              </p>
            </div>

            <div className="text-right space-y-0.5 text-xs">
              <span className="font-bold text-[#25845B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                FORM 10BE COMPLIANT
              </span>
              <p className="font-mono text-[11px] text-neutral-500 pt-1">
                PAN: <strong>AAATA4492M</strong>
              </p>
              <p className="font-mono text-[11px] text-neutral-500">
                80G URN: <strong>AAATA4492MF20215</strong>
              </p>
              <p className="font-mono text-[11px] text-neutral-500">
                NGO Darpan: <strong>DL/2016/0104822</strong>
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-[#202124] uppercase tracking-wide">
              Donation Acknowledgment & Section 80G Certificate
            </h2>
            <p className="text-xs text-[#555B63]">
              Issued in accordance with Rule 18AB of the Indian Income Tax Rules, 1962
            </p>
          </div>

          {/* Core Receipt Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-[#E8E6E1] p-5 rounded-2xl bg-[#FAF9F6]">
            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                Receipt Number
              </span>
              <span className="font-mono font-bold text-sm text-[#202124]">
                {donation.receiptNumber}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                Date & Time
              </span>
              <span className="font-semibold text-[#202124]">
                {formatDate(donation.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                Donor Name
              </span>
              <span className="font-bold text-sm text-[#202124]">
                {donation.isAnonymous ? 'Confidential (Individual Donor)' : donation.donorName}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                Donor PAN (Income Tax)
              </span>
              <span className="font-mono font-bold text-sm text-[#202124]">
                {donation.donorPan || 'Not Specified'}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                Supported Cause / Purpose
              </span>
              <span className="font-semibold text-[#202124]">{donation.campaignTitle}</span>
            </div>

            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                Transaction Reference
              </span>
              <span className="font-mono text-neutral-600">
                {donation.razorpayPaymentId || donation.razorpayOrderId}
              </span>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="p-5 bg-white border-2 border-[#202124] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                Donation Amount Received
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#202124]">
                {formatINR(donation.amount)}
              </span>
            </div>
            <div className="text-right text-xs text-[#25845B] font-bold">
              ✓ Paid via {donation.paymentMethod.toUpperCase()} (Razorpay Verified)
            </div>
          </div>

          {/* Statutory Declaration */}
          <div className="text-[11px] text-[#555B63] leading-relaxed space-y-2 border-t border-neutral-200 pt-4">
            <p>
              1. This is to certify that the donation amount mentioned above has been received with thanks as a voluntary contribution towards charitable objectives of health and relief.
            </p>
            <p>
              2. Donations to SevaSetu Foundation are eligible for deduction under Section 80G(5)(vi) of the Income Tax Act, 1961. This transaction will be reported in annual Form 10BD for donor credit into AIS (Annual Information Statement).
            </p>
            <p>
              3. No goods, commercial favors, or services were provided in consideration for this charitable contribution.
            </p>
          </div>

          {/* Signatures */}
          <div className="flex items-end justify-between pt-6 border-t border-neutral-200 text-xs text-neutral-600">
            <div>
              <span className="font-bold text-[#202124]">SevaSetu Foundation</span>
              <p className="text-[11px] text-neutral-400">Authorized Signatory</p>
            </div>
            <div className="text-right text-[10px] text-neutral-400 font-mono">
              Computer Generated Digital Tax Certificate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
