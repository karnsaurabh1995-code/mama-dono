'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Campaign, HomepageCurationConfig, MonthlyMission, CauseMeta, TagItem } from '@/lib/types';
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
  Eye,
  Search,
  Check,
  ShieldCheck,
  Clock,
  RotateCcw,
  AlertTriangle,
  Filter,
  Tag,
  ArrowLeft,
} from 'lucide-react';

export default function HomepageCurationPage() {
  const { user } = useAuth();
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [monthlyMissions, setMonthlyMissions] = useState<MonthlyMission[]>([]);
  const [causes, setCauses] = useState<CauseMeta[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);

  const [curation, setCuration] = useState<HomepageCurationConfig>({
    heroCampaignIds: [],
    featuredCampaignIds: [],
    monthlyMissionIds: [],
    urgentCampaignIds: [],
  });
  const [initialCuration, setInitialCuration] = useState<HomepageCurationConfig>({
    heroCampaignIds: [],
    featuredCampaignIds: [],
    monthlyMissionIds: [],
    urgentCampaignIds: [],
  });

  const [activeTab, setActiveTab] = useState<'hero' | 'featured' | 'monthly' | 'urgent'>('hero');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const hasUnsavedChanges = JSON.stringify(curation) !== JSON.stringify(initialCuration);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/homepage-curation');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        if (data.campaigns) setAllCampaigns(data.campaigns);
        if (data.monthlyMissions) setMonthlyMissions(data.monthlyMissions);
        if (data.causes) setCauses(data.causes);
        if (data.tags) setTags(data.tags);
        if (data.curation) {
          setCuration(data.curation);
          setInitialCuration(JSON.parse(JSON.stringify(data.curation)));
        }
      }
    } catch (err: any) {
      console.error('Failed to load homepage curation from server:', err);
      notify('Could not load curation: ' + err.message);
    }
  };

  useEffect(() => {
    loadData();
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
        setInitialCuration(JSON.parse(JSON.stringify(data.curation)));
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

  const handleDiscardChanges = () => {
    setCuration(JSON.parse(JSON.stringify(initialCuration)));
    notify('Discarded unsaved placement edits.');
  };

  // Filter campaigns for the "Available to Add" picker
  const filteredCampaigns = allCampaigns.filter((c) => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (tagFilter !== 'all' && !(c.tags || []).includes(tagFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchCat = c.category.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E6E1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/campaigns"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800 mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Campaigns</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E84B45] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Merchandising & Placement</span>
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
              Homepage Campaign Placements
            </h1>
            {hasUnsavedChanges && (
              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>

          <p className="text-xs text-[#555B63] mt-1 max-w-2xl">
            Control the exact ordering and selection of active campaigns and recurring missions displayed on the public Dokind homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E6E1] text-xs font-bold text-[#202124] hover:bg-[#FAF9F6] transition shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span>Open Live Homepage</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </Link>

          {hasUnsavedChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
              className="text-xs text-neutral-600 hover:bg-neutral-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Discard
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </Button>
        </div>
      </div>

      {/* Toast Notice */}
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
      <div className="flex border-b border-[#E8E6E1] space-x-2 overflow-x-auto bg-white px-4 pt-3 rounded-t-2xl border-t border-x">
        {[
          { id: 'hero', label: '1. Top Hero Carousel', count: curation.heroCampaignIds?.length || 0 },
          { id: 'featured', label: '2. Featured Causes & Campaigns Grid', count: curation.featuredCampaignIds?.length || 0 },
          { id: 'monthly', label: '3. Monthly Recurring Missions', count: curation.monthlyMissionIds?.length || 0 },
          { id: 'urgent', label: '4. Urgent Emergency Strip', count: curation.urgentCampaignIds?.length || 0 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-[#E84B45] text-[#E84B45]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-[#FFF0EF] text-[#E84B45]' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Workspace: Selected Ordered Items on Left, Campaign Browser on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Currently Placed Ordered Campaigns (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-b-2xl lg:rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-[#202124]">
                {activeTab === 'hero' && 'Top Hero Carousel Items'}
                {activeTab === 'featured' && 'Featured Campaigns in Cause Discovery Grid'}
                {activeTab === 'monthly' && 'Monthly Recurring Missions'}
                {activeTab === 'urgent' && 'Urgent Emergency Campaigns'}
              </h2>
              <p className="text-[11px] text-neutral-500">
                Ordered sequentially. Slot #1 renders first on the public homepage.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#15803D] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Live Order
            </span>
          </div>

          {/* Monthly Missions Section */}
          {activeTab === 'monthly' ? (
            <div className="space-y-3">
              {(curation.monthlyMissionIds || []).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400 space-y-2">
                  <p>No monthly missions selected. Default platform missions will display.</p>
                </div>
              ) : (
                (curation.monthlyMissionIds || []).map((id, index) => {
                  const mission = monthlyMissions.find((m) => m.id === id || m.slug === id);
                  if (!mission) {
                    return (
                      <div key={id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex justify-between items-center text-neutral-400">
                        <span>Legacy Mission ID: {id}</span>
                        <button onClick={() => removeItem('monthlyMissionIds', id)} className="text-rose-600 hover:underline">Remove</button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={mission.id}
                      className="p-3.5 rounded-xl border border-[#E8E6E1] bg-[#FAF9F6] flex items-center justify-between gap-3 group hover:border-neutral-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-white border border-neutral-300 text-neutral-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mission.imageUrl}
                          alt={mission.title}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-[#E84B45]">
                              {mission.cause}
                            </span>
                            <span className="text-[10px] font-bold text-neutral-600 font-mono">
                              ₹{mission.monthlyAmount}/mo
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#202124] truncate">{mission.title}</h4>
                          <p className="text-[11px] text-neutral-500 truncate">{mission.tagline}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem('monthlyMissionIds', index, 'up')}
                          className="p-1 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === (curation.monthlyMissionIds?.length || 0) - 1}
                          onClick={() => moveItem('monthlyMissionIds', index, 'down')}
                          className="p-1 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem('monthlyMissionIds', mission.id)}
                          className="p-1 rounded-lg border border-neutral-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer ml-1"
                          title="Remove from Monthly Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Campaign Placements for Hero, Featured, Urgent
            <div className="space-y-3">
              {(() => {
                const targetKey: keyof HomepageCurationConfig =
                  activeTab === 'hero'
                    ? 'heroCampaignIds'
                    : activeTab === 'featured'
                    ? 'featuredCampaignIds'
                    : 'urgentCampaignIds';

                const list = curation[targetKey] || [];

                if (list.length === 0) {
                  return (
                    <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400 space-y-2">
                      <p>No campaigns placed in this section yet.</p>
                      <p className="text-[11px]">Select from the campaign browser on the right to add.</p>
                    </div>
                  );
                }

                return list.map((id, index) => {
                  const camp = allCampaigns.find((c) => c.id === id || c.slug === id);
                  if (!camp) {
                    return (
                      <div key={id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex justify-between items-center text-neutral-400">
                        <span>Campaign ID: {id} (Not Found or Inactive)</span>
                        <button onClick={() => removeItem(targetKey, id)} className="text-rose-600 hover:underline">Remove</button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={camp.id}
                      className="p-3.5 rounded-xl border border-[#E8E6E1] bg-[#FAF9F6] flex items-center justify-between gap-3 group hover:border-neutral-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-white border border-neutral-300 text-neutral-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={camp.imageUrl}
                          alt={camp.title}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase text-[#E84B45]">
                              {camp.category}
                            </span>
                            {camp.urgent && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                                Urgent
                              </span>
                            )}
                            {camp.has80G && (
                              <span className="text-[9px] font-bold text-neutral-700 bg-neutral-200 px-1.5 py-0.2 rounded">
                                80G
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-[#202124] truncate">{camp.title}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                            <span>Raised: <strong className="text-neutral-800">{formatINR(camp.raisedAmount)}</strong></span>
                            <span>•</span>
                            <span>Goal: {formatINR(camp.goalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem(targetKey, index, 'up')}
                          className="p-1 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === list.length - 1}
                          onClick={() => moveItem(targetKey, index, 'down')}
                          className="p-1 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(targetKey, camp.id)}
                          className="p-1 rounded-lg border border-neutral-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer ml-1"
                          title="Remove from section"
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

        {/* RIGHT COLUMN: Candidate Item Picker (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-[#202124]">
              {activeTab === 'monthly' ? 'Available Monthly Missions' : 'Available Active Campaigns'}
            </h3>
            <p className="text-[11px] text-neutral-500">
              Click &quot;Add&quot; to place an item into the live {activeTab} section.
            </p>
          </div>

          {activeTab !== 'monthly' && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by title, ID, or cause..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2 py-1 text-[11px] text-[#202124] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {causes.map((c) => (
                    <option key={c.id} value={c.slug || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2 py-1 text-[11px] text-[#202124] focus:outline-none"
                >
                  <option value="all">All Tags</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.slug}>
                      #{t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* List of candidates */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {activeTab === 'monthly' ? (
              monthlyMissions.map((m) => {
                const isSelected = (curation.monthlyMissionIds || []).includes(m.id);
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-[#E8E6E1] hover:border-neutral-300 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.imageUrl} alt={m.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase text-[#E84B45]">{m.cause}</span>
                        <h5 className="text-xs font-bold text-[#202124] truncate">{m.title}</h5>
                        <span className="text-[10px] text-neutral-500 font-mono">₹{m.monthlyAmount}/mo</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => (isSelected ? removeItem('monthlyMissionIds', m.id) : addItem('monthlyMissionIds', m.id))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-neutral-100 text-neutral-600 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-[#E84B45] text-white hover:bg-[#BD302D]'
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
              })
            ) : (
              filteredCampaigns.map((camp) => {
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
                    className="p-3 rounded-xl border border-[#E8E6E1] hover:border-neutral-300 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={camp.imageUrl} alt={camp.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase text-[#E84B45]">{camp.category}</span>
                        <h5 className="text-xs font-bold text-[#202124] truncate">{camp.title}</h5>
                        <div className="text-[10px] text-neutral-500">{formatINR(camp.raisedAmount)} raised</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => (isSelected ? removeItem(targetKey, camp.id) : addItem(targetKey, camp.id))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-neutral-100 text-neutral-600 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-[#E84B45] text-white hover:bg-[#BD302D]'
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
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
