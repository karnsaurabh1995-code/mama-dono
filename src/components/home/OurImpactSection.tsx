import React from 'react';
import Link from 'next/link';
import { formatINRCompact } from '@/lib/utils';
import { ShieldCheck, Heart, ArrowRight } from 'lucide-react';

interface OurImpactSectionProps {
  stats: {
    totalRaised: number;
    totalDonorsCount: number;
    verifiedNGOs: number;
    documentedBeneficiaries: number;
  };
}

export function OurImpactSection({ stats }: OurImpactSectionProps) {
  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Dark Restrained Statistics Panel */}
          <div className="lg:col-span-7 bg-[#202124] text-white rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#EF4949] bg-[#EF4949]/15 px-3 py-1 rounded-full border border-[#EF4949]/30 inline-block mb-3">
                  TRANSPARENT METRICS
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Our Impact in Verified Numbers
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg leading-relaxed">
                  Real lives touched through transparent giving. Every metric is backed by verified bank disbursements, doctor notes, and audited NGO receipts.
                </p>
              </div>

              {/* 4 Core Metrics Grid */}
              <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-4 border-t border-neutral-800">
                <div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#EF4949] tracking-tight font-mono">
                    {formatINRCompact(stats.totalRaised)}
                  </div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1">
                    Direct Aid Mobilized
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Disbursed to hospital escrows</p>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-mono">
                    {stats.totalDonorsCount}+
                  </div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1">
                    Verified Donors
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Across 42+ Indian cities</p>
                </div>

                <div className="pt-2">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-mono">
                    {stats.verifiedNGOs}
                  </div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1">
                    Audited Partner NGOs
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">With active Darpan IDs</p>
                </div>

                <div className="pt-2">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-tight font-mono">
                    {stats.documentedBeneficiaries.toLocaleString('en-IN')}+
                  </div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1">
                    Beneficiaries Reached
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Surgeries, food & books</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-6 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Tax Deductible (Section 80G Form 10BE compliant)</span>
              </div>
              <Link href="/about" className="text-xs font-bold text-[#EF4949] hover:underline flex items-center gap-1">
                <span>Read Governance Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#EF4949]/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Right Column: Respectful Beneficiary Photograph */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200 bg-neutral-100 min-h-[400px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80"
              alt="Real life impact of dokind donors across India"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
                <Heart className="w-3 h-3 fill-white" />
                Real Story from the Ground
              </span>
              <p className="text-sm sm:text-base font-medium text-neutral-100 leading-snug">
                &ldquo;Your contribution doesn&apos;t just cover a hospital bill; it restores hope, dignifies a family, and keeps a child in school.&rdquo;
              </p>
              <div className="text-xs text-neutral-300 font-semibold pt-1">
                — AIIMS Pediatric Care Team, New Delhi
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
