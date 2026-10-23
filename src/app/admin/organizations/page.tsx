'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Organization } from '@/lib/types';
import { formatINRCompact } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  FileCheck,
  AlertTriangle,
  Plus,
} from 'lucide-react';

export default function AdminOrganizationsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>(db.getOrganizations());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredOrgs = organizations.filter((org) => {
    if (statusFilter !== 'all' && org.verificationStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesName = org.name.toLowerCase().includes(q);
      const matchesDarpan = (org.darpanId || '').toLowerCase().includes(q);
      const matchesPan = org.panNumber.toLowerCase().includes(q);
      const matchesCity = org.city.toLowerCase().includes(q);
      if (!matchesName && !matchesDarpan && !matchesPan && !matchesCity) return false;
    }
    return true;
  });

  const handleVerify = (orgId: string, status: 'verified' | 'rejected' | 'pending') => {
    const res = db.updateOrganizationVerification(orgId, status, user?.name || 'Admin');
    if (res) {
      setOrganizations([...db.getOrganizations()]);
      notify(`Organization ${res.name} verification status set to ${status}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-700">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">NGO Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Nonprofit Organizations & Darpan Verification
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Audit NITI Aayog NGO-Darpan portal IDs, 12A registrations, and 80G tax exemption compliance.
          </p>
        </div>

        <Link href="/verify-organization" target="_blank">
          <Button size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Empanel Partner NGO
          </Button>
        </Link>
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
            placeholder="Search by NGO name, Darpan ID, PAN, or city..."
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
          <option value="all">All Verification States</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending Audit</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Darpan & PAN</th>
                <th className="py-3 px-4">Tax & FCRA</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="w-9 h-9 rounded-xl object-cover shrink-0 border border-neutral-200"
                      />
                      <div>
                        <Link
                          href={`/organizations/${org.slug}`}
                          target="_blank"
                          className="font-bold text-[#202124] hover:text-[#E84B45] flex items-center gap-1"
                        >
                          <span>{org.name}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                        </Link>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{org.campaignsCount} active campaigns</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-neutral-900">{org.darpanId || 'Awaiting Portal ID'}</p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">PAN: {org.panNumber}</p>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">
                        80G
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono">
                        12A
                      </span>
                      {org.fcraRegistered && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold font-mono">
                          FCRA
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-neutral-700">
                    {org.city}, {org.state}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        org.verificationStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : org.verificationStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {org.verificationStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {org.verificationStatus === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleVerify(org.id, 'verified')}
                          className="bg-[#25845B] hover:bg-[#1E6B49] text-white text-[11px] px-2 py-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(org.id, 'rejected')}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] px-2 py-1"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleVerify(
                            org.id,
                            org.verificationStatus === 'verified' ? 'pending' : 'verified'
                          )
                        }
                        className="text-neutral-600 text-[11px] px-2 py-1"
                      >
                        Change Status
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
