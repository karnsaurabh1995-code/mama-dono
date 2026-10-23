import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CampaignGuidelinesPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Campaign Guidelines</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-black text-[#202124]">Campaign Standards & Content Guidelines</h1>
          <p className="text-xs text-neutral-400">Effective Date: October 2026</p>

          <div className="prose text-xs sm:text-sm text-[#404348] space-y-4 leading-relaxed whitespace-pre-line">
            <h3 className="text-base font-bold text-[#202124]">1. Permissible Causes</h3>
            SevaSetu hosts campaigns for critical medical emergencies, pediatric surgeries, organ transplants, cancer care, education scholarships, food security, disability mobility aids, disaster relief, animal welfare, and community development.

            <h3 className="text-base font-bold text-[#202124]">2. Prohibited Content & Causes</h3>
            We strictly prohibit campaigns involving political campaigns, religious conversion drives, speculative financial schemes, weapons, hate speech, or defamatory allegations.

            <h3 className="text-base font-bold text-[#202124]">3. Regular Progress Updates</h3>
            Campaign organizers must post timely milestone updates, clinical progress photos, and fund utilization evidence at least once every 14 days while the campaign is actively fundraising.
          </div>
        </div>
      </div>
    </div>
  );
}
