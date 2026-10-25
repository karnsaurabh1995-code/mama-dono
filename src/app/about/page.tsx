import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Heart, Award, Users, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  const publicTeam = db.getPublicEmployees();

  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">About dokind</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4 max-w-3xl">
          <span className="bg-[#FFF0EF] text-[#EF4949] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Our Mission & Governance
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#202124] tracking-tight">
            Building India’s Most Transparent Bridge for Generous Giving
          </h1>
          <p className="text-sm sm:text-base text-[#62666D] leading-relaxed">
            dokind was founded with a singular conviction: when an Indian family faces an unbearable medical catastrophe or social hardship, they should never have to suffer alone in silence. Every kind act counts.
          </p>
        </div>

        {/* Operating Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E84B45] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">Rigorous Verification</h3>
            <p className="text-xs text-[#555B63] leading-relaxed">
              We verify hospital diagnostic records, doctor prescriptions, and NGO registrations directly with treating physicians and government portals before public activation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#25845B] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">Direct Hospital Payouts</h3>
            <p className="text-xs text-[#555B63] leading-relaxed">
              For major surgery fundraisers, disbursements are routed straight to accredited hospital accounts or licensed medical suppliers to eliminate misuse of funds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">0% Platform Fee Model</h3>
            <p className="text-xs text-[#555B63] leading-relaxed">
              We charge 0% platform commission on emergency individual medical campaigns, relying solely on voluntary tips from supporters to maintain technology operations.
            </p>
          </div>
        </div>

        {/* Leadership & Field Governance Team */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="bg-emerald-50 text-[#25845B] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Verified dokind Stewards
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
              Leadership & Field Governance Team
            </h2>
            <p className="text-xs sm:text-sm text-[#62666D] max-w-2xl">
              Our multidisciplinary team of medical reviewers, chartered accountants, field coordinators, and community advocates ensure every rupee donated reaches verified beneficiaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicTeam.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF0EF] text-[#E84B45] font-black text-base flex items-center justify-center shrink-0 border border-red-100">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#202124] truncate">{member.name}</h3>
                    <p className="text-xs font-medium text-[#E84B45]">{member.jobTitle}</p>
                    <span className="inline-block mt-1 text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {member.department}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-[11px] text-[#555B63]">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#25845B]" />
                    Verified Officer
                  </span>
                  <span className="capitalize font-mono text-[10px] text-neutral-400">
                    {member.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ethics and Governance Section */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 space-y-4">
          <h2 className="text-xl font-bold text-[#202124]">Our Ethical Commitments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#555B63]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#25845B] shrink-0 mt-0.5" />
              <span>No fabricated countdowns, artificial urgency, or deceptive statistics.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#25845B] shrink-0 mt-0.5" />
              <span>Full compliance with Income Tax Section 80G and Form 10BE generation rules.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#25845B] shrink-0 mt-0.5" />
              <span>Strict FCRA compliance ensuring foreign funds are accepted only by authorized entities.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#25845B] shrink-0 mt-0.5" />
              <span>Confidential donor privacy with respect for complete anonymity preferences.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
