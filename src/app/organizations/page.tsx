import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINRCompact } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function OrganizationsDirectoryPage() {
  const organizations = db.getOrganizations();

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Verified NGO Directory</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
              Verified Non-Profit Partners Across India
            </h1>
            <p className="text-sm text-[#555B63] max-w-2xl leading-relaxed">
              Every organization in this directory has undergone comprehensive verification of its 12A, 80G, Darpan ID, and audited financial statements.
            </p>
          </div>
          <Link href="/verify-organization">
            <Button variant="outline" size="md">
              Apply for NGO Verification
            </Button>
          </Link>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Cover & Logo */}
                <div className="relative h-32 bg-neutral-100 overflow-hidden">
                  <img
                    src={org.coverUrl}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#EBF7F1] text-[#25845B] border border-[#C2E8D4] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Partner</span>
                    </span>
                  </div>
                </div>

                <div className="p-5 pt-0 relative space-y-3">
                  {/* Floating Logo */}
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden -mt-7 relative z-10">
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#202124] hover:text-[#E84B45] transition-colors">
                      <Link href={`/organizations/${org.slug}`}>
                        {org.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#555B63] mt-1 line-clamp-2">
                      {org.tagline}
                    </p>
                  </div>

                  {/* Badges / IDs */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-neutral-600">
                    {org.darpanId && (
                      <span className="bg-[#FAF9F6] border border-[#E8E6E1] px-2 py-0.5 rounded">
                        Darpan: {org.darpanId}
                      </span>
                    )}
                    {org.reg80G && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-sans font-semibold">
                        80G Certified
                      </span>
                    )}
                    {org.fcraRegistered && (
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-sans font-semibold">
                        FCRA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#555B63] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{org.city}, {org.state}</span>
                    </span>
                    <span>• Est. {org.foundedYear}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="p-5 pt-0 border-t border-neutral-100 mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-2 pt-3 text-center text-xs">
                  <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#E8E6E1]">
                    <div className="font-bold text-[#202124]">
                      {formatINRCompact(org.totalRaised)}
                    </div>
                    <div className="text-[10px] text-[#555B63]">Aid Facilitated</div>
                  </div>
                  <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#E8E6E1]">
                    <div className="font-bold text-[#25845B]">
                      {org.beneficiariesImpacted.toLocaleString('en-IN')}+
                    </div>
                    <div className="text-[10px] text-[#555B63]">Beneficiaries</div>
                  </div>
                </div>

                <Link href={`/organizations/${org.slug}`} className="block w-full">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <span>View Profile & Campaigns</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
