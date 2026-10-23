'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { Button } from '@/components/ui/Button';
import { formatINRCompact } from '@/lib/utils';
import {
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle2,
  FileCheck,
  Globe,
} from 'lucide-react';

export default function OrganizationProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const org = db.getOrganizationBySlug(slug);

  if (!org) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-xl font-bold text-[#202124]">Organization Not Found</h1>
        <Link href="/organizations">
          <Button variant="primary">Browse Organizations</Button>
        </Link>
      </div>
    );
  }

  const campaigns = db
    .getCampaigns({ status: 'active' })
    .filter((c) => c.organizationId === org.id || c.organizationName === org.name);

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/organizations" className="hover:text-[#202124]">
            NGO Directory
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">{org.name}</span>
        </nav>

        {/* Profile Header Banner */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] overflow-hidden shadow-sm">
          <div className="relative h-48 sm:h-64 bg-neutral-100 overflow-hidden">
            <img
              src={org.coverUrl}
              alt={org.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8 pt-0 relative space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#EBF7F1] text-[#25845B] border border-[#C2E8D4] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified 80G & Darpan Partner</span>
                </span>
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border border-[#E8E6E1] rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-neutral-600" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#202124]">{org.name}</h1>
              <p className="text-sm font-medium text-[#555B63]">{org.tagline}</p>
              <p className="text-xs text-[#555B63] max-w-3xl leading-relaxed pt-2">
                {org.description}
              </p>
            </div>

            {/* Compliance Credential Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-100 text-xs">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                  NGO Darpan ID
                </span>
                <span className="font-mono font-bold text-[#202124]">{org.darpanId}</span>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                  Section 80G URN
                </span>
                <span className="font-mono font-bold text-emerald-700">{org.reg80G}</span>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                  FCRA Status
                </span>
                <span className="font-semibold text-[#202124]">
                  {org.fcraRegistered ? `Registered (${org.fcraNumber})` : 'Domestic Contributions Only'}
                </span>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1]">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                  Total Aid Raised
                </span>
                <span className="font-bold text-[#E84B45]">
                  {formatINRCompact(org.totalRaised)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns by this NGO */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#202124]">
            Active Campaigns by {org.name} ({campaigns.length})
          </h2>
          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E6E1] p-10 text-center text-xs text-[#555B63]">
              No active public campaigns currently running for this organization.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
