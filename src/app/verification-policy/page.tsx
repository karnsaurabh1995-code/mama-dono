import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function VerificationPolicyPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Verification Policy</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-black text-[#202124]">Verification & Trust Architecture</h1>
          <p className="text-xs text-neutral-400">Effective Date: October 2026</p>

          <div className="prose text-xs sm:text-sm text-[#404348] space-y-4 leading-relaxed whitespace-pre-line">
            <h3 className="text-base font-bold text-[#202124]">1. Medical Fundraiser Verification</h3>
            Our in-house medical social work team contacts the patient care cell of treating hospitals (such as AIIMS, Christian Medical College, Tata Memorial, etc.) to confirm:
            - Patient admission record and Unique Hospital Identification (UHID) number.
            - Authorized consultant doctor signature and hospital clinical estimate letter.
            - Patient or legal guardian government identification (Aadhaar or Voter ID).

            <h3 className="text-base font-bold text-[#202124]">2. Non-Profit (NGO) Accreditation</h3>
            Non-profits must provide verified certificates of Section 12A registration, Section 80G tax approval, active NITI Aayog NGO-Darpan ID, audited balance sheets for the preceding 2 fiscal years, and valid bank accounts.
          </div>
        </div>
      </div>
    </div>
  );
}
