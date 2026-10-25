'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  KeyRound,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function NewEmployeePage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState(() => db.generateNextEmployeeId());
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['reviewer']);
  const [department, setDepartment] = useState('Trust & Safety');
  const [jobTitle, setJobTitle] = useState('Medical & NGO Auditor');
  const [status, setStatus] = useState<'pending_setup' | 'active'>('pending_setup');
  const [assignedCampaigns, setAssignedCampaigns] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [error, setError] = useState('');

  // One-time credential modal state
  const [createdResult, setCreatedResult] = useState<{
    temporaryCredential: string;
    resetToken: string;
    name: string;
    employeeId: string;
    email: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            Employee account provisioning is restricted to authorized platform Administrators.
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

  const roleMeta: Record<UserRole, { dept: string; title: string }> = {
    reviewer: { dept: 'Trust & Safety', title: 'Medical & NGO Auditor' },
    finance: { dept: 'Finance & Compliance', title: 'Senior Finance Officer' },
    content_editor: { dept: 'Communications', title: 'Editorial & Story Lead' },
    head_staff: { dept: 'Field Programs', title: 'Field Lead & Relief Coordinator' },
    campaign_manager: { dept: 'Campaign Growth', title: 'Grassroots Campaign Manager' },
    ops_admin: { dept: 'Operations', title: 'Operations Director' },
    support_staff: { dept: 'Community Support', title: 'Donor Relations Specialist' },
    admin: { dept: 'Executive Operations', title: 'Platform Administrator' },
    support_admin: { dept: 'Support Operations', title: 'Operational Support Administrator' },
    marketer: { dept: 'Growth & Marketing', title: 'Marketing & SEO Specialist' },
    content_writer: { dept: 'Content & Communications', title: 'Campaign Content Writer' },
    lead_generator: { dept: 'Campaign Outreach', title: 'Campaign Lead Generator' },
    super_admin: { dept: 'Executive Governance', title: 'Super Administrator' },
    donor: { dept: 'Community', title: 'Donor' },
    fundraiser: { dept: 'Community', title: 'Fundraiser' },
    organization_manager: { dept: 'NGO Partners', title: 'NGO Manager' },
  };

  const handleToggleRole = (clickedRole: UserRole) => {
    setError('');
    if (selectedRoles.includes(clickedRole)) {
      // Trying to deselect
      if (selectedRoles.length === 1) {
        setError('At least one role must be assigned to the employee.');
        return;
      }
      const updated = selectedRoles.filter((r) => r !== clickedRole);
      setSelectedRoles(updated);
      const primary = updated[0];
      if (primary && roleMeta[primary]) {
        setDepartment(roleMeta[primary].dept);
        setJobTitle(roleMeta[primary].title);
      }
    } else {
      // Trying to select an additional role (maximum 2 roles allowed)
      if (selectedRoles.length >= 2) {
        setError('Maximum 2 roles reached. A single employee can have at most 2 roles at once. Deselect a role first.');
        return;
      }
      const updated = [...selectedRoles, clickedRole];
      setSelectedRoles(updated);
      const p = updated[0];
      const s = updated[1];
      if (p && s && roleMeta[p] && roleMeta[s]) {
        setDepartment(`${roleMeta[p].dept} / ${roleMeta[s].dept}`);
        setJobTitle(`${roleMeta[p].title} & ${roleMeta[s].title}`);
      }
    }
  };

  const handleAutoGenerateId = () => {
    setEmployeeId(db.generateNextEmployeeId());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (selectedRoles.length === 0) {
      setError('At least one role must be assigned.');
      setIsSubmitting(false);
      return;
    }
    if (selectedRoles.length > 2) {
      setError('A single employee can have at most 2 roles at once.');
      setIsSubmitting(false);
      return;
    }

    try {
      const scopeArray = assignedCampaigns
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const primaryRole = selectedRoles[0];
      const secondaryRole = selectedRoles[1] || undefined;

      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          employeeId,
          role: primaryRole,
          secondaryRole,
          roles: selectedRoles,
          department,
          jobTitle,
          status,
          assignedCampaigns: scopeArray,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to provision staff account');
      }

      setCreatedResult({
        temporaryCredential: data.temporaryCredential,
        resetToken: data.resetToken,
        name: data.employee.name,
        employeeId: data.employee.employeeId || 'N/A',
        email: data.employee.email,
      });
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
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
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E4E9] shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EF4949]/10 text-[#EF4949]">
              <UserPlus className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Staff Provisioning
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Provision New Employee Account
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Register official coordinates, assign role-based capabilities, and generate a cryptographically random initial credential.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name and Employee ID */}
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
                placeholder="e.g. Shalini Mukherjee"
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#202124]">
                  Employee ID <span className="text-[#EF4949]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateId}
                  className="text-[11px] font-semibold text-[#EF4949] hover:underline cursor-pointer"
                >
                  Auto-Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="EMP-0010"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-[#E2E4E9] rounded-xl uppercase focus:outline-none focus:border-[#EF4949]"
              />
            </div>
          </div>

          {/* Row 2: Official Email and Account Status */}
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
                placeholder="shalini.m@dokind.org.in"
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Must be an official, unique email address.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Initial Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending_setup' | 'active')}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl bg-white focus:outline-none focus:border-[#EF4949]"
              >
                <option value="pending_setup">Pending Setup (Requires password creation on first login)</option>
                <option value="active">Active (Immediate full access upon authentication)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Role Assignment (Enforcing Max 2 Roles) */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="text-xs font-bold text-[#202124] block">
                  Assigned Staff Roles & Capability Tiers <span className="text-[#EF4949]">*</span>
                </label>
                <p className="text-[11px] text-[#555B63]">
                  A single employee can have at most 2 roles at once (Primary Role & Secondary Role).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  selectedRoles.length === 2
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {selectedRoles.length} / 2 Roles Selected (Max 2)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { role: 'admin', title: 'Platform Admin', desc: 'Full administration & governance' },
                { role: 'support_admin', title: 'Support Admin', desc: 'Campaigns, support, team & finances' },
                { role: 'marketer', title: 'Marketing Specialist', desc: 'SEO, attribution & campaigns metrics' },
                { role: 'lead_generator', title: 'Lead Generator', desc: 'Campaign outreach, leads & draft proposals' },
                { role: 'content_writer', title: 'Content Writer', desc: 'Campaign stories, drafts & FAQs' },
                { role: 'reviewer', title: 'Medical & NGO Reviewer', desc: 'Verify certificates & compliance' },
                { role: 'finance', title: 'Finance Officer', desc: 'Reconciliations & audit reports' },
                { role: 'content_editor', title: 'Content Editor', desc: 'Stories, blogs & announcements' },
                { role: 'head_staff', title: 'Head Staff', desc: 'Draft campaigns & coordinator updates' },
                { role: 'campaign_manager', title: 'Campaign Manager', desc: 'Manage assigned grassroots drives' },
                { role: 'support_staff', title: 'Support Staff', desc: 'Donor & beneficiary inquiries' },
                { role: 'ops_admin', title: 'Operations Admin', desc: 'Day-to-day operations & NGOs' },
                { role: 'super_admin', title: 'Super Admin', desc: 'Root governance & credential authority' },
              ].map((r) => {
                const roleIdx = selectedRoles.indexOf(r.role as UserRole);
                const isSelected = roleIdx !== -1;
                const isMaxReached = selectedRoles.length >= 2 && !isSelected;

                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleToggleRole(r.role as UserRole)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                      isSelected
                        ? roleIdx === 0
                          ? 'border-[#EF4949] bg-rose-50/50 shadow-2xs ring-1 ring-[#EF4949]'
                          : 'border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500'
                        : isMaxReached
                        ? 'border-[#E2E4E9] opacity-60 bg-neutral-50/80 cursor-not-allowed'
                        : 'border-[#E2E4E9] hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-[#202124]">{r.title}</span>
                      {isSelected ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                            roleIdx === 0
                              ? 'bg-[#EF4949] text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {roleIdx === 0 ? 'Primary' : 'Secondary'}
                        </span>
                      ) : isMaxReached ? (
                        <span className="text-[10px] text-neutral-400 font-semibold">Max 2</span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-snug">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Department & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Department / Operational Unit
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Trust & Safety"
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
                placeholder="e.g. Senior Medical Compliance Auditor"
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
            </div>
          </div>

          {/* Row 5: Scope & Internal Notes */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Assigned Scope / Campaign Slugs (Optional)
              </label>
              <input
                type="text"
                value={assignedCampaigns}
                onChange={(e) => setAssignedCampaigns(e.target.value)}
                placeholder="e.g. camp-aarav-cancer, camp-assam-flood (comma-separated)"
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Leave blank to allow role-default workspace scope.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#202124] block mb-1">
                Internal Onboarding Notes
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Background check verified, background in oncology billing auditing..."
                className="w-full px-3.5 py-2.5 text-xs border border-[#E2E4E9] rounded-xl focus:outline-none focus:border-[#EF4949]"
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E2E4E9] rounded-2xl text-xs text-neutral-600 space-y-1">
            <p className="font-bold text-[#202124] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#EF4949]" />
              Cryptographic Credential Safeguards
            </p>
            <p className="text-[11px] leading-relaxed">
              Upon submission, a cryptographically secure, high-entropy temporary password will be generated and hashed. The plaintext value is shown only once in a secure post-creation dialog.
            </p>
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
              Provision Account & Generate Credential
            </Button>
          </div>
        </form>
      </div>

      {/* ================= ONE-TIME CREDENTIAL DIALOG AFTER CREATION ================= */}
      {createdResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#E2E4E9] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">
                  Employee Account Provisioned!
                </h3>
                <p className="text-xs text-[#555B63]">
                  {createdResult.name} has been assigned Employee ID <strong>{createdResult.employeeId}</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                One-Time Secret: Save Immediately
              </p>
              <p className="text-[11px] leading-relaxed text-rose-700">
                This randomly generated temporary password will NOT be shown again. It is stored in the database exclusively as a cryptographically salted hash.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Temporary Credential (High Entropy)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.temporaryCredential}
                    className="flex-1 font-mono text-sm bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-[#202124] select-all font-bold"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCopy(createdResult.temporaryCredential)}
                    className="bg-[#202124] text-white text-xs px-3.5 py-2 rounded-xl"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Direct Onboarding Link
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/login?token=${createdResult.resetToken}`}
                  className="w-full font-mono text-[11px] bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-600 select-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => router.push('/admin/team')}
                className="bg-[#202124] hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl"
              >
                Done — Return to Team Roster
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
