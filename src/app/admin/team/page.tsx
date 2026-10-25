'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { User, UserRole } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  KeyRound,
  Lock,
  RotateCcw,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Copy,
  ExternalLink,
  Edit3,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function TeamManagementPage() {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>(() => db.getEmployees());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState('');

  // Modal State for One-Time Temporary Credential Display
  const [credentialModal, setCredentialModal] = useState<{
    open: boolean;
    employeeName: string;
    employeeId: string;
    email: string;
    temporaryCredential: string;
    resetToken?: string;
  }>({
    open: false,
    employeeName: '',
    employeeId: '',
    email: '',
    temporaryCredential: '',
  });

  // Modal State for Role Change (Supports up to 2 roles)
  const [roleChangeModal, setRoleChangeModal] = useState<{
    open: boolean;
    employee: User | null;
    selectedRole: UserRole;
    secondaryRole: UserRole | '';
  }>({
    open: false,
    employee: null,
    selectedRole: 'reviewer',
    secondaryRole: '',
  });

  const [copied, setCopied] = useState(false);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const isAuthorizedAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'support_admin';

  // ---------------- ACCESS DENIED STATE FOR NON-ADMINISTRATORS ----------------
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
            Employee account provisioning, staff role reassignment, and credential resets are strictly restricted to authorized platform Administrators.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 inline-block font-mono">
            Current Authenticated Role: <strong className="text-[#202124]">{currentUser?.role || 'guest'}</strong>
          </div>
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

  // Action Handlers
  const handleInitiateReset = (emp: User) => {
    if (!confirm(`Generate a secure temporary credential and single-use password reset link for ${emp.name}? Existing sessions will be revoked.`)) {
      return;
    }

    try {
      const result = db.initiateCredentialReset(
        emp.id,
        currentUser || { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' }
      );
      setEmployees([...db.getEmployees()]);
      setCredentialModal({
        open: true,
        employeeName: emp.name,
        employeeId: emp.employeeId || 'N/A',
        email: emp.email,
        temporaryCredential: result.temporaryCredential,
        resetToken: result.resetToken,
      });
      notify(`Single-use credential generated for ${emp.name}. Existing sessions revoked.`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleToggleStatus = (emp: User) => {
    const nextStatus = emp.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = nextStatus === 'suspended' ? 'suspend' : 'reinstate';

    if (!confirm(`Are you sure you want to ${actionLabel} access for ${emp.name} (${emp.employeeId})?`)) {
      return;
    }

    try {
      db.setEmployeeStatus(
        emp.id,
        nextStatus,
        currentUser || { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' }
      );
      setEmployees([...db.getEmployees()]);
      notify(`Staff account for ${emp.name} has been ${nextStatus === 'suspended' ? 'suspended' : 'reinstated'}.`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleRevokeSessions = (emp: User) => {
    if (!confirm(`Revoke all active sessions and refresh tokens for ${emp.name}?`)) {
      return;
    }

    try {
      db.revokeEmployeeSessions(
        emp.id,
        currentUser || { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' }
      );
      setEmployees([...db.getEmployees()]);
      notify(`All active sessions revoked for ${emp.name}.`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleConfirmRoleChange = () => {
    if (!roleChangeModal.employee) return;
    try {
      const assignedRoles: UserRole[] =
        roleChangeModal.secondaryRole && roleChangeModal.secondaryRole !== roleChangeModal.selectedRole
          ? [roleChangeModal.selectedRole, roleChangeModal.secondaryRole as UserRole]
          : [roleChangeModal.selectedRole];

      db.updateEmployee(
        roleChangeModal.employee.id,
        {
          role: roleChangeModal.selectedRole,
          secondaryRole:
            roleChangeModal.secondaryRole && roleChangeModal.secondaryRole !== roleChangeModal.selectedRole
              ? (roleChangeModal.secondaryRole as UserRole)
              : undefined,
          roles: assignedRoles,
        },
        currentUser || { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' }
      );
      setEmployees([...db.getEmployees()]);
      setRoleChangeModal({ open: false, employee: null, selectedRole: 'reviewer', secondaryRole: '' });
      notify(`Role(s) updated for ${roleChangeModal.employee.name}.`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCopyCredential = (text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Filter employees (evaluates both primary and secondary roles)
  const filteredEmployees = employees.filter((emp) => {
    if (roleFilter !== 'all' && emp.role !== roleFilter && emp.secondaryRole !== roleFilter) return false;
    if (statusFilter !== 'all' && (emp.status || 'active') !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchId = emp.employeeId?.toLowerCase().includes(q);
      const matchDept = emp.department?.toLowerCase().includes(q);
      return matchName || matchEmail || matchId || matchDept;
    }
    return true;
  });

  // Metric counts
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'active' || !e.status).length;
  const pendingCount = employees.filter((e) => e.status === 'pending_setup').length;
  const suspendedCount = employees.filter((e) => e.status === 'suspended').length;

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-neutral-500 hover:text-neutral-800">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EF4949]/10 text-[#EF4949]">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Super Admin Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Team & Employee Management
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Provision staff IDs, control role capabilities, manage account status, and issue cryptographically secure credential resets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/team/audit-logs">
            <Button size="sm" variant="outline" className="text-xs text-neutral-700">
              <History className="w-3.5 h-3.5 mr-1 text-neutral-500" />
              Team Audit Trail
            </Button>
          </Link>
          <Link href="/admin/team/roles">
            <Button size="sm" variant="outline" className="text-xs text-neutral-700">
              <Sliders className="w-3.5 h-3.5 mr-1 text-neutral-500" />
              Role Capabilities
            </Button>
          </Link>
          <Link href="/admin/team/new">
            <Button size="sm" className="bg-[#EF4949] hover:bg-[#D9363E] text-white text-xs font-bold shadow-xs">
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Add New Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Staff</span>
          <p className="text-2xl font-black text-[#202124]">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active Accounts</span>
          <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Setup</span>
          <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Suspended</span>
          <p className="text-2xl font-black text-rose-700">{suspendedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, email, or dept..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E4E9] rounded-xl bg-[#FAF9F6] focus:outline-none focus:border-[#EF4949] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-[#E2E4E9] rounded-xl px-2.5 py-1.5 bg-[#FAF9F6] focus:outline-none focus:border-[#EF4949]"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Administrator</option>
            <option value="admin">Platform Administrator</option>
            <option value="support_admin">Support Administrator</option>
            <option value="lead_generator">Lead Generator</option>
            <option value="content_writer">Content Writer</option>
            <option value="marketer">Marketing Specialist</option>
            <option value="ops_admin">Operations Administrator</option>
            <option value="campaign_manager">Campaign Manager</option>
            <option value="head_staff">Head Staff (Field Lead)</option>
            <option value="reviewer">Medical & NGO Reviewer</option>
            <option value="finance">Finance Officer</option>
            <option value="content_editor">Content & Editorial Lead</option>
            <option value="support_staff">Support Staff</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-[#E2E4E9] rounded-xl px-2.5 py-1.5 bg-[#FAF9F6] focus:outline-none focus:border-[#EF4949]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_setup">Pending Setup</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E4E9] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Name & Title</th>
                <th className="py-3 px-4">Official Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No employee accounts found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const status = emp.status || 'active';
                  const isCurrent = currentUser?.id === emp.id;

                  return (
                    <tr key={emp.id} className="hover:bg-[#FAF9F6]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202124]">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200">
                          {emp.employeeId || 'EMP-N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center font-bold text-xs text-neutral-700 shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#202124] flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 block">{emp.jobTitle || emp.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-600">
                        {emp.email}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">
                        {emp.department || 'General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setRoleChangeModal({
                                open: true,
                                employee: emp,
                                selectedRole: emp.role,
                                secondaryRole: emp.secondaryRole || '',
                              })
                            }
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-[#EF4949] border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                            title="Primary Role (Click to manage roles)"
                          >
                            {emp.role.replace('_', ' ')}
                          </button>
                          {emp.secondaryRole && (
                            <button
                              type="button"
                              onClick={() =>
                                setRoleChangeModal({
                                  open: true,
                                  employee: emp,
                                  selectedRole: emp.role,
                                  secondaryRole: emp.secondaryRole || '',
                                })
                              }
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                              title="Secondary Role (Click to manage roles)"
                            >
                              {emp.secondaryRole.replace('_', ' ')}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Active
                          </span>
                        )}
                        {status === 'pending_setup' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Pending Setup
                          </span>
                        )}
                        {status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Credential */}
                          <button
                            type="button"
                            onClick={() => handleInitiateReset(emp)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                            title="Initiate single-use credential reset"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Revoke Sessions */}
                          <button
                            type="button"
                            onClick={() => handleRevokeSessions(emp)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                            title="Revoke active sessions"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Suspend / Activate Toggle */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(emp)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                status === 'suspended'
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={status === 'suspended' ? 'Reinstate staff account' : 'Suspend staff account'}
                            >
                              {status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Edit Details */}
                          <Link
                            href={`/admin/team/${emp.id}/edit`}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-[#EF4949] hover:bg-rose-50 transition"
                            title="Edit employee details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: SECURE ONE-TIME CREDENTIAL DISPLAY ================= */}
      {credentialModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#E2E4E9] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">
                  One-Time Temporary Credential
                </h3>
                <p className="text-xs text-[#555B63]">
                  Issued for {credentialModal.employeeName} ({credentialModal.employeeId})
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Security Policy: Never Stored in Plaintext
              </p>
              <p className="text-[11px] leading-relaxed text-rose-700">
                This randomly generated credential will NOT be shown again. Securely share it with the employee. The employee will be required to configure a new private password upon first login.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={credentialModal.temporaryCredential}
                    className="flex-1 font-mono text-sm bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-[#202124] select-all"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCopyCredential(credentialModal.temporaryCredential)}
                    className="bg-[#202124] text-white text-xs px-3 py-2 rounded-xl"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {credentialModal.resetToken && (
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Direct Onboarding / Activation Link
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/login?token=${credentialModal.resetToken}`}
                    className="w-full font-mono text-[11px] bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-600 select-all"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => setCredentialModal({ ...credentialModal, open: false })}
                className="bg-[#202124] hover:bg-black text-white text-xs"
              >
                I Have Safely Saved This Credential
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ROLE CHANGE (MAX 2 ROLES ENFORCED) ================= */}
      {roleChangeModal.open && roleChangeModal.employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E2E4E9] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">
                Manage Staff Roles
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                roleChangeModal.secondaryRole && roleChangeModal.secondaryRole !== roleChangeModal.selectedRole
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {roleChangeModal.secondaryRole && roleChangeModal.secondaryRole !== roleChangeModal.selectedRole
                  ? '2 / 2 Roles (Max)'
                  : '1 / 2 Roles'}
              </span>
            </div>
            <p className="text-xs text-[#555B63]">
              Reassign permissions for <strong>{roleChangeModal.employee.name}</strong> ({roleChangeModal.employee.employeeId || 'Staff'}).
              An employee can have at most 2 roles at once.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#202124] block mb-1">
                  Primary Role <span className="text-[#EF4949]">*</span>
                </label>
                <select
                  value={roleChangeModal.selectedRole}
                  onChange={(e) => {
                    const newPrimary = e.target.value as UserRole;
                    setRoleChangeModal({
                      ...roleChangeModal,
                      selectedRole: newPrimary,
                      secondaryRole: roleChangeModal.secondaryRole === newPrimary ? '' : roleChangeModal.secondaryRole,
                    });
                  }}
                  className="w-full border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#EF4949]"
                >
                  <option value="admin">Platform Administrator</option>
                  <option value="support_admin">Support Administrator</option>
                  <option value="lead_generator">Lead Generator</option>
                  <option value="content_writer">Content Writer</option>
                  <option value="marketer">Marketing Specialist</option>
                  <option value="reviewer">Medical & NGO Trust Reviewer</option>
                  <option value="finance">Finance & Compliance Officer</option>
                  <option value="content_editor">Content & Editorial Lead</option>
                  <option value="head_staff">Head Staff (Field Lead)</option>
                  <option value="campaign_manager">Campaign Manager</option>
                  <option value="ops_admin">Operations Administrator</option>
                  <option value="support_staff">Support Staff</option>
                  <option value="super_admin">Super Administrator (Full Unconstrained Access)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202124] block mb-1">
                  Secondary Role <span className="text-neutral-400 font-normal">(Optional, Max 2 Total)</span>
                </label>
                <select
                  value={roleChangeModal.secondaryRole}
                  onChange={(e) => setRoleChangeModal({ ...roleChangeModal, secondaryRole: e.target.value as UserRole | '' })}
                  className="w-full border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#EF4949]"
                >
                  <option value="">None (Single Role Only)</option>
                  {[
                    { r: 'admin', label: 'Platform Administrator' },
                    { r: 'support_admin', label: 'Support Administrator' },
                    { r: 'lead_generator', label: 'Lead Generator' },
                    { r: 'content_writer', label: 'Content Writer' },
                    { r: 'marketer', label: 'Marketing Specialist' },
                    { r: 'reviewer', label: 'Medical & NGO Trust Reviewer' },
                    { r: 'finance', label: 'Finance & Compliance Officer' },
                    { r: 'content_editor', label: 'Content & Editorial Lead' },
                    { r: 'head_staff', label: 'Head Staff (Field Lead)' },
                    { r: 'campaign_manager', label: 'Campaign Manager' },
                    { r: 'ops_admin', label: 'Operations Administrator' },
                    { r: 'support_staff', label: 'Support Staff' },
                    { r: 'super_admin', label: 'Super Administrator' },
                  ]
                    .filter((item) => item.r !== roleChangeModal.selectedRole)
                    .map((item) => (
                      <option key={item.r} value={item.r}>
                        {item.label} (Secondary)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 leading-relaxed">
              Role changes take effect immediately on subsequent requests. An employee cannot hold more than 2 roles simultaneously.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleChangeModal({ open: false, employee: null, selectedRole: 'reviewer', secondaryRole: '' })}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRoleChange}
                className="bg-[#EF4949] hover:bg-[#D9363E] text-white text-xs font-bold"
              >
                Apply Role Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
