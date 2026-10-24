import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Terms of Use</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-black text-[#202124]">Terms of Use & Operating Guidelines</h1>
          <p className="text-xs text-neutral-400">Effective Date: October 2026 • Governed under Indian Law</p>

          <div className="prose text-xs sm:text-sm text-[#404348] space-y-4 leading-relaxed whitespace-pre-line">
            <h3 className="text-base font-bold text-[#202124]">1. Acceptance of Terms</h3>
            By accessing or using dokind, you agree to comply with and be bound by these Terms of Use, our Privacy Policy, and our Verification Standards.

            <h3 className="text-base font-bold text-[#202124]">2. Fundraiser Accuracy & Zero Fraud Policy</h3>
            Campaigners agree that all medical estimates, diagnostic reports, and personal circumstances represented on dokind are genuine and truthful. Falsification of hospital documentation constitutes criminal fraud under Section 420 of the Indian Penal Code and will result in immediate campaign suspension, forfeiture of funds, and reporting to law enforcement authorities.

            <h3 className="text-base font-bold text-[#202124]">3. Direct Hospital Disbursement</h3>
            To ensure complete trust and prevent diversion, donations collected for major individual medical treatments are wired directly to the designated hospital or licensed medical supplier accounts rather than individual personal accounts wherever feasible.
          </div>
        </div>
      </div>
    </div>
  );
}
