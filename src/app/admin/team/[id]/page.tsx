'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { User } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  KeyRound,
  RotateCcw,
  Mail,
  Building,
  Calendar,
  Lock,
  UserCheck,
  UserX,
  Copy,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [resetModal, setResetModal] = useState<{
    open: boolean;
    temporaryCredential: string;
    resetToken: string;
  }>({
    open: false,
    temporaryCredential: '',
    resetToken: '',
  });
  const [copied, setCopied] = useState(false);

  const isAuthorizedAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'support_admin';

  useEffect(() => {
    if (!id) return;
    const emp = db.getEmployeeById(id);
    if (emp) {
      setEmployee(emp);
    }
  }, [id]);

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
            Only authorized platform Administrators have authority to view staff profiles and credential management details.
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

  if (!employee) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-[#202124]">Employee Account Not Found</h2>
        <Link href="/admin/team">
          <Button size="sm" variant="outline" className="text-xs">
            Return to Team Roster
          </Button>
        </Link>
      </div>
    );
  }

  const handleInitiateReset = () => {
    if (!confirm(`Generate a secure temporary credential for ${employee.name}? All existing sessions will be invalidated.`)) {
      return;
    }

    try {
      const result = db.initiateCredentialReset(
        employee.id,
        currentUser || { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' }
      );
      setEmployee(db.getEmployeeById(employee.id) || null);
      setResetModal({
        open: true,
        temporaryCredential: result.temporaryCredential,
        resetToken: result.resetToken,
      });
      setToastMessage('Single-use temporary credential generated. Old sessions revoked.');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleToggleStatus = () => {
    const nextStatus = employee.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = nextStatus === 'suspended' ? 'suspend' : 'reinstate';

    if (!confirm(`Are you sure you want to ${actionLabel} access for ${employee.name} (${employee.employeeId})?`)) {
      return;
    }

    try {
      const updated = db.setEmployeeStatus(
        employee.id,
        nextStatus,
        currentUser || { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' }
      );
      setEmployee(updated);
      setToastMessage(`Staff account ${nextStatus === 'suspended' ? 'suspended' : 'reinstated'}.`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleRevokeSessions = () => {
    if (!confirm(`Revoke all active sessions and refresh tokens for ${employee.name}?`)) {
      return;
    }

    try {
      const updated = db.revokeEmployeeSessions(
        employee.id,
        currentUser || { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' }
      );
      setEmployee(updated);
      setToastMessage(`All active sessions revoked for ${employee.name}.`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team Management</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleInitiateReset}
            className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Reset Credential
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRevokeSessions}
            className="text-xs text-neutral-700"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Revoke Sessions
          </Button>

          <Link href={`/admin/team/${employee.id}/edit`}>
            <Button size="sm" className="bg-[#EF4949] hover:bg-[#D9363E] text-white text-xs font-bold shadow-xs">
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Edit Account
            </Button>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#E2E4E9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-black text-xl text-[#202124] shrink-0">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
                  {employee.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                  {employee.employeeId || 'EMP-N/A'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-[#EF4949] border border-rose-200">
                  {employee.role.replace('_', ' ')}
                </span>
                {employee.secondaryRole && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {employee.secondaryRole.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#555B63] mt-1">{employee.jobTitle || employee.role} • {employee.department || 'General Operations'}</p>
            </div>
          </div>

          <div>
            {employee.status === 'active' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Active Account
              </span>
            )}
            {employee.status === 'pending_setup' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                Pending Initial Password Setup
              </span>
            )}
            {employee.status === 'suspended' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Account Suspended
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
              Employment Coordinates
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Official Email:</span>
                <span className="font-semibold text-[#202124]">{employee.email}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Department:</span>
                <span className="font-semibold text-[#202124]">{employee.department || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Job Title:</span>
                <span className="font-semibold text-[#202124]">{employee.jobTitle || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Account Created:</span>
                <span className="font-semibold text-[#202124]">{formatDate(employee.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
              Security & Credential Status
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Password Storage:</span>
                <span className="font-mono text-emerald-700 font-bold">Argon2id Salted Hash</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">First-Login Password Reset:</span>
                <span className="font-semibold text-[#202124]">{employee.requiresPasswordChange ? 'Required' : 'Completed'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Last Credential Reset:</span>
                <span className="font-semibold text-[#202124]">{employee.lastResetAt ? formatDate(employee.lastResetAt) : 'Never'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Session Status:</span>
                <span className="font-semibold text-[#202124]">
                  {employee.sessionRevokedAt ? `Revoked on ${formatDate(employee.sessionRevokedAt)}` : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Scope & Notes */}
        <div className="px-6 pb-8 space-y-4 text-xs">
          {employee.assignedCampaigns && employee.assignedCampaigns.length > 0 && (
            <div className="p-4 bg-[#FAF9F6] border border-[#E2E4E9] rounded-2xl space-y-1.5">
              <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] block">
                Assigned Operational Campaign Scope
              </span>
              <div className="flex flex-wrap gap-1.5">
                {employee.assignedCampaigns.map((c, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-md font-mono text-[11px] bg-white border border-neutral-200 text-[#202124]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {employee.internalNotes && (
            <div className="p-4 bg-[#FAF9F6] border border-[#E2E4E9] rounded-2xl space-y-1">
              <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] block">
                Internal Administrative Notes
              </span>
              <p className="text-neutral-700 leading-relaxed">{employee.internalNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= ONE-TIME RESET CREDENTIAL MODAL ================= */}
      {resetModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#E2E4E9] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">
                  Credential Reset Generated
                </h3>
                <p className="text-xs text-[#555B63]">
                  Issued for {employee.name} ({employee.employeeId})
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Single-Use Credential Notice
              </p>
              <p className="text-[11px] leading-relaxed text-rose-700">
                Previous sessions for this employee have been immediately invalidated. Securely share this temporary password with the staff member.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  New Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={resetModal.temporaryCredential}
                    className="flex-1 font-mono text-sm bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-[#202124] select-all font-bold"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCopy(resetModal.temporaryCredential)}
                    className="bg-[#202124] text-white text-xs px-3.5 py-2 rounded-xl"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Single-Use Reset Link
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/login?token=${resetModal.resetToken}`}
                  className="w-full font-mono text-[11px] bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-600 select-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => setResetModal({ open: false, temporaryCredential: '', resetToken: '' })}
                className="bg-[#202124] hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl"
              >
                Close & Return
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
