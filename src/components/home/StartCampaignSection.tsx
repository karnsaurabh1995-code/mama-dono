import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart, ShieldCheck, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

interface StartCampaignSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function StartCampaignSection({
  title,
  subtitle,
  badge,
  ctaText,
  ctaLink,
}: StartCampaignSectionProps = {}) {
  return (
    <section className="py-20 bg-white border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Softly Curved Visual Artwork & Trust Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-neutral-200 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80"
                alt="Start a verified crowdfunding campaign on dokind"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating Bottom Card */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/50 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0EF] text-[#EF4949] flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 fill-[#EF4949]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#202124]">Zero Platform Fee for Patients</h4>
                    <p className="text-[11px] text-[#555B63]">100% of donor contributions reach hospital escrow.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Top Badge */}
            <div className="absolute -top-4 -left-3 sm:-left-4 bg-[#202124] text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hospital Verified Within 3 Hours</span>
            </div>
          </div>

          {/* Right Column: Editorial Copy & Factual Benefits */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#FEE2E2]">
                {badge || 'START A CAMPAIGN'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#202124] tracking-tight leading-[1.15]">
                {title ? (
                  title
                ) : (
                  <>
                    Start a Campaign. <br />
                    <span className="text-[#EF4949]">Help Someone Move Forward.</span>
                  </>
                )}
              </h2>
              <p className="text-sm sm:text-base text-[#555B63] mt-3 leading-relaxed max-w-xl">
                {subtitle || 'Whether you need urgent emergency funds for a critical hospital surgery, child nutrition, or grassroots education, dokind connects your cause with thousands of compassionate donors across India.'}
              </p>
            </div>

            {/* 4 Factual Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-1.5 hover:border-neutral-300 transition">
                <div className="flex items-center gap-2 text-[#EF4949]">
                  <Clock className="w-4 h-4" />
                  <h4 className="text-xs font-black text-[#202124]">Launch in Under 5 Minutes</h4>
                </div>
                <p className="text-xs text-[#555B63] leading-relaxed">
                  Simple guided wizard helps you outline medical needs, upload hospital bills, and calculate target goals.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-1.5 hover:border-neutral-300 transition">
                <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-black text-[#202124]">Medical Document Review</h4>
                </div>
                <p className="text-xs text-[#555B63] leading-relaxed">
                  Doctor letters and hospital estimates are verified directly by our compliance team to ensure donor confidence.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-1.5 hover:border-neutral-300 transition">
                <div className="flex items-center gap-2 text-blue-600">
                  <Users className="w-4 h-4" />
                  <h4 className="text-xs font-black text-[#202124]">Transparent Real-Time Updates</h4>
                </div>
                <p className="text-xs text-[#555B63] leading-relaxed">
                  Share milestone progress, doctor notes, and recovery photographs with verified donors.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-1.5 hover:border-neutral-300 transition">
                <div className="flex items-center gap-2 text-purple-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-xs font-black text-[#202124]">Direct Hospital Disbursements</h4>
                </div>
                <p className="text-xs text-[#555B63] leading-relaxed">
                  Funds are transferred straight to hospital accounts or registered suppliers with zero platform fee.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link href={ctaLink || '/start-campaign'}>
                <Button size="lg" className="bg-[#EF4949] hover:bg-[#D93838] text-white font-bold text-sm px-7 py-3.5 shadow-md rounded-xl flex items-center gap-2">
                  <span>{ctaText || 'Start a Fundraiser Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-neutral-300 text-neutral-800 hover:bg-neutral-50 font-bold text-sm px-6 py-3.5 rounded-xl">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
