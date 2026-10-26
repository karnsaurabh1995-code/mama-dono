import React from 'react';
import Link from 'next/link';
import { MissionCard } from '@/components/home/MissionCard';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface Mission {
  id: string;
  slug: string;
  title: string;
  cause: string;
  tagline: string;
  monthlyAmount: number;
  supportersCount: number;
  impactNote: string;
  imageUrl: string;
}

interface MonthlyDonationSectionProps {
  missions: Mission[];
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function MonthlyDonationSection({
  missions,
  title,
  subtitle,
  badge,
  ctaText,
  ctaLink,
}: MonthlyDonationSectionProps) {
  return (
    <section className="py-20 bg-white border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full inline-block border border-blue-200">
            {badge || 'RECURRING GIVING'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            {title || 'Become a Monthly Changemaker'}
          </h2>
          <p className="text-xs sm:text-sm text-[#555B63] leading-relaxed">
            {subtitle || 'Recurring contributions provide grassroots social missions with predictable stability. Modify or cancel your monthly pledge anytime directly from your donor dashboard.'}
          </p>
        </div>

        {/* 3 Monthly Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>

        {/* Trust Banner & CTA */}
        <div className="mt-12 p-6 sm:p-7 bg-[#FAF9F6] rounded-3xl border border-[#E8E6E1] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202124]">
                Zero Lock-In Risk & Full Financial Control
              </h4>
              <p className="text-xs text-[#555B63] mt-0.5">
                Automated monthly debits via UPI Autopay & Cards. One-click pause or cancellation anytime with zero penalty.
              </p>
            </div>
          </div>

          <Link href={ctaLink || '/monthly-giving'} className="shrink-0">
            <Button
              variant="outline"
              size="md"
              className="border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <span>{ctaText || 'Explore All Monthly Missions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
