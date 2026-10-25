'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { SiteSettings } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  Shield,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
  Server,
  Database,
  Activity,
  Tag,
} from 'lucide-react';

export default function PlatformSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(() => db.getSiteSettings());
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (mounted && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => {
        console.warn('Fallback to local site settings:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSettings(data.settings);
      notify(data.message || 'General platform settings and security preferences saved.');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving platform settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = db.exportDatabaseSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sevasetu_full_backup_snapshot_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify('Full platform database snapshot downloaded as encrypted JSON.');
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    const success = db.importDatabaseSnapshot(importJson, user?.name || 'Super Admin');
    if (success) {
      setSettings(db.getSiteSettings());
      setShowRestoreModal(false);
      setImportJson('');
      notify('Platform state successfully restored from snapshot!');
    } else {
      alert('Invalid JSON snapshot structure.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Settings className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">System Infrastructure</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Platform Settings, Security & System Backups
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Configure contact coordinates, maintenance mode, security allowlists, and take zero-downtime database snapshots.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/settings/badge-styles">
            <Button size="sm" variant="outline" className="text-xs text-[#EF4949] border-[#EF4949]/30 hover:bg-[#FFF0EF]">
              <Tag className="w-3.5 h-3.5 mr-1" />
              Badge & Tag Styles
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={handleExportBackup} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1" />
            Download DB Snapshot
          </Button>
          <Button size="sm" onClick={() => setShowRestoreModal(true)} className="bg-[#202124] hover:bg-black text-white text-xs">
            <Upload className="w-3.5 h-3.5 mr-1" />
            Restore from Backup
          </Button>
        </div>
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

      {/* Error notice */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')}>✕</button>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* General Platform Coordinates (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#202124] pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#E84B45]" />
              <span>General Platform Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Platform Brand Name *</label>
                <input
                  type="text"
                  required
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Official Support Phone *</label>
                <input
                  type="text"
                  required
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Official Support Email *</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Public Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Physical Office Address</label>
              <textarea
                rows={2}
                value={settings.supportAddress}
                onChange={(e) => setSettings({ ...settings, supportAddress: e.target.value })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                NITI Aayog NGO-Darpan Portal Accreditation Text
              </label>
              <input
                type="text"
                value={settings.darpanPortalRef || ''}
                onChange={(e) => setSettings({ ...settings, darpanPortalRef: e.target.value })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>
          </div>

          {/* Security, Maintenance & Limits (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#202124] pb-3 border-b border-neutral-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Security & Maintenance Controls</span>
              </h3>

              {/* Maintenance Mode Toggle */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-amber-900">Maintenance Mode</span>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>
                <p className="text-[11px] text-amber-700">
                  When enabled, visitors see a polite maintenance notice while administrative tools remain accessible.
                </p>
                {settings.maintenanceMode && (
                  <input
                    type="text"
                    value={settings.maintenanceMessage || ''}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1 text-xs text-amber-900"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Minimum Donation Permitted (INR)
                </label>
                <input
                  type="number"
                  value={settings.minimumDonationINR}
                  onChange={(e) => setSettings({ ...settings, minimumDonationINR: Number(e.target.value) || 50 })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              {/* Master Prompt 8: Donation Accounting & Platform Fee Settings */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Platform Fee & Contribution Rules</span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.platformFeeEnabled !== false}
                      onChange={(e) => setSettings({ ...settings, platformFeeEnabled: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-emerald-900">Fee Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-0.5">
                      Default Platform Fee (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      value={settings.defaultPlatformFeePercent ?? 5}
                      onChange={(e) => setSettings({ ...settings, defaultPlatformFeePercent: Number(e.target.value) || 0 })}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Deducted from campaign gross (default 5%)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-0.5">
                      Dokind Extra Support Options
                    </label>
                    <input
                      type="text"
                      value={(settings.dokindFoundationContributionOptions || [0, 1, 2, 3, 5]).join(', ')}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map((v) => Number(v.trim())).filter((v) => !isNaN(v));
                        setSettings({ ...settings, dokindFoundationContributionOptions: arr });
                      }}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Comma-separated % (e.g. 0, 1, 2, 3, 5)</span>
                  </div>
                </div>
              </div>

              {/* Master Prompt 10: Live Ticker & Trust Strip Configuration (DonateKart Inspired) */}
              <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#E84B45]" />
                    <span>Live Donation & Trust Ticker (DonateKart Style)</span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.liveTickerEnabled !== false}
                      onChange={(e) => setSettings({ ...settings, liveTickerEnabled: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-[#E84B45] focus:ring-[#E84B45]"
                    />
                    <span className="text-[11px] font-semibold text-rose-900">Ticker Active</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-900 mb-0.5">
                    Display Mode
                  </label>
                  <select
                    value={settings.tickerMode || 'live_donations'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        tickerMode: e.target.value as 'live_donations' | 'trust_messages' | 'hybrid',
                      })
                    }
                    className="w-full bg-white border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-800"
                  >
                    <option value="live_donations">Mode 1: Verified Live Donations Only</option>
                    <option value="trust_messages">Mode 2: Platform Trust & Assurance Statements</option>
                    <option value="hybrid">Mode 3: Hybrid (Interleaved Donations & Trust Statements)</option>
                  </select>
                  <span className="text-[10px] text-rose-700 block mt-0.5">
                    Controls what scrolls across the full-width strip under the hero carousel.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-900 mb-0.5">
                    Platform Trust Statements (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(
                      settings.trustMessages || [
                        '100% Tax Deductible under Section 80G with Instant Receipts',
                        'Direct Hospital & Verified NGO Escrow Disbursements',
                        'Zero Platform Fee On Emergency Pediatric & Cancer Surgeries',
                        'Wholesale Item Giving With Zero Markup & Live Tracking',
                        'NITI Aayog NGO-Darpan Verified Grassroots Partners',
                      ]
                    ).join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean);
                      setSettings({ ...settings, trustMessages: lines });
                    }}
                    className="w-full bg-white border border-rose-300 rounded-lg p-2 text-xs font-sans text-neutral-800"
                    placeholder="Enter verifiable statements..."
                  />
                  <span className="text-[10px] text-rose-700 block mt-0.5">
                    Displayed with dokind brand mark separators across the strip.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Admin Session Inactivity Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeoutMinutes || 60}
                  onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) || 60 })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <Button type="submit" size="sm" disabled={isSaving} className="w-full bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {isSaving ? 'Saving Changes...' : 'Save System Settings'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Restore Snapshot Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleRestoreSubmit}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-neutral-700" />
                <h3 className="font-bold text-base text-[#202124]">Restore Platform From JSON Snapshot</h3>
              </div>
              <button type="button" onClick={() => setShowRestoreModal(false)} className="text-neutral-400 hover:text-neutral-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Paste the exported JSON backup snapshot. This will safely restore campaigns, pages, themes, gateways, and transactions in memory:
            </p>

            <textarea
              rows={10}
              required
              placeholder='{"timestamp": "2026-...", "version": "2.0.0", "campaigns": [...]}'
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowRestoreModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Execute Restore
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
