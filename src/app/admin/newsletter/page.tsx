'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Send,
  Users,
  CheckCircle2,
  Download,
  Mail,
  Sparkles,
} from 'lucide-react';

export default function NewsletterMarketingPage() {
  const [subscribers, setSubscribers] = useState([
    { id: '1', email: 'aarav.sharma@gmail.com', date: '2026-10-22', status: 'Subscribed' },
    { id: '2', email: 'priya.patel@tcs.com', date: '2026-10-21', status: 'Subscribed' },
    { id: '3', email: 'rajesh.kumar@infosys.org', date: '2026-10-20', status: 'Subscribed' },
    { id: '4', email: 'meera.iyer@wipro.com', date: '2026-10-18', status: 'Subscribed' },
    { id: '5', email: 'karan.singh@delhiuniversity.ac.in', date: '2026-10-15', status: 'Subscribed' },
  ]);

  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleExportSubscribers = () => {
    const headers = ['Email', 'Subscribed Date', 'Status'];
    const rows = subscribers.map((s) => [s.email, s.date, s.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `sevasetu_newsletter_subscribers_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify(`Exported ${subscribers.length} newsletter subscribers.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Send className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Donor Retention</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Newsletter Subscribers & Marketing Campaigns
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage subscriber email lists, broadcast monthly impact digests, and monitor opt-in compliance.
          </p>
        </div>

        <Button size="sm" onClick={handleExportSubscribers} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
          <Download className="w-3.5 h-3.5 mr-1" />
          Export Subscribers CSV
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202124]">Subscribed Donors & Changemakers</h3>
          <span className="text-xs text-neutral-400">{subscribers.length} active opt-ins</span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Subscriber Email</th>
              <th className="py-3 px-4">Opt-In Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="py-3 px-4 font-semibold text-neutral-900">{s.email}</td>
                <td className="py-3 px-4 text-neutral-500">{s.date}</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
