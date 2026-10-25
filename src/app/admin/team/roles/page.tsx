'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { RolePermission, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Sliders,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Save,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

const AVAILABLE_PERMISSIONS: { key: string; label: string; desc: string; category: string }[] = [
  // Campaign Operations & Publishing
  { key: 'view_campaigns', label: 'View Campaigns', desc: 'Browse and inspect platform fundraisers', category: 'Campaign Operations' },
  { key: 'create_campaign_drafts', label: 'Create Campaign Drafts', desc: 'Initiate new draft campaign proposals', category: 'Campaign Operations' },
  { key: 'edit_campaign_content', label: 'Edit Campaign Content', desc: 'Modify story narrative, titles, and budget items', category: 'Campaign Operations' },
  { key: 'upload_campaign_media', label: 'Upload Posters & Photos', desc: 'Upload main poster artwork, gallery, and proof media', category: 'Campaign Operations' },
  { key: 'add_campaign_updates', label: 'Add Campaign Updates', desc: 'Draft continuous field reports and milestone progress', category: 'Campaign Operations' },
  { key: 'submit_updates_review', label: 'Submit Updates for Review', desc: 'Send field reports to senior reviewer queue', category: 'Campaign Operations' },
  { key: 'approve_campaign_content', label: 'Approve Campaign Content', desc: 'Authorize campaign approvals and verify story accuracy', category: 'Campaign Operations' },
  { key: 'publish_campaigns', label: 'Publish Campaigns', desc: 'Set fundraisers live to accept public donations', category: 'Campaign Operations' },
  { key: 'pause_resume_donations', label: 'Pause / Resume Donations', desc: 'Temporarily freeze or reactivate donation intake', category: 'Campaign Operations' },
  { key: 'complete_archive_campaigns', label: 'Complete / Archive Campaigns', desc: 'Conclude fundraisers or move to long-term storage', category: 'Campaign Operations' },
  { key: 'view_campaign_analytics', label: 'View Campaign Analytics', desc: 'Inspect donor retention, velocity, and conversion', category: 'Campaign Operations' },
  { key: 'manage_item_requirements', label: 'Item Donation Management', desc: 'Configure wholesale item targets and physical pledges', category: 'Campaign Operations' },

  // Financial Controls & Ledger
  { key: 'view_financial_reports', label: 'View Financial Reports', desc: 'Access net proceeds, ledger totals, and tip revenue', category: 'Financial Controls' },
  { key: 'reconcile_financial_records', label: 'Reconcile Offline Records', desc: 'Match bank wires, UTR numbers, and cash donations', category: 'Financial Controls' },
  { key: 'process_refunds', label: 'Process Refunds', desc: 'Authorize and execute donor donation refunds', category: 'Financial Controls' },
  { key: 'export_reports', label: 'Export Permitted Reports', desc: 'Download CSV and Excel financial data', category: 'Financial Controls' },
  { key: 'manage_gateways', label: 'Payment Gateway Setup', desc: 'Configure Razorpay API credentials and webhooks', category: 'Financial Controls' },

  // Content & Communications
  { key: 'manage_pages_faqs', label: 'Manage Pages & FAQs', desc: 'Edit static information pages and FAQ catalogs', category: 'CMS & Communications' },
  { key: 'upload_shared_media', label: 'Upload Shared Media', desc: 'Add visual assets to central media library', category: 'CMS & Communications' },
  { key: 'manage_newsletters', label: 'Manage Newsletters', desc: 'Compose donor broadcasts and impact updates', category: 'CMS & Communications' },
  { key: 'manage_website_builder', label: 'Visual Website Builder', desc: 'Edit home page sections and layout components', category: 'CMS & Communications' },
  { key: 'manage_theme', label: 'Theme & Appearance', desc: 'Update colors, brand logos, and visual styles', category: 'CMS & Communications' },

  // Trust, Verification & Support
  { key: 'review_documents', label: 'Medical Document Review', desc: 'Inspect hospital estimates and doctor certificates', category: 'Trust & Safety' },
  { key: 'verify_organizations', label: 'NGO Darpan Verification', desc: 'Audit 80G validity and NGO Darpan filings', category: 'Trust & Safety' },
  { key: 'view_support_records', label: 'Support Desk Access', desc: 'Handle donor queries and ticket escalations', category: 'Trust & Safety' },

  // Governance & Administration
  { key: 'manage_team', label: 'Superior Team Management', desc: 'Provision employees, reset credentials, assign roles', category: 'Governance' },
  { key: 'manage_roles_permissions', label: 'Role & Capability Matrix', desc: 'Configure fine-grained permissions per user role', category: 'Governance' },
  { key: 'manage_settings', label: 'Platform Settings Vault', desc: 'Configure system backups, maintenance, and API secrets', category: 'Governance' },
  { key: 'view_audit_logs', label: 'Audit Trail Access', desc: 'Inspect immutable administrative and financial logs', category: 'Governance' },
];

