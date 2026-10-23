'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { isValidPAN } from '@/lib/utils';
import { ChevronRight, ShieldCheck, CheckCircle2, ArrowLeft, User } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [panNumber, setPanNumber] = useState(user?.panNumber || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (panNumber && !isValidPAN(panNumber)) {
      setError('Invalid Indian PAN format (must be 5 letters, 4 digits, 1 letter, e.g. ABCDE1234F)');
      return;
    }
    setError('');
    updateProfile({
      name,
      phone,
      panNumber: panNumber.toUpperCase(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/account" className="hover:text-[#202124]">
            Donor Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Profile & 80G PAN</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#202124]">Profile & Tax Details</h1>
          <Link href="/account">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
        </div>

        {saved && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#25845B] rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile and PAN records updated successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-neutral-100 border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Permanent Account Number (PAN for Section 80G Tax Certificates)
              </label>
              <input
                type="text"
                maxLength={10}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Required under CBDT guidelines for Form 10BD/10BE annual reporting.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
