'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, CampaignRevisionSubmission } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  FilePlus,
  Clock,
  Edit,
  Eye,
  Plus,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  Lock,
} from 'lucide-react';

export default function StaffCampaignsPage() {
  const { user } = useAuth();
  const [campaigns] = useState<Campaign[]>(db.getCampaigns());
  const [submissions] = useState<CampaignRevisionSubmission[]>(
    db.getRevisionSubmissions()
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Field Operations & Editorial
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Head Staff Campaign Workspace
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Prepare new campaign drafts, propose photography updates, and submit verified field progress reports.
          </p>
        </div>

        <Link href="/staff/campaigns/new">
          <Button className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold">
            <FilePlus className="w-3.5 h-3.5 mr-1" />
            Prepare New Campaign Draft
          </Button>
        </Link>
      </div>

      {/* RBAC Security Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Head Staff Security Boundary:</strong> You can edit written stories, upload field photographs,
          and prepare field milestone updates. All submissions enter the Administrator Review Queue prior to public release.
          Financial goals, ledger accounting, and payment gateways are locked to administrators.
        </div>
      </div>

      {/* Submissions in Review Status Strip */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-[#202124] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E84B45]" />
            Your Proposals Awaiting Admin Review ({submissions.length})
          </h2>
          <span className="text-xs text-neutral-400">Live Status Tracking</span>
        </div>

        {submissions.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-400 border border-neutral-100 rounded-xl">
            No pending submissions. Use the buttons below to propose content updates.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202124] line-clamp-1">{sub.proposedTitle || sub.title}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      sub.status === 'pending_review'
                        ? 'bg-amber-100 text-amber-800'
                        : sub.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'changes_requested'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                {sub.submissionNotes && (
                  <p className="text-[11px] text-neutral-600 italic">&ldquo;{sub.submissionNotes}&rdquo;</p>
                )}

                {sub.reviewerNotes && (
                  <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-200 text-[11px] text-amber-900">
                    <strong>Admin Feedback:</strong> {sub.reviewerNotes}
                  </div>
                )}

                <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between pt-1 border-t border-neutral-200">
                  <span>ID: {sub.id}</span>
                  <span>Submitted {formatDate(sub.submittedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ongoing Campaigns List */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-[#202124]">
            Assigned Field Campaigns ({campaigns.length})
          </h2>
          <span className="text-xs text-neutral-400">Select a campaign to propose copy or field updates</span>
        </div>

        <div className="divide-y divide-neutral-100">
          {campaigns.map((camp) => (
            <div key={camp.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-bold">
                      {camp.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        camp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#202124] mt-1">{camp.title}</h3>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Beneficiary: <strong>{camp.beneficiaryName}</strong> ({camp.beneficiaryLocation})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Link href={`/staff/campaigns/${camp.id}/edit-content`}>
                  <Button size="sm" variant="outline" className="text-xs font-bold">
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Propose Content Edit
                  </Button>
                </Link>

                <Link href={`/staff/campaigns/${camp.id}/updates`}>
                  <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Submit Field Update
                  </Button>
                </Link>

                <Link href={`/campaigns/${camp.slug}`} target="_blank">
                  <button className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600" title="View live page">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
