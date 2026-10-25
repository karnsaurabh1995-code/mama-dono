'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, ItemizedBudgetItem, CauseCategory, CampaignType } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  HeartHandshake,
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  DollarSign,
  ShieldAlert,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const found = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (found) {
      setCampaign(JSON.parse(JSON.stringify(found)));
    }
  }, [campaignId]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  if (!campaign) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-[#E2E4E9] text-center text-xs text-neutral-500">
        Campaign not found.
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateCampaign(campaign.id, campaign, user?.name || 'Admin');
    if (updated) {
      notify('Campaign settings and itemized budget updated successfully.');
    }
  };

  const handleAddBudgetItem = () => {
    const newItem: ItemizedBudgetItem = {
      id: `item-${Date.now()}`,
      item: 'Medical Equipment / Supply Line Item',
      amount: 10000,
    };
    setCampaign({
      ...campaign,
      itemizedBudget: [...campaign.itemizedBudget, newItem],
    });
  };

  const handleUpdateBudgetItem = (index: number, updates: Partial<ItemizedBudgetItem>) => {
    const list = [...campaign.itemizedBudget];
    list[index] = { ...list[index], ...updates };
    setCampaign({ ...campaign, itemizedBudget: list });
  };

  const handleRemoveBudgetItem = (index: number) => {
    const list = campaign.itemizedBudget.filter((_, i) => i !== index);
    setCampaign({ ...campaign, itemizedBudget: list });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/campaigns"
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Campaign Editor</span>
            <h1 className="text-xl font-black text-[#202124] tracking-tight">{campaign.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/campaigns/${campaign.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              View Public Page
            </Button>
          </Link>
          <Button size="sm" onClick={handleSave} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Changes
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

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#202124] pb-2 border-b border-neutral-100">
                Core Information & Story
              </h3>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={campaign.title}
                  onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={campaign.shortDescription}
                  onChange={(e) => setCampaign({ ...campaign, shortDescription: e.target.value })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Full Detailed Story (Markdown)</label>
                <textarea
                  rows={8}
                  value={campaign.story}
                  onChange={(e) => setCampaign({ ...campaign, story: e.target.value })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            {/* Itemized Budget Manager */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold text-[#202124]">Itemized Expenditure Budget</h3>
                  <p className="text-xs text-neutral-500">
                    Transparent cost breakdown presented to donors on campaign page.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={handleAddBudgetItem} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-2">
                {campaign.itemizedBudget.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => handleUpdateBudgetItem(idx, { item: e.target.value })}
                      placeholder="Expense item description"
                      className="flex-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E84B45]"
                    />
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1.5 text-xs text-neutral-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleUpdateBudgetItem(idx, { amount: Number(e.target.value) || 0 })}
                        className="w-full bg-white border border-neutral-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#E84B45]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBudgetItem(idx)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Financial Ledger & Goal Controls */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#202124] pb-2 border-b border-neutral-100">
                Financials & Ledgers
              </h3>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Target Goal Amount (INR) *</label>
                <input
                  type="number"
                  required
                  value={campaign.goalAmount}
                  onChange={(e) => setCampaign({ ...campaign, goalAmount: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              {/* Verified Ledger Readonly Amount */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Verified Raised to Date</span>
                <p className="text-base font-black text-emerald-700 font-mono mt-0.5">
                  {formatINR(campaign.raisedAmount)}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Derived strictly from gateway settlements and approved offline wire vouchers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Campaign Status</label>
                <select
                  value={campaign.status}
                  onChange={(e) => setCampaign({ ...campaign, status: e.target.value as any })}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="active">Active (Accepting Donations)</option>
                  <option value="paused">Paused (Halt New Orders)</option>
                  <option value="completed">Completed (Goal Achieved)</option>
                  <option value="suspended">Suspended (Under Review)</option>
                </select>
              </div>
            </div>

            {/* Visibility & Operational Flags */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#202124] pb-2 border-b border-neutral-100">
                Placement & Compliance Flags
              </h3>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer">
                <span className="text-xs font-semibold text-neutral-700">Urgent Emergency (24h Alert)</span>
                <input
                  type="checkbox"
                  checked={campaign.urgent}
                  onChange={(e) => setCampaign({ ...campaign, urgent: e.target.checked })}
                  className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer">
                <span className="text-xs font-semibold text-neutral-700">Featured Homepage Placement</span>
                <input
                  type="checkbox"
                  checked={campaign.featured}
                  onChange={(e) => setCampaign({ ...campaign, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer">
                <span className="text-xs font-semibold text-neutral-700">Eligible for Section 80G Tax Exemption</span>
                <input
                  type="checkbox"
                  checked={campaign.has80G}
                  onChange={(e) => setCampaign({ ...campaign, has80G: e.target.checked })}
                  className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
              </label>
            </div>

            {/* Multi-Poster Carousel Gallery (2-3 Posters) */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-[#202124]">
                  Campaign Poster Carousel (2–3 Posters)
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#EF4949] bg-rose-50 px-2 py-0.5 rounded-full">
                  Multi-Poster Slider
                </span>
              </div>
              <p className="text-xs text-[#555B63]">
                Provide 2 to 3 high-resolution poster images for the campaign page header carousel.
              </p>

              {/* Poster 1 (Main) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7E2]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202124]">Poster #1 (Main Hero Artwork)</label>
                  <span className="text-[10px] font-bold text-emerald-700">Primary</span>
                </div>
                <input
                  type="url"
                  value={campaign.imageUrl}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    const posters = [...(campaign.posterImages || [campaign.imageUrl])];
                    posters[0] = newUrl;
                    setCampaign({ ...campaign, imageUrl: newUrl, posterImages: posters });
                  }}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
                {campaign.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-neutral-200 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={campaign.imageUrl} alt="Poster 1" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Poster 2 */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7E2]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202124]">Poster #2 (Medical Estimate / Diagnosis)</label>
                  <span className="text-[10px] text-neutral-500">Optional</span>
                </div>
                <input
                  type="url"
                  value={campaign.posterImages?.[1] || ''}
                  onChange={(e) => {
                    const posters = [
                      campaign.imageUrl,
                      e.target.value,
                      campaign.posterImages?.[2] || '',
                    ].filter(Boolean);
                    setCampaign({ ...campaign, posterImages: posters });
                  }}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
                {campaign.posterImages?.[1] && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-neutral-200 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={campaign.posterImages[1]} alt="Poster 2" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Poster 3 */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7E2]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202124]">Poster #3 (Patient / Beneficiary Verification)</label>
                  <span className="text-[10px] text-neutral-500">Optional</span>
                </div>
                <input
                  type="url"
                  value={campaign.posterImages?.[2] || ''}
                  onChange={(e) => {
                    const posters = [
                      campaign.imageUrl,
                      campaign.posterImages?.[1] || '',
                      e.target.value,
                    ].filter(Boolean);
                    setCampaign({ ...campaign, posterImages: posters });
                  }}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
                {campaign.posterImages?.[2] && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-neutral-200 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={campaign.posterImages[2]} alt="Poster 3" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
