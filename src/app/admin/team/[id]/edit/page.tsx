'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
} from 'lucide-react';

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('reviewer');
  const [secondaryRole, setSecondaryRole] = useState<UserRole | ''>('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | 'pending_setup'>('active');
  const [assignedCampaigns, setAssignedCampaigns] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal State for One-Time Reset Credential
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
      setName(emp.name);
      setEmployeeId(emp.employeeId || '');
      setEmail(emp.email);
      setRole(emp.role);
      setSecondaryRole(emp.secondaryRole || '');
      setDepartment(emp.department || '');
      setJobTitle(emp.jobTitle || '');
      setStatus(emp.status || 'active');
      setAssignedCampaigns((emp.assignedCampaigns || []).join(', '));
      setInternalNotes(emp.internalNotes || '');
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
            Only authorized platform Administrators have authority to edit staff accounts and credentials.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const scopeArray = assignedCampaigns
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const assignedRoles: UserRole[] = secondaryRole && secondaryRole !== role
        ? [role, secondaryRole as UserRole]
        : [role];

      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee.id,
          updates: {
            name,
            employeeId: employeeId.trim().toUpperCase(),
            email: email.trim().toLowerCase(),
            role,
            secondaryRole: (secondaryRole && secondaryRole !== role) ? (secondaryRole as UserRole) : undefined,
            roles: assignedRoles,
            department,
            jobTitle,
            status,
            assignedCampaigns: scopeArray,
            internalNotes,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update employee profile');
      }

      setEmployee(data.employee);
      setToastMessage('Employee profile successfully updated and logged.');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleInitiateReset = async () => {
    if (!confirm(`Generate a secure temporary credential for ${employee.name}? All existing sessions will be invalidated.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee.id,
          action: 'reset_credential',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate reset credential');
      }

      setResetModal({
        open: true,
        temporaryCredential: data.temporaryCredential,
        resetToken: data.resetToken,
      });
      setToastMessage('Single-use temporary credential generated. Old sessions revoked.');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team Management</span>
        </Link>

        <Button
          size="sm"
          variant="outline"
          onClick={handleInitiateReset}
          className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
        >
          <KeyRound className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Reset Credentials
        </Button>
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

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E4E9] shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EF4949]/10 text-[#EF4949]">
              <Edit3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Employee Account Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Edit Staff Details: {employee.name}
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Modify profile parameters, department, role tier, or account activation status.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Full Legal Name <span className="text-[#EF4949]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Employee ID <span className="text-[#EF4949]">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-[#E2E4E9] rounded-xl uppercase focus:outline-none focus:border-[#EF4949]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Official Organization Email <span className="text-[#EF4949]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'suspended' | 'pending_setup')}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl bg-white focus:outline-none focus:border-[#EF4949]"
              >
                <option value="active">Active (Full operational access)</option>
                <option value="pending_setup">Pending Setup (Requires password reset)</option>
                <option value="suspended">Suspended (Access blocked, sessions revoked)</option>
              </select>
            </div>
          </div>

          {/* Role Assignments: Max 2 Roles Enforced */}
          <div className="p-4 rounded-2xl bg-neutral-50/60 border border-[#E2E4E9] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#202124] block">
                  Assigned Staff Roles (Maximum 2 Roles)
                </label>
                <p className="text-[11px] text-[#555B63]">
                  A single employee can have up to 2 roles simultaneously.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                secondaryRole && secondaryRole !== role
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {secondaryRole && secondaryRole !== role ? '2 / 2 Roles Assigned (Max)' : '1 / 2 Roles Assigned'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#202124] block mb-1">
                  Primary Role <span className="text-[#EF4949]">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newPrimary = e.target.value as UserRole;
                    setRole(newPrimary);
                    if (secondaryRole === newPrimary) {
                      setSecondaryRole('');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl bg-white focus:outline-none focus:border-[#EF4949]"
                >
                  <option value="admin">Platform Admin</option>
                  <option value="support_admin">Support Admin</option>
                  <option value="marketer">Marketing Specialist</option>
                  <option value="lead_generator">Lead Generator</option>
                  <option value="content_writer">Campaign Content Writer</option>
                  <option value="reviewer">Medical & NGO Reviewer</option>
                  <option value="finance">Finance Officer</option>
                  <option value="content_editor">Content Editor</option>
                  <option value="head_staff">Head Staff (Field Lead)</option>
                  <option value="campaign_manager">Campaign Manager</option>
                  <option value="support_staff">Support Staff</option>
                  <option value="ops_admin">Operations Administrator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#202124] block mb-1">
                  Secondary Role <span className="text-neutral-400 font-normal">(Optional, Max 2 Total)</span>
                </label>
                <select
                  value={secondaryRole}
                  onChange={(e) => setSecondaryRole(e.target.value as UserRole | '')}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl bg-white focus:outline-none focus:border-[#EF4949]"
                >
                  <option value="">None (Single Role Only)</option>
                  {[
                    { r: 'admin', label: 'Platform Admin' },
                    { r: 'support_admin', label: 'Support Admin' },
                    { r: 'marketer', label: 'Marketing Specialist' },
                    { r: 'lead_generator', label: 'Lead Generator' },
                    { r: 'content_writer', label: 'Campaign Content Writer' },
                    { r: 'reviewer', label: 'Medical & NGO Reviewer' },
                    { r: 'finance', label: 'Finance Officer' },
                    { r: 'content_editor', label: 'Content Editor' },
                    { r: 'head_staff', label: 'Head Staff (Field Lead)' },
                    { r: 'campaign_manager', label: 'Campaign Manager' },
                    { r: 'support_staff', label: 'Support Staff' },
                    { r: 'ops_admin', label: 'Operations Administrator' },
                    { r: 'super_admin', label: 'Super Administrator' },
                  ]
                    .filter((item) => item.r !== role)
                    .map((item) => (
                      <option key={item.r} value={item.r}>
                        {item.label} (Secondary)
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Official Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#202124] block mb-1">
              Assigned Scope / Campaign Slugs
            </label>
            <input
              type="text"
              value={assignedCampaigns}
              onChange={(e) => setAssignedCampaigns(e.target.value)}
              placeholder="e.g. camp-aarav-cancer, camp-assam-flood"
              className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#202124] block mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/admin/team">
              <Button variant="outline" size="sm" type="button" className="text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              className="bg-[#EF4949] hover:bg-[#D9363E] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
            >
              Save Changes
            </Button>
          </div>
        </form>
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
