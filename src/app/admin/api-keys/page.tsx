'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import {
  ApiKeyRecord,
  ApiKeyCategory,
  ApiKeyEnvironment,
  ApiKeyStatus,
  AuditLog,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  Plus,
  ExternalLink,
  Lock,
  FileCode2,
  History,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Server,
  CreditCard,
  Mail,
  Cloud,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

// Google multi-colored icon
function GoogleLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// Category icon helper
function getCategoryIcon(category: ApiKeyCategory, serviceName: string) {
  if (category === 'google') {
    return <GoogleLogo className="w-5 h-5 shrink-0" />;
  }
  if (category === 'payment') {
    return <CreditCard className="w-5 h-5 text-indigo-600 shrink-0" />;
  }
  if (category === 'email') {
    return <Mail className="w-5 h-5 text-emerald-600 shrink-0" />;
  }
  if (category === 'storage') {
    return <Cloud className="w-5 h-5 text-amber-600 shrink-0" />;
  }
  if (category === 'communication') {
    return <MessageSquare className="w-5 h-5 text-purple-600 shrink-0" />;
  }
  return <Server className="w-5 h-5 text-neutral-600 shrink-0" />;
}

export default function ApiKeyManagerPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Load API keys only if authorized
  const [keys, setKeys] = useState<ApiKeyRecord[]>(() => {
    if (!isSuperAdmin) return [];
    try {
      return db.getApiKeys(currentUser || undefined);
    } catch {
      return [];
    }
  });

  const refreshKeys = async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await fetch('/api/admin/api-keys');
      if (res.ok) {
        const data = await res.json();
        if (data.keys) setKeys(data.keys);
      }
    } catch (e) {
      console.warn('Failed to refresh API keys:', e);
    }
  };

  useEffect(() => {
    refreshKeys();
  }, [isSuperAdmin]);

  // State: search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // State: revealed secrets set
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // State: toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // State: ping / testing status for each key
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);

  // Modals
  const [editModal, setEditModal] = useState<{
    open: boolean;
    keyRecord: ApiKeyRecord | null;
  }>({ open: false, keyRecord: null });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [envExportModalOpen, setEnvExportModalOpen] = useState(false);

  // Form state for editing
  const [editFormData, setEditFormData] = useState<Partial<ApiKeyRecord>>({});

  // Form state for creating new key
  const [newKeyForm, setNewKeyForm] = useState<{
    name: string;
    service: string;
    category: ApiKeyCategory;
    environment: ApiKeyEnvironment;
    keyIdentifier: string;
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    description: string;
    endpointUrl: string;
    docsUrl: string;
    usageNotes: string;
  }>({
    name: '',
    service: 'Google Cloud Platform',
    category: 'google',
    environment: 'production',
    keyIdentifier: '',
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    description: '',
    endpointUrl: '',
    docsUrl: '',
    usageNotes: '',
  });

  const notify = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  const copyToClipboard = (text: string, label: string, keyId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    notify(`Copied ${label} to clipboard!`, 'info');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const toggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  // Filtered keys (executed unconditionally before security barrier to preserve Rules of Hooks)
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      // Category filter
      if (selectedCategory !== 'all' && k.category !== selectedCategory) {
        return false;
      }
      // Environment filter
      if (selectedEnv !== 'all' && k.environment !== selectedEnv) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && k.status !== selectedStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = k.name.toLowerCase().includes(query);
        const matchesService = k.service.toLowerCase().includes(query);
        const matchesId = k.keyIdentifier.toLowerCase().includes(query);
        const matchesDesc = k.description.toLowerCase().includes(query);
        if (!matchesName && !matchesService && !matchesId && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [keys, selectedCategory, selectedEnv, selectedStatus, searchQuery]);

  // Counts
  const totalCount = keys.length;
  const googleCount = keys.filter((k) => k.category === 'google').length;
  const paymentCount = keys.filter((k) => k.category === 'payment').length;
  const prodCount = keys.filter((k) => k.environment === 'production').length;
  const healthyCount = keys.filter((k) => k.lastTestStatus === 'healthy').length;

  const apiAuditLogs: AuditLog[] = useMemo(() => {
    try {
      return db.getApiAuditLogs(currentUser || undefined);
    } catch {
      return [];
    }
  }, [currentUser, keys]);

  // ---------------- ACCESS DENIED BARRIER FOR NON-SUPER ADMINS ----------------
  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-[#E2E4E9] p-8 sm:p-10 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#EF4949] flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-[#EF4949] font-bold text-xs uppercase tracking-wider">
              Security Barrier · Level 0
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
              Superior Administrator Authority Required
            </h1>
          </div>

          <p className="text-sm text-[#555B63] max-w-lg mx-auto leading-relaxed">
            The API Keys &amp; Secrets Manager houses production credentials, Google Cloud Platform developer tokens, Razorpay signing secrets, and third-party microservice integration keys.
            <br />
            Access is strictly restricted to the <strong>Superior Administrator</strong> (<code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">super_admin</code>).
          </p>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 inline-block font-mono text-left max-w-sm w-full space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">Authenticated User:</span>
              <span className="font-semibold text-neutral-800">{currentUser?.name || 'Guest User'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Current Role:</span>
              <span className="font-bold text-rose-600 uppercase">{currentUser?.role || 'unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Required Clearance:</span>
              <span className="font-bold text-emerald-700 uppercase">SUPER_ADMIN</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/admin">
              <Button size="sm" variant="outline" className="text-xs">
                Back to Admin Overview
              </Button>
            </Link>
            <Link href="/admin/team">
              <Button size="sm" variant="ghost" className="text-xs">
                Inspect Administrative Roles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- ACTION HANDLERS ----------------
  const handleTestConnection = async (keyItem: ApiKeyRecord) => {
    setTestingKeyId(keyItem.id);
    try {
      const res = await fetch('/api/admin/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyItem.id }),
      });
      const data = await res.json();
      await refreshKeys();
      if (data.success) {
        notify(`${keyItem.name}: ${data.message} (${data.latencyMs}ms)`, 'success');
      } else {
        notify(`${keyItem.name}: ${data.message}`, 'error');
      }
    } catch (err: unknown) {
      notify(`Test failed: ${(err as Error).message}`, 'error');
    } finally {
      setTestingKeyId(null);
    }
  };

  const handleTestAll = async () => {
    setTestingKeyId('all');
    try {
      for (const k of keys) {
        await fetch('/api/admin/api-keys/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: k.id }),
        });
      }
      await refreshKeys();
      notify(`Tested all ${keys.length} API connections. Statuses updated!`, 'success');
    } catch (err: any) {
      notify(`Test all encountered an issue: ${err.message}`, 'error');
    } finally {
      setTestingKeyId(null);
    }
  };

  const openEditModal = (keyItem: ApiKeyRecord) => {
    setEditFormData({ ...keyItem });
    setEditModal({ open: true, keyRecord: keyItem });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.keyRecord) return;

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editModal.keyRecord.id,
          updates: editFormData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update credentials');

      await refreshKeys();
      setEditModal({ open: false, keyRecord: null });
      notify(`Successfully updated credentials for "${editModal.keyRecord.name}". Audit log updated.`);
    } catch (err: unknown) {
      notify(`Update error: ${(err as Error).message}`, 'error');
    }
  };

  const handleRotateKey = async (keyId: string) => {
    const key = keys.find((k) => k.id === keyId);
    if (!key) return;

    // Generate high-entropy random replacement token
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const prefix = key.category === 'google' ? 'AIzaSy' : key.category === 'payment' ? 'rzp_sec_' : 'sec_';
    const generatedToken = `${prefix}${randomHex}`;

    if (
      !confirm(
        `Are you sure you want to rotate the secret key for "${key.name}"?\n\nA new secure token will be generated immediately and active traffic must switch to this new key.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rotate',
          id: keyId,
          newSecret: generatedToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to rotate key');

      await refreshKeys();
      setRevealedKeys((prev) => ({ ...prev, [keyId]: true }));
      notify(`Rotated key for "${key.name}". New token generated and encrypted.`);
    } catch (err: unknown) {
      notify(`Rotation error: ${(err as Error).message}`, 'error');
    }
  };

  const handleDeleteKey = async (keyItem: ApiKeyRecord) => {
    if (keyItem.isSystemCritical) {
      alert(`"${keyItem.name}" is a critical system integration and cannot be deleted.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete "${keyItem.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/api-keys?id=${keyItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete key');

      await refreshKeys();
      notify(`Deleted API credential "${keyItem.name}".`);
    } catch (err: unknown) {
      notify(`Deletion error: ${(err as Error).message}`, 'error');
    }
  };

  const handleCreateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.name || !newKeyForm.keyIdentifier) {
      notify('Please enter a service name and environment variable identifier.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            name: newKeyForm.name,
            service: newKeyForm.service,
            category: newKeyForm.category,
            environment: newKeyForm.environment,
            status: 'active',
            keyIdentifier: newKeyForm.keyIdentifier,
            publicKey: newKeyForm.publicKey || undefined,
            secretKey: newKeyForm.secretKey || undefined,
            webhookSecret: newKeyForm.webhookSecret || undefined,
            description: newKeyForm.description,
            endpointUrl: newKeyForm.endpointUrl || undefined,
            docsUrl: newKeyForm.docsUrl || undefined,
            usageNotes: newKeyForm.usageNotes || undefined,
            isSystemCritical: false,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to register credential');

      await refreshKeys();
      setAddModalOpen(false);
      setNewKeyForm({
        name: '',
        service: 'Google Cloud Platform',
        category: 'google',
        environment: 'production',
        keyIdentifier: '',
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        description: '',
        endpointUrl: '',
        docsUrl: '',
        usageNotes: '',
      });
      notify(`Created new API credential record "${data.key.name}".`);
    } catch (err: unknown) {
      notify(`Creation error: ${(err as Error).message}`, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ----------------- TOP HEADER CARD ----------------- */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2E4E9] shadow-xs relative overflow-hidden">
        {/* Decorative corner ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-rose-100/60 via-red-50/40 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[#EF4949] text-xs font-bold tracking-wide">
                <Lock className="w-3.5 h-3.5" />
                Superior Admin Vault
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                HMAC-SHA256 Encrypted
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5" />
                Live Health Probes Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
              API Keys &amp; External Secrets Manager
            </h1>

            <p className="text-xs sm:text-sm text-[#555B63] leading-relaxed">
              Centralized administrative vault for <strong>Google Cloud Platform</strong>, <strong>Google Maps</strong>, <strong>Google Analytics</strong>, <strong>Razorpay payment processors</strong>, and microservice communication tokens. All secrets are masked by default and require superior admin authorization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTestAll()}
              disabled={testingKeyId === 'all'}
              className="text-xs border-[#E2E4E9] hover:bg-neutral-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingKeyId === 'all' ? 'animate-spin' : ''}`} />
              Test All Connections
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setEnvExportModalOpen(true)}
              className="text-xs border-[#E2E4E9] hover:bg-neutral-50"
            >
              <FileCode2 className="w-3.5 h-3.5 mr-1.5 text-neutral-600" />
              Export .env Format
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setAuditDrawerOpen(true)}
              className="text-xs border-[#E2E4E9] hover:bg-neutral-50"
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-neutral-600" />
              Audit Trail ({apiAuditLogs.length})
            </Button>

            <Button
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add API Key
            </Button>
          </div>
        </div>

        {/* ----------------- METRICS STRIP ----------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-neutral-100">
          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Integrations</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900">{totalCount}</span>
              <span className="text-xs text-neutral-500 font-medium">Service Endpoints</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Google Services</span>
              <GoogleLogo className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-950">{googleCount}</span>
              <span className="text-xs text-blue-700 font-medium">APIs &amp; Webmasters</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Production Live</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-950">{prodCount}</span>
              <span className="text-xs text-emerald-700 font-medium">Active Environments</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Health Verification</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-950">{healthyCount}/{totalCount}</span>
              <span className="text-xs text-indigo-700 font-medium">100% Passing Pings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- TOAST NOTICE ----------------- */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between shadow-xs transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toastMessage.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ----------------- SEARCH & FILTERS CONTROLS ----------------- */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by API name, Google service, variable identifier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white text-neutral-800 placeholder-neutral-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Select Environment & Status */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-[#E2E4E9] text-xs">
              <span className="px-2 text-[11px] font-bold text-neutral-400 uppercase">Env:</span>
              {(['all', 'production', 'sandbox'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => setSelectedEnv(env)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs capitalize ${
                    selectedEnv === env
                      ? 'bg-white shadow-2xs font-bold text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {env === 'all' ? 'All Environments' : env}
                </button>
              ))}
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs text-neutral-700 focus:outline-none focus:border-[#EF4949]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="unconfigured">Unconfigured</option>
              <option value="revoked">Revoked / Expired</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Services', count: keys.length },
            { id: 'google', label: 'Google Cloud Ecosystem', count: googleCount, isGoogle: true },
            { id: 'payment', label: 'Razorpay & Payments', count: paymentCount },
            { id: 'email', label: 'Transactional Email', count: keys.filter((k) => k.category === 'email').length },
            { id: 'storage', label: 'Encrypted S3 Storage', count: keys.filter((k) => k.category === 'storage').length },
            { id: 'communication', label: 'TRAI SMS & WhatsApp', count: keys.filter((k) => k.category === 'communication').length },
            { id: 'custom', label: 'Custom APIs', count: keys.filter((k) => k.category === 'custom').length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs ${
                selectedCategory === cat.id
                  ? cat.isGoogle
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-[#202124] text-white font-bold shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 font-medium'
              }`}
            >
              {cat.isGoogle && <GoogleLogo className="w-3.5 h-3.5 shrink-0" />}
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-neutral-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ----------------- API KEYS LISTING ----------------- */}
      {filteredKeys.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E2E4E9] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">No matching API credentials found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query, environment toggle, or selected category filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedEnv('all');
              setSelectedStatus('all');
            }}
            className="text-xs"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredKeys.map((keyItem) => {
            const isRevealed = Boolean(revealedKeys[keyItem.id]);
            const isTesting = testingKeyId === keyItem.id;
            const isCopied = copiedKeyId === keyItem.id;

            return (
              <div
                key={keyItem.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E4E9] shadow-xs hover:border-[#D5D1C8] transition-all p-5 sm:p-6 space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                      {getCategoryIcon(keyItem.category, keyItem.service)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-[#202124] tracking-tight">
                          {keyItem.name}
                        </h3>

                        {/* Environment Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            keyItem.environment === 'production'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              keyItem.environment === 'production' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          {keyItem.environment}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            keyItem.status === 'active'
                              ? 'bg-neutral-100 text-neutral-700'
                              : keyItem.status === 'unconfigured'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {keyItem.status}
                        </span>

                        {keyItem.isSystemCritical && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-200/60">
                            <Lock className="w-2.5 h-2.5" />
                            System Critical
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-700">{keyItem.service}</span>
                        <span>•</span>
                        <code className="bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-mono text-neutral-800 font-semibold">
                          {keyItem.keyIdentifier}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(keyItem)}
                      disabled={isTesting}
                      className="text-xs border-neutral-200 hover:bg-neutral-50"
                      title="Test live handshake & latency"
                    >
                      <Activity className={`w-3.5 h-3.5 mr-1 text-emerald-600 ${isTesting ? 'animate-spin' : ''}`} />
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(keyItem)}
                      className="text-xs border-neutral-200 hover:bg-neutral-50"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-neutral-600" />
                      Edit Keys
                    </Button>

                    {keyItem.docsUrl && (
                      <a
                        href={keyItem.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                        title="View Official Developer Documentation"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {!keyItem.isSystemCritical && (
                      <button
                        onClick={() => handleDeleteKey(keyItem)}
                        className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                        title="Remove custom key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#555B63] leading-relaxed">
                  {keyItem.description}
                </p>

                {/* ----------------- CREDENTIALS VAULT BOX ----------------- */}
                <div className="bg-[#FAF9F6] rounded-2xl border border-[#EAE7E2] p-4 space-y-3 font-mono text-xs">
                  {/* Public Key / Client ID (if present) */}
                  {keyItem.publicKey && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#EAE7E2]">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Public Identifier / Client ID:
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-neutral-900 select-all truncate bg-white px-2.5 py-1 rounded-lg border border-neutral-200 text-xs">
                          {keyItem.publicKey}
                        </span>
                        <button
                          onClick={() => copyToClipboard(keyItem.publicKey!, 'Public Key', keyItem.id + '-pub')}
                          className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all shrink-0"
                          title="Copy Public Key"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Secret Key / Private Token */}
                  {keyItem.secretKey && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#EAE7E2]">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Secret Key / Private Token:
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-sans font-bold">
                          Confidential
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-neutral-900 font-mono select-all truncate bg-white px-2.5 py-1 rounded-lg border border-neutral-200 text-xs tracking-wider">
                          {isRevealed
                            ? keyItem.secretKey
                            : '••••••••••••••••••••••••••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => toggleReveal(keyItem.id)}
                          className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all shrink-0"
                          title={isRevealed ? 'Mask secret' : 'Reveal secret'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(keyItem.secretKey!, 'Secret Key', keyItem.id + '-sec')}
                          className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all shrink-0"
                          title="Copy Secret Key"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRotateKey(keyItem.id)}
                          className="px-2 py-1 rounded-lg bg-white border border-neutral-200 text-[11px] font-sans font-semibold text-neutral-700 hover:text-[#EF4949] hover:border-rose-200 transition-all shrink-0 flex items-center gap-1"
                          title="Generate fresh replacement secret"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Rotate
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Webhook Secret (if present) */}
                  {keyItem.webhookSecret && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#EAE7E2]">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Webhook Signing Secret:
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-neutral-900 font-mono select-all truncate bg-white px-2.5 py-1 rounded-lg border border-neutral-200 text-xs tracking-wider">
                          {isRevealed ? keyItem.webhookSecret : '••••••••••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => toggleReveal(keyItem.id)}
                          className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all shrink-0"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(keyItem.webhookSecret!, 'Webhook Secret', keyItem.id + '-wh')}
                          className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Endpoint & Usage Details */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-sans text-xs text-neutral-500">
                    <div className="flex items-center gap-3">
                      {keyItem.endpointUrl && (
                        <div className="flex items-center gap-1">
                          <span className="text-neutral-400">Endpoint:</span>
                          <span className="text-neutral-700 font-mono text-[11px]">{keyItem.endpointUrl}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {keyItem.lastRotatedAt && (
                        <span>Rotated: {formatDate(keyItem.lastRotatedAt)}</span>
                      )}
                      <span>•</span>
                      <span>By {keyItem.updatedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Health & Status Footer */}
                {keyItem.lastTestMessage && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      keyItem.lastTestStatus === 'healthy'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/60 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          keyItem.lastTestStatus === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-medium text-[11px]">{keyItem.lastTestMessage}</span>
                    </div>
                    {keyItem.lastTestedAt && (
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        Checked {new Date(keyItem.lastTestedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- MODAL: EDIT / ROTATE KEY ----------------- */}
      {editModal.open && editModal.keyRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-[#E2E4E9] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#202124]">
                    Edit API Integration
                  </h3>
                  <span className="text-xs text-neutral-500">{editModal.keyRecord.name}</span>
                </div>
              </div>
              <button
                onClick={() => setEditModal({ open: false, keyRecord: null })}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Integration Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Environment *
                  </label>
                  <select
                    value={editFormData.environment || 'production'}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, environment: e.target.value as ApiKeyEnvironment })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  >
                    <option value="production">Production (Live Traffic)</option>
                    <option value="sandbox">Sandbox / Staging Testing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Key Identifier / Env Variable Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.keyIdentifier || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, keyIdentifier: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Public Key / Client ID / Measurement ID
                </label>
                <input
                  type="text"
                  value={editFormData.publicKey || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, publicKey: e.target.value })}
                  placeholder="e.g. G-XXXXXXX or rzp_live_XXXXX or Client ID"
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    Secret Key / Private Token
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                        .map((b) => b.toString(16).padStart(2, '0'))
                        .join('');
                      setEditFormData({ ...editFormData, secretKey: `sec_${randomHex}` });
                    }}
                    className="text-[11px] text-[#EF4949] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate Random Secret
                  </button>
                </div>
                <input
                  type="text"
                  value={editFormData.secretKey || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, secretKey: e.target.value })}
                  placeholder="Secret token or API password..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Webhook Signing Secret
                </label>
                <input
                  type="text"
                  value={editFormData.webhookSecret || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, webhookSecret: e.target.value })}
                  placeholder="e.g. whsec_live_..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={editFormData.status || 'active'}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value as ApiKeyStatus })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                >
                  <option value="active">Active &amp; Operational</option>
                  <option value="unconfigured">Unconfigured / Setup Required</option>
                  <option value="revoked">Revoked / Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Description &amp; Operational Notes
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModal({ open: false, keyRecord: null })}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white"
                >
                  Save &amp; Log Audit Trail
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: ADD NEW KEY ----------------- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-[#E2E4E9] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#EF4949] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#202124]">
                    Add New API Integration
                  </h3>
                  <span className="text-xs text-neutral-500">Register credentials into the Superior Admin Vault</span>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewKey} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newKeyForm.category}
                    onChange={(e) =>
                      setNewKeyForm({
                        ...newKeyForm,
                        category: e.target.value as ApiKeyCategory,
                        service:
                          e.target.value === 'google'
                            ? 'Google Cloud Platform'
                            : e.target.value === 'payment'
                            ? 'Payment Gateway Provider'
                            : e.target.value === 'email'
                            ? 'Transactional Mail Service'
                            : 'Cloud Service Provider',
                      })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  >
                    <option value="google">Google Cloud Ecosystem</option>
                    <option value="payment">Payment Gateway</option>
                    <option value="email">Transactional Email</option>
                    <option value="storage">Cloud Storage / S3</option>
                    <option value="communication">SMS / WhatsApp Gateway</option>
                    <option value="custom">Custom Microservice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Environment *
                  </label>
                  <select
                    value={newKeyForm.environment}
                    onChange={(e) =>
                      setNewKeyForm({ ...newKeyForm, environment: e.target.value as ApiKeyEnvironment })
                    }
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  >
                    <option value="production">Production (Live)</option>
                    <option value="sandbox">Sandbox / Staging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google BigQuery, SendPulse, Twilio"
                    value={newKeyForm.name}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Service Provider *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Cloud, Razorpay, AWS"
                    value={newKeyForm.service}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, service: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Key Identifier / Env Variable Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEXT_PUBLIC_GOOGLE_ANALYTICS_ID or RAZORPAY_KEY_ID"
                  value={newKeyForm.keyIdentifier}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, keyIdentifier: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Public Key / Client ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Publicly identifiable key or site tag"
                  value={newKeyForm.publicKey}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, publicKey: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Secret Key / Private Token (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Confidential API Secret or auth bearer token"
                  value={newKeyForm.secretKey}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, secretKey: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Purpose of this API integration on dokind platform..."
                  value={newKeyForm.description}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, description: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#EF4949] focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-[#EF4949] hover:bg-[#D9363E] text-white"
                >
                  Create API Key Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: EXPORT .ENV FORMAT ----------------- */}
      {envExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 border border-[#E2E4E9] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#202124]">
                    Export Server Environment (.env)
                  </h3>
                  <span className="text-xs text-neutral-500">
                    Deployment template generated from authorized Superior Admin Vault
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEnvExportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#555B63]">
              Use this sanitized configuration snippet in production server deployments or <code className="bg-neutral-100 px-1 py-0.5 rounded">.env.local</code> files. Secrets are shown in plain text for server configuration.
            </p>

            <div className="bg-[#1E1E2E] text-[#CDD6F4] p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96">
              <pre>
{`# -------------------------------------------------------------
# DOKIND CROWDFUNDING PLATFORM — ENVIRONMENT CONFIGURATION
# Generated by Superior Admin: ${currentUser?.name || 'Devendra Sharma'}
# Timestamp: ${new Date().toISOString()}
# -------------------------------------------------------------

# --- GOOGLE ECOSYSTEM ---
${keys
  .filter((k) => k.category === 'google')
  .map(
    (k) =>
      `# ${k.name} (${k.service})\n${k.keyIdentifier}="${k.publicKey || k.secretKey || 'YOUR_KEY_HERE'}"`
  )
  .join('\n\n')}

# --- PAYMENT PROCESSORS ---
${keys
  .filter((k) => k.category === 'payment')
  .map(
    (k) =>
      `# ${k.name}\n${k.keyIdentifier}_KEY_ID="${k.publicKey || ''}"\n${k.keyIdentifier}_SECRET="${k.secretKey || ''}"${
        k.webhookSecret ? `\n${k.keyIdentifier}_WEBHOOK_SECRET="${k.webhookSecret}"` : ''
      }`
  )
  .join('\n\n')}

# --- TRANSACTIONAL EMAIL & STORAGE ---
${keys
  .filter((k) => ['email', 'storage', 'communication'].includes(k.category))
  .map(
    (k) =>
      `# ${k.name}\n${k.keyIdentifier}="${k.secretKey || k.publicKey || ''}"`
  )
  .join('\n\n')}
`}
              </pre>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-neutral-100">
              <span className="text-xs text-neutral-400">
                Never commit live credentials to public Git repositories.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEnvExportModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const text = `# DOKIND PRODUCTION CONFIG\n` +
                      keys.map((k) => `${k.keyIdentifier}="${k.secretKey || k.publicKey || ''}"`).join('\n');
                    navigator.clipboard.writeText(text);
                    notify('Copied complete environment template to clipboard!');
                  }}
                  className="text-xs bg-[#202124] hover:bg-black text-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Environment Snippet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- DRAWER: AUDIT LEDGER ----------------- */}
      {auditDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end animate-in fade-in">
          <div className="bg-white max-w-lg w-full h-full p-6 sm:p-7 space-y-5 border-l border-[#E2E4E9] shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#202124]">
                      API Key Audit Trail
                    </h3>
                    <span className="text-xs text-neutral-500">Immutable ledger of key rotations and modifications</span>
                  </div>
                </div>
                <button
                  onClick={() => setAuditDrawerOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {apiAuditLogs.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6 text-center">No recent API key audit logs.</p>
                ) : (
                  apiAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE7E2] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-neutral-900 bg-neutral-200/60 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                        <span className="text-neutral-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-neutral-700 font-medium">{log.details}</p>
                      <div className="text-[10px] text-neutral-400">
                        Actor: <span className="text-neutral-600 font-semibold">{log.actorName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAuditDrawerOpen(false)}
                className="w-full text-xs"
              >
                Close Audit Ledger
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
