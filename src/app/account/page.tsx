'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Heart,
  Calendar,
  FileText,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Download,
} from 'lucide-react';

export default function DonorDashboardPage() {
  const { user } = useAuth();
  const donations = db.getDonations({ status: 'succeeded' }).slice(0, 4);
  const recurringPlans = db.getRecurringPlans(user?.email);

  const totalDonated = donations.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Donor Account</span>
        </nav>

        {/* User Greeting Header */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 m-3 text-neutral-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#202124]">{user?.name}</h1>
              <p className="text-xs text-[#555B63]">{user?.email}</p>
              <div className="flex items-center gap-2 text-[11px] text-[#25845B] font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Donor Account</span>
                {user?.panNumber && <span>• PAN: {user.panNumber}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/account/profile">
              <Button variant="outline" size="sm">
                Edit Profile & PAN
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="primary" size="sm">
                Explore Causes
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#555B63] font-semibold">Total Given to Causes</span>
            <div className="text-2xl font-black text-[#E84B45] mt-1">{formatINR(totalDonated)}</div>
            <span className="text-[11px] text-[#25845B] font-medium block mt-1">
              Eligible for 50% 80G Tax Exemption
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#555B63] font-semibold">Active Monthly Mandates</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{recurringPlans.length}</div>
            <span className="text-[11px] text-[#555B63] block mt-1">
              Auto-renewed on 23rd of every month
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
            <span className="text-xs text-[#555B63] font-semibold">Lives Directly Impacted</span>
            <div className="text-2xl font-black text-[#25845B] mt-1">
              {donations.length * 3}+
            </div>
            <span className="text-[11px] text-[#555B63] block mt-1">
              Across medical, meals & education
            </span>
          </div>
        </div>

        {/* Recent Donations Table */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#E84B45]" />
              <span>Recent Donation History & Tax Receipts</span>
            </h2>
            <Link href="/account/donations" className="text-xs text-[#E84B45] font-semibold hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#E8E6E1] border border-[#E8E6E1] rounded-2xl overflow-hidden text-xs">
            {donations.map((d) => (
              <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F6] transition-colors">
                <div className="space-y-1">
                  <div className="font-bold text-[#202124]">{d.campaignTitle}</div>
                  <div className="text-[#555B63] text-[11px]">
                    Receipt: <span className="font-mono font-semibold">{d.receiptNumber}</span> • {formatDate(d.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-bold text-[#202124] text-sm">
                    {formatINR(d.amount)}
                  </span>
                  <Link href={`/account/donations/${d.id}`}>
                    <Button variant="outline" size="sm" className="text-xs" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                      80G Receipt
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Support Banner */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-950">Manage Your Monthly Giving</h3>
              <p className="text-xs text-blue-800">
                You have {recurringPlans.length} active recurring contribution. You can pause, modify amount, or cancel anytime.
              </p>
            </div>
          </div>
          <Link href="/account/recurring">
            <Button variant="secondary" size="sm" className="shrink-0 bg-blue-900 text-white">
              Manage Mandates
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
