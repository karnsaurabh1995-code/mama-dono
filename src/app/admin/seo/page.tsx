'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { RedirectRule } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  Globe2,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  X,
} from 'lucide-react';

export default function SEOManagementPage() {
  const { user } = useAuth();
  const [redirects, setRedirects] = useState<RedirectRule[]>(db.getRedirectRules());
  const [showAddRedirect, setShowAddRedirect] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // SEO Global Fields
  const [metaTitle, setMetaTitle] = useState('SevaSetu — India’s Trusted Crowdfunding Platform');
  const [metaDescription, setMetaDescription] = useState(
    'Support urgent pediatric surgeries, hospital food missions, girl child scholarships, and verified grassroots NGOs across India. 100% verified campaigns with Section 80G tax benefits.'
  );
  const [gaId, setGaId] = useState('G-SEVASETU2026');

  // Add Redirect Form
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [statusCode, setStatusCode] = useState<301 | 302>(301);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    notify('Global SEO metadata and tracking tags saved.');
  };

  const handleCreateRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.trim() || !toPath.trim()) {
      alert('Both paths are required.');
      return;
    }

    db.createRedirectRule(
      {
        fromPath: fromPath.trim(),
        toPath: toPath.trim(),
        statusCode,
        isActive: true,
      },
      user?.name || 'Admin'
    );

    setRedirects([...db.getRedirectRules()]);
    setShowAddRedirect(false);
    setFromPath('');
    setToPath('');
    notify(`Redirect from ${fromPath} to ${toPath} created.`);
  };

  const handleDeleteRedirect = (id: string) => {
    if (confirm('Delete this redirect rule?')) {
      db.deleteRedirectRule(id, user?.name || 'Admin');
      setRedirects([...db.getRedirectRules()]);
      notify('Redirect removed.');
    }
  };

  const handleToggleActive = (rule: RedirectRule) => {
    db.updateRedirectRule(rule.id, { isActive: !rule.isActive }, user?.name || 'Admin');
    setRedirects([...db.getRedirectRules()]);
    notify(`Redirect ${rule.fromPath} is now ${!rule.isActive ? 'active' : 'disabled'}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Globe2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Search Engine Visibility</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            SEO Metadata & URL Redirect Manager
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage canonical tags, OpenGraph previews, and create 301/302 redirects for campaign shortlinks.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAddRedirect(true)} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add URL Redirect
        </Button>
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

      {/* Global Metadata Settings */}
      <form onSubmit={handleSaveSEO} className="bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-[#202124]">Global Search Engine Metadata</h3>
          <Button type="submit" size="sm" className="bg-[#202124] hover:bg-black text-white text-xs">
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Meta Tags
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Global Meta Title Template *</label>
            <input
              type="text"
              required
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Google Analytics 4 Measurement ID</label>
            <input
              type="text"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">Global Meta Description *</label>
          <textarea
            rows={2}
            required
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
          />
        </div>
      </form>

      {/* Redirects Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202124]">Configured 301/302 Redirect Rules</h3>
          <span className="text-xs text-neutral-400">{redirects.length} active redirects</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">From Path</th>
                <th className="py-3 px-4">Target Destination</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4">Hit Counter</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {redirects.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-800">{r.fromPath}</td>
                  <td className="py-3 px-4 font-mono text-neutral-600 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{r.toPath}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 font-bold">
                      {r.statusCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-600">{r.hits.toLocaleString()} hits</td>
                  <td className="py-3 px-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-neutral-600">
                      <input
                        type="checkbox"
                        checked={r.isActive}
                        onChange={() => handleToggleActive(r)}
                        className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                      />
                      <span>{r.isActive ? 'Active' : 'Disabled'}</span>
                    </label>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteRedirect(r.id)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Redirect Modal */}
      {showAddRedirect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleCreateRedirect}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Add URL Redirect Rule</h3>
              <button type="button" onClick={() => setShowAddRedirect(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Incoming From Path *</label>
              <input
                type="text"
                required
                placeholder="/covid-relief"
                value={fromPath}
                onChange={(e) => setFromPath(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Target To Path *</label>
              <input
                type="text"
                required
                placeholder="/causes/medical"
                value={toPath}
                onChange={(e) => setToPath(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Redirect HTTP Status Code</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value) as any)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value={301}>301 Permanent Redirect (Recommended for SEO)</option>
                <option value={302}>302 Temporary Redirect (Campaign shortlinks)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddRedirect(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Create Redirect
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
