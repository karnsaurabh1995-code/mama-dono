'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MISSIONS } from '../page';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Repeat, ShieldCheck, CheckCircle2, ChevronRight, Users, Heart } from 'lucide-react';

export default function MissionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const mission = MISSIONS.find((m) => m.slug === slug || m.id === slug) || MISSIONS[0];

  const [selectedPlan, setSelectedPlan] = useState<number>(mission.monthlyAmount);

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/monthly-giving" className="hover:text-[#202124]">
            Monthly Giving
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">{mission.title}</span>
        </nav>

        {/* Mission Card Banner */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] overflow-hidden shadow-sm">
          <div className="relative aspect-[16/8] bg-neutral-100">
            <img
              src={mission.imageUrl}
              alt={mission.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Repeat className="w-3.5 h-3.5" />
                <span>Monthly Recurring Mission</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#202124]">
                {mission.title}
              </h1>
              <p className="text-sm text-[#555B63] leading-relaxed">
                {mission.description}
              </p>
            </div>

            {/* Impact Metric Strip */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Your Monthly Impact: {mission.impactNote}</span>
              </span>
              <span className="font-semibold text-blue-700">
                {mission.supportersCount} Supporters
              </span>
            </div>

            {/* Select Monthly Pledge Amount */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#202124] uppercase tracking-wider block">
                Choose Your Monthly Contribution:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[mission.monthlyAmount, mission.monthlyAmount * 2, mission.monthlyAmount * 3].map(
                  (amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedPlan(amt)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedPlan === amt
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold ring-2 ring-blue-600/20'
                          : 'border-[#E8E6E1] bg-[#FAF9F6] text-[#202124] hover:bg-neutral-100'
                      }`}
                    >
                      <div className="text-base font-black">{formatINR(amt)}</div>
                      <div className="text-[11px] text-[#555B63]">per month</div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Checkout Action */}
            <div className="pt-2">
              <Link
                href={`/donate/camp-hunger-mumbai-hospital?amount=${selectedPlan}&recurring=true`}
                className="block w-full"
              >
                <Button variant="primary" size="lg" className="w-full justify-center font-bold text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                  <Heart className="w-5 h-5 fill-white mr-2" />
                  <span>Join Mission with {formatINR(selectedPlan)} / Month</span>
                </Button>
              </Link>
              <p className="text-center text-[11px] text-neutral-400 mt-2">
                🔒 Protected by RBI compliant e-mandate. Pause or cancel anytime in 1 click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
