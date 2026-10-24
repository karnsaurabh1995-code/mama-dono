import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export function PreviewMonthlySection() {
  const missions = [
    {
      id: 'm1',
      title: 'Mission 1000: Daily Hospital Meals',
      tagline: 'Provide hot hygienic food to patient attendants outside major municipal cancer hospitals.',
      monthlyAmount: 501,
      supportersCount: 420,
      impactNote: 'Feeds 15 impoverished caregivers every month',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'm2',
      title: 'Mission Shiksha: Educate a Girl Child',
      tagline: 'Sponsor school uniforms, bridge tutoring, and STEM digital tablets in rural eastern UP.',
      monthlyAmount: 1001,
      supportersCount: 310,
      impactNote: 'Covers full schooling and textbooks for 1 girl student',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'm3',
      title: 'Mission Karuna: Stray Animal Hospital Care',
      tagline: 'Fund round-the-clock emergency veterinary surgeries and rehabilitation for injured stray animals.',
      monthlyAmount: 751,
      supportersCount: 260,
      impactNote: 'Sponsors medical treatments and food for 2 rescued dogs',
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section
      data-component="PreviewMonthlySection"
      className="py-20 bg-white border-b border-[#E8E6E1]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full inline-block border border-blue-200">
            RECURRING GIVING
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            Become a Monthly Changemaker
          </h2>
          <p className="text-xs sm:text-sm text-[#555B63] leading-relaxed">
            Recurring contributions provide grassroots social missions with predictable stability. Modify or cancel your monthly pledge anytime directly from your donor dashboard.
          </p>
        </div>

        {/* 3 Monthly Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {missions.map((m) => (
            <div
              key={m.id}
              className="bg-[#FAF9F6] rounded-3xl border border-[#E8E6E1] overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      Monthly Mission
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <h3 className="text-base font-bold text-[#202124] leading-snug">{m.title}</h3>
                  <p className="text-xs text-[#555B63] leading-relaxed line-clamp-2">{m.tagline}</p>
                  <div className="p-3 bg-white rounded-2xl border border-[#E8E6E1] text-[11px] text-blue-800 font-semibold flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-blue-600 fill-blue-600 shrink-0" />
                    <span>{m.impactNote}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-[#E8E6E1] mt-2">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Pledge</span>
                  <span className="text-sm font-black text-[#202124] font-mono">
                    {formatINR(m.monthlyAmount)} <span className="text-[10px] font-normal text-neutral-500">/ month</span>
                  </span>
                </div>
                <Link href="/design-preview/campaign">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Join Mission
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Assurance Box */}
        <div className="p-6 sm:p-7 bg-[#FAF9F6] rounded-3xl border border-[#E8E6E1] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202124]">
                Zero Lock-In Risk & 100% Tax Deductible (80G)
              </h4>
              <p className="text-xs text-[#555B63] mt-0.5">
                Automated monthly debits via UPI Autopay & Cards. One-click pause or cancellation anytime with zero penalty.
              </p>
            </div>
          </div>
          <Link href="/monthly-giving">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Explore All Monthly Missions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
