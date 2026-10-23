'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LifeBuoy, CheckCircle2, Clock, MessageSquare, Search, Filter } from 'lucide-react';

interface SupportTicket {
  id: string;
  donorName: string;
  donorEmail: string;
  subject: string;
  category: '80G Tax Receipt' | 'Payment Issue' | 'Campaign Verification' | 'General';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function SupportDeskPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-1092',
      donorName: 'Sanjay Aggarwal',
      donorEmail: 'sanjay.aggarwal@gmail.com',
      subject: 'Did not receive Form 10BE compliant receipt for ₹10,000 donation',
      category: '80G Tax Receipt',
      status: 'open',
      priority: 'high',
      createdAt: '2026-10-23T10:15:00Z',
    },
    {
      id: 'TCK-1091',
      donorName: 'Dr. Meenakshi Sundaram',
      donorEmail: 'dr.meenakshi@fortis.com',
      subject: 'How to empanel Fortis Hospital pediatric surgery department for cashless escrows?',
      category: 'Campaign Verification',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2026-10-22T14:30:00Z',
    },
    {
      id: 'TCK-1090',
      donorName: 'Anand Kumar',
      donorEmail: 'anand.k99@yahoo.com',
      subject: 'Amount debited via UPI but order shows pending',
      category: 'Payment Issue',
      status: 'resolved',
      priority: 'high',
      createdAt: '2026-10-21T09:00:00Z',
    },
  ]);

  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleUpdateStatus = (id: string, status: SupportTicket['status']) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    notify(`Ticket ${id} marked as "${status}".`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-700">
              <LifeBuoy className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Helpdesk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Donor & Beneficiary Support Desk
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Resolve donor inquiries, receipt re-issues, and hospital verification escalations.
          </p>
        </div>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Donor / Requester</th>
                <th className="py-3 px-4">Subject & Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">{t.id}</td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-[#202124]">{t.donorName}</p>
                    <p className="text-[10px] text-neutral-400">{t.donorEmail}</p>
                  </td>

                  <td className="py-3 px-4 max-w-sm">
                    <p className="font-semibold text-neutral-800">{t.subject}</p>
                    <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                      {t.category}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : t.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateStatus(t.id, e.target.value as any)}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-neutral-700"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
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
