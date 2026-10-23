'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { DynamicForm, FormSubmission } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  FileInput,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  Phone,
  Eye,
  Filter,
  Search,
} from 'lucide-react';

export default function AdminFormsPage() {
  const { user } = useAuth();
  const [forms] = useState<DynamicForm[]>(db.getForms());
  const [submissions, setSubmissions] = useState<FormSubmission[]>(db.getFormSubmissions());
  const [selectedFormSlug, setSelectedFormSlug] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (selectedFormSlug !== 'all' && s.formSlug !== selectedFormSlug) return false;
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: FormSubmission['status']) => {
    const updated = db.updateSubmissionStatus(id, newStatus, `Updated by ${user?.name || 'Admin'}`);
    if (updated) {
      setSubmissions([...db.getFormSubmissions()]);
      notify(`Submission marked as "${newStatus}".`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <FileInput className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lead Generation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Dynamic Forms & Inbound Leads
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Review incoming CSR partnership requests, hospital empanelment applications, and institutional donor leads.
          </p>
        </div>

        {/* Filter by Form */}
        <select
          value={selectedFormSlug}
          onChange={(e) => setSelectedFormSlug(e.target.value)}
          className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800"
        >
          <option value="all">All Forms ({submissions.length} Leads)</option>
          {forms.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.title}
            </option>
          ))}
        </select>
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

      {/* Forms Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {forms.map((form) => (
          <div key={form.id} className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#202124]">{form.title}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full font-mono">
                {form.submissionsCount} submissions
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">{form.description}</p>
            <div className="pt-2 text-[10px] text-neutral-400 font-mono">
              Endpoint: /api/forms/{form.slug}
            </div>
          </div>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202124]">Incoming Leads & CSR Inquiries</h3>
          <span className="text-xs text-neutral-400">{filteredSubmissions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Entity / Contact</th>
                <th className="py-3 px-4">Form</th>
                <th className="py-3 px-4">Submitted Details</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#202124]">
                      {sub.data.companyName || sub.data.hospitalName || sub.data.contactPerson || 'Lead'}
                    </p>
                    <p className="text-[11px] text-neutral-500">{sub.data.workEmail || sub.data.officialEmail}</p>
                    <p className="text-[10px] text-neutral-400">{sub.data.phone}</p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 font-bold text-neutral-700">
                      {sub.formSlug}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-sm">
                    {sub.data.csrBudget && (
                      <p className="font-bold text-neutral-800 text-xs">Budget: {sub.data.csrBudget}</p>
                    )}
                    {sub.data.preferredCauses && (
                      <p className="text-[11px] text-neutral-600 line-clamp-1">Focus: {sub.data.preferredCauses}</p>
                    )}
                    {sub.data.comments && (
                      <p className="text-[10px] text-neutral-400 italic line-clamp-2 mt-0.5">{sub.data.comments}</p>
                    )}
                  </td>

                  <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">{formatDate(sub.submittedAt)}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : sub.status === 'in_review'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <select
                      value={sub.status}
                      onChange={(e) => handleUpdateStatus(sub.id, e.target.value as any)}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-neutral-700"
                    >
                      <option value="new">New</option>
                      <option value="in_review">In Review</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved / Closed</option>
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
