'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Campaign, HomepageCurationConfig } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  Save,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Sliders,
  Heart,
  Eye,
  Search,
  Check,
  ShieldCheck,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface MissionOption {
  id: string;
  slug: string;
  title: string;
  cause: string;
  monthlyAmount: number;
  imageUrl: string;
}

const AVAILABLE_MISSIONS: MissionOption[] = [
  {
    id: 'mission-zero-hunger',
    slug: 'mission-zero-hunger',
    title: 'Mission 1000: Daily Hospital Meals',
    cause: 'Food Relief',
    monthlyAmount: 501,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mission-girl-scholarship',
    slug: 'mission-girl-scholarship',
    title: 'Mission Shiksha: Educate a Girl Child',
    cause: 'Child Education',
    monthlyAmount: 1001,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mission-animal-rescue',
    slug: 'mission-animal-rescue',
    title: 'Mission Karuna: Stray Animal Hospital Care',
    cause: 'Animal Welfare',
    monthlyAmount: 751,
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mission-elder-care',
    slug: 'mission-elder-care',
    title: 'Mission Vardaan: Senior Citizen Healthcare & Shelter',
    cause: 'Elder Care',
    monthlyAmount: 850,
    imageUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80',
  },
];

export default function HomepageCurationPage() {
  const { user } = useAuth();
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [curation, setCuration] = useState<HomepageCurationConfig>({
    heroCampaignIds: [],
    featuredCampaignIds: [],
    monthlyMissionIds: [],
    urgentCampaignIds: [],
  });

  const [activeTab, setActiveTab] = useState<'hero' | 'featured' | 'monthly' | 'urgent'>('hero');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/homepage-curation')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (mounted && data.success) {
          if (data.campaigns) setAllCampaigns(data.campaigns);
          if (data.curation) setCuration(data.curation);
        }
      })
      .catch((err) => {
        console.error('Failed to load homepage curation from server:', err);
        setToastMessage('Could not load curation from server: ' + err.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/homepage-curation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curation),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save placements');
      }
      if (data.curation) {
        setCuration(data.curation);
      }
      notify(data.message || 'Homepage campaign placements updated and published live!');
    } catch (e: any) {
      console.error('Failed to update curation on server:', e);
      notify('Failed to save placements: ' + (e.message || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder helpers
  const moveItem = (section: keyof HomepageCurationConfig, index: number, direction: 'up' | 'down') => {
    const list = [...(curation[section] || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setCuration({ ...curation, [section]: list });
  };

  const removeItem = (section: keyof HomepageCurationConfig, id: string) => {
    const list = (curation[section] || []).filter((item) => item !== id);
    setCuration({ ...curation, [section]: list });
  };

  const addItem = (section: keyof HomepageCurationConfig, id: string) => {
    const list = [...(curation[section] || [])];
    if (!list.includes(id)) {
      list.push(id);
      setCuration({ ...curation, [section]: list });
    }
  };

  // Filter campaigns for the "Available to Add" picker
  const filteredCampaigns = allCampaigns.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.organizationName && c.organizationName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E6E1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EF4949]">
            <Layers className="w-4 h-4" />
            <span>Homepage CMS & Campaign Curation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Homepage Campaign Placements
          </h1>
          <p className="text-xs text-[#555B63] mt-1 max-w-2xl">
            Choose exactly which fundraisers and missions appear on the top Hero Carousel, Featured Causes grid, and Monthly Giving section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E8E6E1] text-xs font-bold text-[#202124] hover:bg-[#FAF9F6] transition shadow-xs"
          >
            <Eye className="w-4 h-4 text-neutral-500" />
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#EF4949] hover:bg-[#D9363E] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* 2. Section Tabs */}
      <div className="flex border-b border-[#E8E6E1] space-x-2 overflow-x-auto">
        {[
          { id: 'hero', label: '1. Top Hero Carousel', count: curation.heroCampaignIds?.length || 0 },
          { id: 'featured', label: '2. Featured Causes & Campaigns Grid', count: curation.featuredCampaignIds?.length || 0 },
          { id: 'monthly', label: '3. Monthly Giving Missions', count: curation.monthlyMissionIds?.length || 0 },
          { id: 'urgent', label: '4. Urgent Emergency Appeals', count: curation.urgentCampaignIds?.length || 0 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-[#EF4949] text-[#EF4949]'
                  : 'border-transparent text-[#72777F] hover:text-[#202124] hover:border-neutral-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-[#FFF0EF] text-[#EF4949]' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Content: Selected Items on Left, Campaign Browser on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Currently Placed Campaigns (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-[#202124]">
                {activeTab === 'hero' && 'Hero Carousel Campaigns'}
                {activeTab === 'featured' && 'Featured Campaigns in Cause Discovery Grid'}
                {activeTab === 'monthly' && 'Monthly Recurring Giving Missions'}
                {activeTab === 'urgent' && 'Urgent Emergency Campaigns'}
              </h2>
              <p className="text-[11px] text-[#72777F]">
                Drag or reorder with arrows. Top items appear first on the live homepage.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#25845B] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Live Ordered
            </span>
          </div>

          {/* Monthly Missions Specific List */}
          {activeTab === 'monthly' ? (
            <div className="space-y-3">
              {(curation.monthlyMissionIds || []).map((id, index) => {
                const mission = AVAILABLE_MISSIONS.find((m) => m.id === id || m.slug === id);
                if (!mission) return null;

                return (
                  <div
                    key={mission.id}
                    className="p-3.5 rounded-xl border border-[#E8E6E1] bg-[#FAF9F6] flex items-center justify-between gap-3 group hover:border-[#D5D1C8] transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border border-neutral-300 text-neutral-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mission.imageUrl}
                        alt={mission.title}
                        className="w-14 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#202124] line-clamp-1">{mission.title}</h4>
                        <div className="text-[11px] text-[#72777F] flex items-center gap-2">
                          <span className="text-[#EF4949] font-medium">{mission.cause}</span>
                          <span>•</span>
                          <span>₹{mission.monthlyAmount}/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem('monthlyMissionIds', index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-neutral-200 hover:bg-white text-neutral-500 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem('monthlyMissionIds', index, 'down')}
                        disabled={index === (curation.monthlyMissionIds?.length || 0) - 1}
                        className="p-1.5 rounded-lg border border-neutral-200 hover:bg-white text-neutral-500 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem('monthlyMissionIds', mission.id)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        title="Remove from Monthly Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!curation.monthlyMissionIds || curation.monthlyMissionIds.length === 0) && (
                <div className="py-8 text-center text-xs text-neutral-400 border border-dashed rounded-xl">
                  No monthly missions selected. Pick from the available missions on the right.
                </div>
              )}
            </div>
          ) : (
            /* Campaign-based Placement List */
            <div className="space-y-3">
              {(() => {
                const targetKey: keyof HomepageCurationConfig =
                  activeTab === 'hero'
                    ? 'heroCampaignIds'
                    : activeTab === 'featured'
                    ? 'featuredCampaignIds'
                    : 'urgentCampaignIds';

                const currentIds = curation[targetKey] || [];

                if (currentIds.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-neutral-400 border border-dashed rounded-xl">
                      No campaigns placed in this section yet. Choose campaigns from the right panel.
                    </div>
                  );
                }

                return currentIds.map((id, index) => {
                  const camp = allCampaigns.find((c) => c.id === id || c.slug === id);
                  if (!camp) return null;

                  return (
                    <div
                      key={camp.id}
                      className="p-3.5 rounded-xl border border-[#E8E6E1] bg-[#FAF9F6] flex items-center justify-between gap-3 group hover:border-[#D5D1C8] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-white border border-neutral-300 text-neutral-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={camp.imageUrl}
                          alt={camp.title}
                          className="w-14 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#202124] truncate group-hover:text-[#EF4949] transition-colors">
                            {camp.title}
                          </h4>
                          <div className="text-[11px] text-[#72777F] flex items-center gap-2 truncate">
                            <span className="capitalize font-medium text-neutral-800">{camp.category}</span>
                            <span>•</span>
                            <span className="font-mono text-emerald-700 font-bold">{formatINR(camp.raisedAmount)}</span>
                            <span>raised of {formatINR(camp.goalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveItem(targetKey, index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg border border-neutral-200 hover:bg-white text-neutral-500 disabled:opacity-30 cursor-pointer"
                          title="Move Earlier in Carousel/Grid"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(targetKey, index, 'down')}
                          disabled={index === currentIds.length - 1}
                          className="p-1.5 rounded-lg border border-neutral-200 hover:bg-white text-neutral-500 disabled:opacity-30 cursor-pointer"
                          title="Move Later in Carousel/Grid"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(targetKey, camp.id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          title="Remove Placement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Available Campaigns / Missions Browser (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                Available Fundraisers & Drives
              </h3>
              <p className="text-[11px] text-[#72777F]">Click to add into the active placement slot.</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active campaigns..."
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#EF4949]"
            />
          </div>

          {activeTab === 'monthly' ? (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {AVAILABLE_MISSIONS.map((m) => {
                const isSelected = (curation.monthlyMissionIds || []).includes(m.id);

                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 bg-white hover:bg-neutral-50 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.imageUrl} alt={m.title} className="w-12 h-9 rounded-md object-cover border" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#202124] truncate">{m.title}</div>
                        <div className="text-[10px] text-neutral-500">{m.cause} • ₹{m.monthlyAmount}/mo</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => (isSelected ? removeItem('monthlyMissionIds', m.id) : addItem('monthlyMissionIds', m.id))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-neutral-100 text-neutral-600 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-[#EF4949] text-white hover:bg-[#D9363E]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredCampaigns.map((camp) => {
                const targetKey: keyof HomepageCurationConfig =
                  activeTab === 'hero'
                    ? 'heroCampaignIds'
                    : activeTab === 'featured'
                    ? 'featuredCampaignIds'
                    : 'urgentCampaignIds';

                const isSelected = (curation[targetKey] || []).includes(camp.id);

                return (
                  <div
                    key={camp.id}
                    className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 bg-white hover:bg-neutral-50 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={camp.imageUrl} alt={camp.title} className="w-12 h-9 rounded-md object-cover border shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#202124] truncate">{camp.title}</div>
                        <div className="text-[10px] text-neutral-500 truncate">
                          {camp.category} • {formatINR(camp.raisedAmount)} / {formatINR(camp.goalAmount)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => (isSelected ? removeItem(targetKey, camp.id) : addItem(targetKey, camp.id))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? 'bg-neutral-100 text-neutral-600 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-[#EF4949] text-white hover:bg-[#D9363E]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Placed</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Place</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
