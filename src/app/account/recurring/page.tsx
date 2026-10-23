'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Repeat,
  ArrowLeft,
  XCircle,
} from 'lucide-react';

export default function RecurringMandatesPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(db.getRecurringPlans(user?.email));
  const [cancelledMessage, setCancelledMessage] = useState('');

  const handleCancelPlan = (planId: string) => {
    if (confirm('Are you sure you wish to cancel this monthly recurring donation? You can restart anytime.')) {
      const res = db.cancelRecurringPlan(planId, user?.email || 'user');
      if (res) {
        setPlans(db.getRecurringPlans(user?.email));
        setCancelledMessage('Recurring mandate successfully cancelled.');
        setTimeout(() => setCancelledMessage(''), 4000);
      }
    }
  };

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/account" className="hover:text-[#202124]">
            Donor Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Monthly Giving Mandates</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#202124]">My Monthly Giving Mandates</h1>
            <p className="text-xs text-[#555B63] mt-1">
              Active recurring contributions supporting monthly grassroots missions.
            </p>
          </div>
          <Link href="/account">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {cancelledMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#25845B] rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{cancelledMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      p.status === 'active'
                        ? 'bg-emerald-50 text-[#25845B] border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="text-xs font-semibold text-[#555B63]">
                    Cycles Charged: {p.totalCyclesCharged}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#202124]">{p.campaignTitle}</h3>
                <p className="text-xs text-[#555B63]">
                  Next Expected Debit: <strong>{p.nextBillingDate}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-lg font-black text-[#202124]">{formatINR(p.amount)}</div>
                  <div className="text-[11px] text-[#555B63]">monthly</div>
                </div>

                {p.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:border-red-200 text-xs"
                    onClick={() => handleCancelPlan(p.id)}
                  >
                    Cancel Mandate
                  </Button>
                )}
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="bg-white rounded-3xl border border-[#E8E6E1] p-10 text-center text-xs text-[#555B63] space-y-3">
              <p>You have no active monthly giving plans.</p>
              <Link href="/monthly-giving">
                <Button variant="primary" size="sm">
                  Explore Monthly Missions
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
