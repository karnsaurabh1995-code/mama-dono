import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Privacy Policy</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-black text-[#202124]">Privacy & Data Protection Policy</h1>
          <p className="text-xs text-neutral-400">Effective Date: October 2026 • Compliant with Digital Personal Data Protection (DPDP) Act 2023</p>

          <div className="prose text-xs sm:text-sm text-[#404348] space-y-4 leading-relaxed whitespace-pre-line">
            <h3 className="text-base font-bold text-[#202124]">1. Information We Collect</h3>
            We collect personal information necessary to process donations, generate legal Section 80G tax receipts (such as Name, Email, Mobile number, and 10-digit Permanent Account Number), and verify clinical treatment estimates with treating hospitals.

            <h3 className="text-base font-bold text-[#202124]">2. Donor Anonymity Settings</h3>
            If you check "Make my donation anonymous" during checkout, your name and identity details will be completely hidden from public campaign supporters lists, ticker feeds, and search engines. However, in compliance with Central Board of Direct Taxes (CBDT) regulations, your PAN and transaction references are confidentially maintained in non-profit statutory audit records for Form 10BD/10BE filing.

            <h3 className="text-base font-bold text-[#202124]">3. Security & Payment Data</h3>
            SevaSetu does not store raw credit/debit card numbers or bank account passwords on our servers. All financial transactions are securely tokenized and processed via RBI-licensed payment gateways (Razorpay) utilizing 256-bit bank-grade SSL encryption.

            <h3 className="text-base font-bold text-[#202124]">4. Data Retention & Deletion</h3>
            You may request deletion or correction of non-statutory personal data at any time by writing to privacy@sevasetu.org.in. Statutory financial records are preserved for the minimum period mandated under Indian tax law.
          </div>
        </div>
      </div>
    </div>
  );
}
