'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { RecurringPlan } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  XCircle,
  ExternalLink,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function AdminRecurringPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<RecurringPlan[]>(db.getRecurringPlans());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredPlans = plans.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesName = p.userName.toLowerCase().includes(q);
      const matchesEmail = p.userEmail.toLowerCase().includes(q);
      const matchesCamp = p.campaignTitle.toLowerCase().includes(q);
      if (!matchesName && !matchesEmail && !matchesCamp) return false;
    }
    return true;
  });

  const handleCancelPlan = (planId: string, email: string) => {
    if (confirm('Cancel this donor subscription? Future auto-debits will halt.')) {
      db.cancelRecurringPlan(planId, email);
      setPlans([...db.getRecurringPlans()]);
      notify('Subscription cancelled.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-700">
              <RotateCcw className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Sustained Giving</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Monthly Giving & Recurring Subscriptions
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Monitor automated monthly pledges, UPI autopay debits, and donor subscription lifecycles.
          </p>
        </div>
      </div>

      {/* Toast notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by donor name, email, or campaign title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-800"
        >
          <option value="all">All Subscription States</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Donor</th>
                <th className="py-3 px-4">Mission / Campaign</th>
                <th className="py-3 px-4">Monthly Pledge</th>
                <th className="py-3 px-4">Billing Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPlans.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#202124]">{p.userName}</p>
                    <p className="text-[10px] text-neutral-400">{p.userEmail}</p>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-neutral-800 line-clamp-1">{p.campaignTitle}</p>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Sub ID: {p.razorpaySubscriptionId}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-black text-sm text-[#202124]">
                    {formatINR(p.amount)} <span className="text-[10px] font-normal text-neutral-400">/ mo</span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-semibold text-neutral-800">Next: {p.nextBillingDate}</p>
                    <p className="text-[10px] text-neutral-400">{p.totalCyclesCharged} cycles completed</p>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {p.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelPlan(p.id, p.userEmail)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] px-2 py-1"
                      >
                        Cancel Plan
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