export default function RoleCapabilitiesPage() {
  const { user: currentUser } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(() => db.getRolePermissions());
  const [selectedRole, setSelectedRole] = useState<UserRole>('reviewer');
  const [toastMessage, setToastMessage] = useState('');

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
            Only authorized platform Administrators have authority to configure role capability matrices and platform permissions.
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

  const activeRP = rolePermissions.find((r) => r.role === selectedRole);
  const activePerms = activeRP ? activeRP.permissions : [];

  const handleTogglePermission = (permKey: string) => {
    if (!activeRP) return;
    if (selectedRole === 'super_admin' && (permKey === 'manage_team' || permKey === 'manage_settings')) {
      alert('Super Administrator must retain team and settings management capabilities.');
      return;
    }

    const currentSet = new Set(activePerms);
    if (currentSet.has(permKey)) {
      currentSet.delete(permKey);
    } else {
      currentSet.add(permKey);
    }

    const updatedList = Array.from(currentSet);
    const updated = db.updateRolePermissions(
      selectedRole,
      updatedList,
      currentUser?.name || 'Chief Administrator'
    );

    if (updated) {
      setRolePermissions([...db.getRolePermissions()]);
      setToastMessage(`Updated permissions for "${activeRP.name}".`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#202124] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team Management</span>
        </Link>
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

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E4E9] shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#EF4949]/10 text-[#EF4949]">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Access Control Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Role Capability Matrix (RBAC)
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Configure granular server-side permissions for each employee role. Changes take effect across all matching staff members immediately.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-b border-[#E2E4E9] pb-4">
          {rolePermissions.map((rp) => {
            const isSelected = selectedRole === rp.role;
            return (
              <button
                key={rp.role}
                type="button"
                onClick={() => setSelectedRole(rp.role)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#202124] text-white shadow-xs'
                    : 'bg-[#FAF9F6] text-neutral-600 hover:bg-neutral-100 border border-[#E2E4E9]'
                }`}
              >
                <span>{rp.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {rp.permissions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Overview */}
        {activeRP && (
          <div className="p-4 bg-[#FAF9F6] border border-[#E2E4E9] rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#202124]">{activeRP.name}</h2>
              <span className="font-mono text-[11px] text-[#EF4949] font-bold uppercase">
                {activeRP.role}
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">{activeRP.description}</p>
          </div>
        )}

        {/* Permissions Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Available Platform Capabilities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const hasPerm = activePerms.includes(perm.key);
              const isLockedSuperAdmin = selectedRole === 'super_admin' && (perm.key === 'manage_team' || perm.key === 'manage_settings');

              return (
                <div
                  key={perm.key}
                  onClick={() => !isLockedSuperAdmin && handleTogglePermission(perm.key)}
                  className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    isLockedSuperAdmin
                      ? 'border-neutral-200 bg-neutral-50/70 cursor-not-allowed opacity-80'
                      : 'cursor-pointer hover:border-neutral-400'
                  } ${
                    hasPerm
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-white border-[#E2E4E9]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#202124]">{perm.label}</span>
                      {isLockedSuperAdmin && (
                        <span title="Mandatory Super Admin capability">
                          <Lock className="w-3 h-3 text-neutral-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">{perm.desc}</p>
                    <code className="text-[10px] text-neutral-400 font-mono block pt-0.5">{perm.key}</code>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                    hasPerm ? 'bg-emerald-600 text-white' : 'border border-neutral-300 bg-white'
                  }`}>
                    {hasPerm && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
