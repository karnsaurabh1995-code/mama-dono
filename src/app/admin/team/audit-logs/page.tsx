'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { AuditLog } from '@/lib/types';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  History,
  ArrowLeft,
  ShieldAlert,
  Search,
  Filter,
  UserCheck,
  KeyRound,
  RotateCcw,
  Shield,
  FileText,
} from 'lucide-react';

export default function TeamAuditLogsPage() {
  const { user: currentUser } = useAuth();
  const [logs] = useState<AuditLog[]>(() => db.getTeamAuditLogs());
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const isAuthorizedAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'support_admin';

  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-[#E2E4E9] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#EF4949] flex items-center justify-center mx-auto border border-rose-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124]">
            Administrator Authority Required
          </h1>
          <p className="text-xs sm:text-sm text-[#555B63] max-w-md mx-auto leading-relaxed">
            Only authorized platform Administrators have authority to inspect staff management audit logs and credential history.
          </p>
          <div className="pt-2">
            <Link href="/admin">
              <Button size="sm" variant="outline" className="text-xs">
                Back to Admin Overview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team Management</span>
        </Link>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EF4949]/10 text-[#EF4949]">
              <History className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Accountability Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Team & Credential Audit Logs
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Immutable record of staff account provisioning, role reassignments, credential resets, and session revocations.
          </p>
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Total Recorded Actions: <strong className="text-[#202124]">{logs.length}</strong>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, administrator, or employee..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E4E9] rounded-xl bg-[#FAF9F6] focus:outline-none focus:border-[#EF4949] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Action Type:</span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-[#E2E4E9] rounded-xl px-2.5 py-1.5 bg-[#FAF9F6] focus:outline-none focus:border-[#EF4949]"
          >
            <option value="all">All Actions</option>
            <option value="EMPLOYEE_ACCOUNT_CREATED">Employee Account Created</option>
            <option value="EMPLOYEE_PROFILE_UPDATED">Profile Updated</option>
            <option value="EMPLOYEE_ROLE_CHANGED">Role Changed</option>
            <option value="EMPLOYEE_ACCOUNT_ACTIVATED">Account Activated</option>
            <option value="EMPLOYEE_ACCOUNT_SUSPENDED">Account Suspended</option>
            <option value="EMPLOYEE_CREDENTIAL_RESET_INITIATED">Credential Reset Initiated</option>
            <option value="EMPLOYEE_SESSIONS_REVOKED">Sessions Revoked</option>
            <option value="ROLE_PERMISSIONS_UPDATED">Role Permissions Updated</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E4E9] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Acting Administrator</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F6]/60 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                        log.action.includes('CREATED')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : log.action.includes('RESET') || log.action.includes('SUSPENDED')
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : log.action.includes('ROLE')
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}>
                        {log.action.replace('EMPLOYEE_', '').replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-[#202124]">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                      {log.targetId}
                    </td>
                    <td className="py-3 px-4 text-neutral-700 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
