'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  FileText,
  AlertCircle,
  Upload,
} from 'lucide-react';

export default function VerifyOrganizationPage() {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [darpanId, setDarpanId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [reg12A, setReg12A] = useState('');
  const [reg80G, setReg80G] = useState('');
  const [fcraRegistered, setFcraRegistered] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [foundedYear, setFoundedYear] = useState(2018);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    db.createOrganization({
      name,
      slug,
      tagline,
      description,
      logoUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=200&h=200&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
      website: 'https://example.org',
      darpanId,
      panNumber: panNumber.toUpperCase(),
      reg12A,
      reg80G,
      fcraRegistered,
      verificationStatus: 'pending',
      city,
      state,
      foundedYear: Number(foundedYear),
      causes: ['medical', 'education'],
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-20 bg-[#FAF9F6] min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center space-y-5 bg-white p-8 rounded-3xl border border-[#E8E6E1] shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#25845B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-[#202124]">Application Submitted!</h1>
          <p className="text-xs text-[#555B63] leading-relaxed">
            Your organization <strong>{name}</strong> has been registered in the compliance review queue. Our non-profit onboarding team will cross-verify your 12A, 80G, and Darpan ID credentials with the official NITI Aayog portal within 48 hours.
          </p>
          <div className="pt-2">
            <Link href="/organizations">
              <Button variant="primary" size="md">
                View NGO Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/organizations" className="hover:text-[#202124]">
            Organizations
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Verify Non-Profit</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <span className="bg-[#EBF7F1] text-[#25845B] border border-[#C2E8D4] text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NITI Aayog Darpan & 80G Accreditation</span>
          </span>
          <h1 className="text-3xl font-black text-[#202124] tracking-tight">
            Apply for Organization Verification
          </h1>
          <p className="text-xs text-[#555B63] leading-relaxed">
            Registered Non-Profit Organizations (Trusts, Societies, Section 8 companies) can apply for verified partner status to publish fundraisers, receive 80G donations, and join recurring mission pools.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
              1. Legal Entity Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Organization Legal Registered Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hope Child Relief Trust"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Tagline / Mission Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Free emergency cardiac surgeries for children"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Year of Establishment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Headquarters City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Detailed Non-Profit Work & Impact Summary
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your organization's track record, beneficiaries reached, and ongoing projects..."
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>
          </div>

          {/* Section 2: Statutory Compliance */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
              2. Statutory & Tax Registration Numbers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  NITI Aayog NGO Darpan ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={darpanId}
                  onChange={(e) => setDarpanId(e.target.value)}
                  placeholder="e.g. MH/2018/0192841"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Entity PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AAATA1234K"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Section 12A URN
                </label>
                <input
                  type="text"
                  value={reg12A}
                  onChange={(e) => setReg12A(e.target.value)}
                  placeholder="e.g. AAATA1234KE20214"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Section 80G Tax Exemption URN
                </label>
                <input
                  type="text"
                  value={reg80G}
                  onChange={(e) => setReg80G(e.target.value)}
                  placeholder="e.g. AAATA1234KF20215"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={fcraRegistered}
                  onChange={(e) => setFcraRegistered(e.target.checked)}
                  className="w-4 h-4 text-[#E84B45] rounded"
                />
                <span className="font-semibold text-[#202124]">
                  This organization holds an active FCRA registration permitted to accept foreign contributions
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <Link href="/organizations">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" className="font-bold">
              Submit Application for Verification
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
