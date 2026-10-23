'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { formatINR, formatINRCompact, formatDate, calculatePercentage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  SlidersHorizontal,
  Settings,
  Users,
  Building2,
  Heart,
  TrendingUp,
  FileText,
  AlertCircle,
  Lock,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'campaigns' | 'organizations' | 'donations' | 'settings' | 'audit'
  >('overview');

  const [campaignsList, setCampaignsList] = useState(db.getCampaigns());
  const [organizationsList, setOrganizationsList] = useState(db.getOrganizations());
  const [donationsList, setDonationsList] = useState(db.getDonations());
  const [auditLogsList, setAuditLogsList] = useState(db.getAuditLogs());
  const [siteSettings, setSiteSettings] = useState(db.getSiteSettings());

  const [actionNotice, setActionNotice] = useState('');

  const stats = db.getPlatformStats();

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // Campaign moderation actions
  const handleApproveCampaign = (campaignId: string) => {
    const updated = db.updateCampaign(
      campaignId,
      { status: 'active', verifiedStatus: 'verified' },
      user?.name || 'Admin'
    );
    if (updated) {
      setCampaignsList([...db.getCampaigns()]);
      setAuditLogsList([...db.getAuditLogs()]);
      notify(`Campaign "${updated.title}" approved and published live.`);
    }
  };

  const handleRejectCampaign = (campaignId: string) => {
    const reason = prompt('Please enter the reason for rejection (e.g. Unverifiable hospital bill):');
    if (reason) {
      const updated = db.updateCampaign(campaignId, { status: 'rejected' }, user?.name || 'Admin');
      if (updated) {
        setCampaignsList([...db.getCampaigns()]);
        setAuditLogsList([...db.getAuditLogs()]);
        notify(`Campaign rejected: ${reason}`);
      }
    }
  };

  const handleTogglePause = (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const updated = db.updateCampaign(campaignId, { status: newStatus as any }, user?.name || 'Admin');
    if (updated) {
      setCampaignsList([...db.getCampaigns()]);
      setAuditLogsList([...db.getAuditLogs()]);
      notify(`Campaign status updated to ${newStatus}.`);
    }
  };

  // Organization verification actions
  const handleVerifyOrg = (orgId: string, status: 'verified' | 'rejected') => {
    const res = db.updateOrganizationVerification(orgId, status, user?.name || 'Admin');
    if (res) {
      setOrganizationsList([...db.getOrganizations()]);
      setAuditLogsList([...db.getAuditLogs()]);
      notify(`Organization ${res.name} verification status set to ${status}.`);
    }
  };

  // Refund Action
  const handleProcessRefund = (donationId: string) => {
    const reason = prompt('Please state reason for refunding this donation:');
    if (reason) {
      try {
        const refunded = db.processRefund(donationId, reason, user?.name || 'Finance Admin');
        setDonationsList([...db.getDonations()]);
        setCampaignsList([...db.getCampaigns()]);
        setAuditLogsList([...db.getAuditLogs()]);
        notify(`Donation ${refunded.id} of ${formatINR(refunded.amount)} refunded. Campaign raised totals reversed.`);
      } catch (err: any) {
        alert(err.message || 'Refund failed');
      }
    }
  };

  // Settings update
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSiteSettings(siteSettings, user?.name || 'Admin');
    notify('Platform payment gateway & live ticker settings saved.');
  };

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Administration</span>
        </nav>

        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#202124] text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                Admin Console
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                Logged in: {user?.name} ({user?.role})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#202124] mt-1">
              Platform Governance & Compliance
            </h1>
          </div>

          <Link href="/campaigns">
            <Button variant="outline" size="sm">
              View Public Website
            </Button>
          </Link>
        </div>

        {/* Global Toast Notification */}
        {actionNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#25845B] rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-[#E8E6E1] bg-white rounded-2xl p-1.5 overflow-x-auto shadow-2xs gap-1">
          {[
            { id: 'overview', label: 'Platform Overview' },
            { id: 'campaigns', label: `Campaign Approval Queue (${campaignsList.length})` },
            { id: 'organizations', label: `NGO Verification (${organizationsList.length})` },
            { id: 'donations', label: `Transactions & Refunds (${donationsList.length})` },
            { id: 'settings', label: 'Gateway & Site Settings' },
            { id: 'audit', label: `Audit Log Ledger (${auditLogsList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#E84B45] text-white shadow-xs'
                  : 'text-[#555B63] hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
                <span className="text-xs text-[#555B63] font-semibold">Total Verified Donations</span>
                <div className="text-2xl font-black text-[#E84B45] mt-1">
                  {formatINR(stats.totalRaised)}
                </div>
                <span className="text-[11px] text-[#25845B] mt-1 block font-medium">
                  Across {stats.totalDonorsCount} transactions
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
                <span className="text-xs text-[#555B63] font-semibold">Active Campaigns</span>
                <div className="text-2xl font-black text-[#202124] mt-1">
                  {stats.activeCampaigns}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">Live on public website</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
                <span className="text-xs text-[#555B63] font-semibold">Verified Partner NGOs</span>
                <div className="text-2xl font-black text-[#25845B] mt-1">{stats.verifiedNGOs}</div>
                <span className="text-[11px] text-neutral-400 mt-1 block">With active Darpan IDs</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs">
                <span className="text-xs text-[#555B63] font-semibold">Monthly Donors</span>
                <div className="text-2xl font-black text-blue-600 mt-1">
                  {stats.activeRecurring} Active
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">Recurring UPI/Cards</span>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#202124]">Compliance Status</h3>
                <div className="space-y-2 text-xs text-[#555B63]">
                  <div className="flex items-center justify-between p-2.5 bg-[#FAF9F6] rounded-xl">
                    <span>Income Tax Section 80G Certificates:</span>
                    <span className="font-bold text-[#25845B]">Form 10BE Active</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FAF9F6] rounded-xl">
                    <span>Payment Gateway Integration:</span>
                    <span className="font-bold text-[#202124]">Razorpay 256-bit Encrypted</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FAF9F6] rounded-xl">
                    <span>Hospital Direct Wire Protocols:</span>
                    <span className="font-bold text-[#25845B]">Strict UHID Match Required</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E8E6E1] shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#202124]">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left font-semibold text-[#202124] cursor-pointer"
                  >
                    Review Submitted Campaigns &rarr;
                  </button>
                  <button
                    onClick={() => setActiveTab('organizations')}
                    className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left font-semibold text-[#202124] cursor-pointer"
                  >
                    Verify NGO Darpan IDs &rarr;
                  </button>
                  <button
                    onClick={() => setActiveTab('donations')}
                    className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left font-semibold text-[#202124] cursor-pointer"
                  >
                    Process Refund Request &rarr;
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#E8E6E1] rounded-xl text-left font-semibold text-[#202124] cursor-pointer"
                  >
                    Edit Payment Gateway Keys &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPAIGN APPROVAL QUEUE */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#202124]">
              Campaign Moderation & Approval Queue
            </h2>

            <div className="divide-y divide-[#E8E6E1] text-xs">
              {campaignsList.map((c) => {
                const pct = calculatePercentage(c.raisedAmount, c.goalAmount);
                return (
                  <div key={c.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-16 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              c.status === 'active'
                                ? 'bg-emerald-50 text-[#25845B] border border-emerald-200'
                                : c.status === 'submitted' || c.status === 'under_review'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="text-[11px] text-neutral-400 capitalize">
                            {c.category}
                          </span>
                          {c.hospitalName && (
                            <span className="text-[11px] text-blue-700 font-semibold">
                              • {c.hospitalName}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/campaigns/${c.slug}`}
                          className="font-bold text-sm text-[#202124] hover:text-[#E84B45] line-clamp-1"
                        >
                          {c.title}
                        </Link>

                        <div className="text-[11px] text-[#555B63]">
                          Beneficiary: <strong>{c.beneficiaryName}</strong> ({c.beneficiaryLocation}) • Target: {formatINR(c.goalAmount)} • Raised: {formatINR(c.raisedAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {c.status !== 'active' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveCampaign(c.id)}
                          className="font-bold text-xs"
                        >
                          ✓ Approve & Launch
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePause(c.id, c.status)}
                        className="text-xs"
                      >
                        {c.status === 'active' ? 'Pause Campaign' : 'Resume'}
                      </Button>

                      {c.status !== 'rejected' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectCampaign(c.id)}
                          className="text-xs"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ORGANIZATIONS */}
        {activeTab === 'organizations' && (
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#202124]">
              Non-Profit Partner Verification Queue
            </h2>

            <div className="divide-y divide-[#E8E6E1] text-xs">
              {organizationsList.map((org) => (
                <div key={org.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            org.verificationStatus === 'verified'
                              ? 'bg-emerald-50 text-[#25845B] border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {org.verificationStatus}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-500">
                          PAN: {org.panNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#202124]">{org.name}</h4>
                      <div className="text-[11px] text-[#555B63] space-x-2">
                        <span>Darpan: {org.darpanId}</span>
                        <span>• 80G: {org.reg80G || 'Pending'}</span>
                        <span>• {org.city}, {org.state}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {org.verificationStatus !== 'verified' ? (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleVerifyOrg(org.id, 'verified')}
                      >
                        ✓ Verify 80G Partner
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyOrg(org.id, 'rejected')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Revoke Verification
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DONATIONS & REFUNDS */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#202124]">
              Financial Ledger & Refund Management
            </h2>
            <p className="text-xs text-[#555B63]">
              Every donation reflects genuine database ledger state. Refunding a transaction automatically reverses campaign raised amounts.
            </p>

            <div className="divide-y divide-[#E8E6E1] text-xs">
              {donationsList.map((d) => (
                <div key={d.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#202124]">{formatINR(d.amount)}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          d.status === 'succeeded'
                            ? 'bg-emerald-50 text-[#25845B] border border-emerald-200'
                            : d.status === 'refunded'
                            ? 'bg-neutral-100 text-neutral-500 line-through'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {d.status}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {d.receiptNumber}
                      </span>
                    </div>
                    <div className="text-xs text-[#555B63]">
                      Donor: <strong>{d.donorName}</strong> ({d.donorEmail}) • {formatDate(d.createdAt)}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Campaign: {d.campaignTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/account/donations/${d.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Receipt
                      </Button>
                    </Link>

                    {d.status === 'succeeded' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleProcessRefund(d.id)}
                        className="text-xs"
                      >
                        Refund & Reverse
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GATEWAY & SITE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-[#202124]">Payment Gateway & Ticker Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  value={siteSettings.razorpayKeyId}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, razorpayKeyId: e.target.value })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Contact Support Email
                </label>
                <input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, contactEmail: e.target.value })
                  }
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={siteSettings.liveTickerEnabled}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, liveTickerEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-[#E84B45] rounded"
                />
                <span className="font-semibold text-[#202124]">
                  Enable Live Donation Ticker Bar across all pages
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={siteSettings.isTestMode}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, isTestMode: e.target.checked })
                  }
                  className="w-4 h-4 text-[#E84B45] rounded"
                />
                <span className="font-semibold text-[#202124]">
                  Enable Test Simulation Mode (allows instant simulated checkout without real bank debits)
                </span>
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" className="font-bold">
                Save Platform Settings
              </Button>
            </div>
          </form>
        )}

        {/* TAB 6: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#202124]">Administrative Audit Trail</h2>
            <p className="text-xs text-[#555B63]">
              Immutable log of every financial verification, approval, refund, and settings change.
            </p>

            <div className="divide-y divide-[#E8E6E1] text-xs font-mono">
              {auditLogsList.map((log) => (
                <div key={log.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span className="text-[#E84B45] font-bold">{log.action}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-[#202124] font-sans text-xs">{log.details}</div>
                  <div className="text-[11px] text-neutral-500">
                    Actor: {log.actorName} ({log.actorId}) • Target: {log.targetType}:{log.targetId}
                    {log.reason && <span> • Reason: "{log.reason}"</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
