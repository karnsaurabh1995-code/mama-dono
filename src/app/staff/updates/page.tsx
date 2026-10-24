'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { CampaignUpdate, Campaign } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Plus,
  Send,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';

export default function StaffUpdatesFeedPage() {
  const { user } = useAuth();
  const campaigns = db.getCampaigns();
  const updates = db.getCampaignUpdates(undefined, true);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Field Reports Feed
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Campaign Progress & Milestone Log
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Overview of field dispatches, patient clinical updates, and reviews pending admin moderation.
          </p>
        </div>

        <Link href={`/staff/campaigns/${campaigns[0]?.id || 'camp-assam-flood-relief'}/updates`}>
          <Button className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Submit New Field Update
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {updates.map((upd) => {
          const camp = campaigns.find((c) => c.id === upd.campaignId);
          return (
            <div
              key={upd.id}
              className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {upd.milestoneAchieved || 'Field Update'}
                  </span>
                  <span className="text-xs font-bold text-neutral-600">
                    {camp?.title || upd.campaignId}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    upd.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : upd.status === 'pending_review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {upd.status?.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#202124]">{upd.title}</h3>

              <div className="flex flex-col md:flex-row gap-4">
                {upd.mediaUrls && upd.mediaUrls.length > 0 && (
                  <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={upd.mediaUrls[0]} alt="Update preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-xs text-[#555B63] leading-relaxed flex-1">{upd.content}</p>
              </div>

              <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between pt-2 border-t border-neutral-100">
                <span>Author: {upd.authorName} ({upd.authorRole})</span>
                <span>{upd.publishedAt ? formatDate(upd.publishedAt) : 'Pending Admin Signoff'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
