import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function DonationPolicyPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Donation & Tax Policy</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-black text-[#202124]">Donation & Section 80G Tax Policy</h1>
          <p className="text-xs text-neutral-400">Effective Date: October 2026 • Income Tax Act 1961 Compliance</p>

          <div className="prose text-xs sm:text-sm text-[#404348] space-y-4 leading-relaxed whitespace-pre-line">
            <h3 className="text-base font-bold text-[#202124]">1. 0% Platform Fee Model</h3>
            SevaSetu charges 0% platform commission on emergency individual medical campaigns. Voluntary tips provided by donors help maintain tech infrastructure and medical auditing staff.

            <h3 className="text-base font-bold text-[#202124]">2. Section 80G Tax Deductions</h3>
            Donations made to campaigns affiliated with 80G-certified partner NGOs qualify for up to 50% tax deductions under Section 80G of the Indian Income Tax Act. Donors must provide a valid 10-digit PAN during checkout to enable Form 10BD reporting and generation of Form 10BE tax certificates.

            <h3 className="text-base font-bold text-[#202124]">3. Foreign Contributions (FCRA)</h3>
            In compliance with the Foreign Contribution (Regulation) Act (FCRA), 2010, donations from foreign passports or foreign bank cards are only accepted by verified non-profit partners possessing an active FCRA registration with the Ministry of Home Affairs.
          </div>
        </div>
      </div>
    </div>
  );
}
