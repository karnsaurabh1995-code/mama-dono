import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Heart,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">How It Works</span>
        </nav>

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="bg-[#FFF0EF] text-[#E84B45] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Transparent Giving Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#202124] tracking-tight">
            How SevaSetu Bridges Donors & Genuine Causes
          </h1>
          <p className="text-sm text-[#555B63] leading-relaxed">
            A step-by-step breakdown of how medical verification, secure payments, and direct hospital disbursements happen in practice.
          </p>
        </div>

        {/* Dual Journeys Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donor Journey */}
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0EF] text-[#E84B45] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6 fill-[#E84B45]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#202124]">The Donor Journey</h2>
                <p className="text-xs text-[#555B63]">From discovery to tax certificate</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Discover a Cause',
                  desc: 'Search by disease, surgery, student, or local NGO. Review verified hospital estimates and patient backgrounds.',
                },
                {
                  step: '02',
                  title: 'Choose One-Time or Monthly',
                  desc: 'Pick your contribution amount (₹101 to custom). Settle via UPI (GPay/PhonePe), NetBanking, or Cards.',
                },
                {
                  step: '03',
                  title: 'Instant 80G Tax Receipt',
                  desc: 'Receive immediate tax deduction receipt (Form 10BE compliant) and email confirmation.',
                },
                {
                  step: '04',
                  title: 'Follow Direct Clinical Updates',
                  desc: 'Receive photos and discharge updates when the patient undergoes surgery and recovers.',
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E8E6E1] text-[#E84B45] font-black text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#202124]">{item.title}</h3>
                    <p className="text-xs text-[#555B63] mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/campaigns" className="block pt-2">
              <Button variant="primary" size="md" className="w-full justify-center font-bold">
                Browse Verified Campaigns
              </Button>
            </Link>
          </div>

          {/* Fundraiser Journey */}
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#25845B] flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#202124]">The Fundraiser Journey</h2>
                <p className="text-xs text-[#555B63]">From application to hospital disbursement</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Fill Application in 5 Minutes',
                  desc: 'Select medical, educational, or NGO cause. State your target amount, patient age, and treating hospital.',
                },
                {
                  step: '02',
                  title: 'Submit Clinical Proofs',
                  desc: 'Upload hospital doctor estimate letters, diagnostic reports, and patient/guardian government IDs.',
                },
                {
                  step: '03',
                  title: 'Independent Hospital Audit',
                  desc: 'Our medical social work team contacts the hospital finance cell to verify UHID and bills within 24 hours.',
                },
                {
                  step: '04',
                  title: 'Direct Hospital Disbursement',
                  desc: 'Funds raised are transferred directly to the hospital’s patient welfare accounts, eliminating fraud.',
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E8E6E1] text-[#25845B] font-black text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#202124]">{item.title}</h3>
                    <p className="text-xs text-[#555B63] mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/start-campaign" className="block pt-2">
              <Button variant="outline" size="md" className="w-full justify-center font-bold">
                Start a Fundraiser (0% Fee)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
