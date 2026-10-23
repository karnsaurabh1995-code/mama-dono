'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { AuditLog } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  History,
  Search,
  Filter,
  FileCheck,
  Shield,
  Download,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(db.getAuditLogs());
  const [search, setSearch] = useState('');
  const [targetFilter, setTargetFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    if (targetFilter !== 'all' && log.targetType !== targetFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesActor = log.actorName.toLowerCase().includes(q);
      const matchesAction = log.action.toLowerCase().includes(q);
      const matchesDetails = log.details.toLowerCase().includes(q);
      if (!matchesActor && !matchesAction && !matchesDetails) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Action', 'Target Type', 'Target ID', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.actorName}"`,
      l.action,
      l.targetType,
      l.targetId,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encoded);
    a.setAttribute('download', `sevasetu_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <History className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Security & Compliance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Immutable Audit Trail Ledger
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Cryptographically timestamped log of all approvals, refund authorizations, and theme modifications.
          </p>
        </div>

        <Button size="sm" onClick={handleExportCSV} className="bg-[#202124] hover:bg-black text-white text-xs">
          <Download className="w-3.5 h-3.5 mr-1" />
          Export Audit Log CSV
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by actor, action verb, or detail description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
          />
        </div>

        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className="bg-neutral-50 border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-800"
        >
          <option value="all">All Entity Targets</option>
          <option value="campaign">Campaigns</option>
          <option value="donation">Donations & Refunds</option>
          <option value="organization">Organizations</option>
          <option value="settings">Settings & Theme</option>
          <option value="user">Users & RBAC</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Ledger Record Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                    {formatDate(l.timestamp)}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-[#202124]">{l.actorName}</p>
                    <span className="text-[10px] text-neutral-400 font-mono">{l.actorId}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-bold">
                      {l.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {l.targetType}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-neutral-700 max-w-md">
                    <p className="text-xs leading-relaxed">{l.details}</p>
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
