'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { CauseMeta, CauseCategory } from '@/lib/types';
import { formatINRCompact } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Bookmark,
  Plus,
  Edit,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

export default function CausesManagementPage() {
  const { user } = useAuth();
  const [causes, setCauses] = useState<CauseMeta[]>(db.getCauses());
  const [search, setSearch] = useState('');
  const [selectedCause, setSelectedCause] = useState<CauseMeta | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [causeName, setCauseName] = useState('');
  const [causeSlug, setCauseSlug] = useState('');
  const [causeDesc, setCauseDesc] = useState('');
  const [causeIcon, setCauseIcon] = useState('Heart');
  const [bannerImage, setBannerImage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredCauses = causes.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenEdit = (cause: CauseMeta) => {
    setSelectedCause(cause);
    setCauseName(cause.name);
    setCauseSlug(cause.slug);
    setCauseDesc(cause.description);
    setCauseIcon(cause.icon);
    setBannerImage(cause.bannerImage);
    setIsEditing(true);
  };

  const handleSaveCause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!causeName.trim() || !causeSlug.trim()) {
      alert('Name and slug are required.');
      return;
    }

    if (selectedCause) {
      db.updateCause(
        selectedCause.id,
        {
          name: causeName.trim(),
          slug: causeSlug.trim(),
          description: causeDesc.trim(),
          icon: causeIcon.trim(),
          bannerImage: bannerImage.trim(),
        },
        user?.name || 'Admin'
      );
      notify(`Cause "${causeName}" updated.`);
    } else {
      const newId = causeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') as CauseCategory;
      db.createCause(
        {
          id: newId,
          name: causeName.trim(),
          slug: causeSlug.trim(),
          description: causeDesc.trim(),
          icon: causeIcon.trim() || 'Heart',
          campaignCount: 0,
          totalRaised: 0,
          bannerImage: bannerImage.trim() || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
        },
        user?.name || 'Admin'
      );
      notify(`New cause "${causeName}" created.`);
    }

    setCauses([...db.getCauses()]);
    setIsEditing(false);
    setSelectedCause(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Bookmark className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Classification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Causes & Impact Categories
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage cause directories, hero banners, and promotional taxonomies across the platform.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedCause(null);
            setCauseName('');
            setCauseSlug('');
            setCauseDesc('');
            setCauseIcon('Heart');
            setBannerImage('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80');
            setIsEditing(true);
          }}
          className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add New Cause
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

      {/* Causes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCauses.map((cause) => {
          const campCount = db.getCampaigns({ category: cause.id }).length;
          return (
            <div
              key={cause.id}
              className="bg-white rounded-2xl border border-[#E2E4E9] overflow-hidden shadow-2xs flex flex-col justify-between hover:border-[#E84B45] transition-colors group"
            >
              <div className="aspect-video relative overflow-hidden bg-neutral-100">
                <img
                  src={cause.bannerImage}
                  alt={cause.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 bg-black/60 text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-xs">
                  {campCount} Campaigns
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-[#202124]">{cause.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {cause.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    href={`/causes/${cause.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-[#E84B45] hover:underline flex items-center gap-1"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(cause)} className="text-xs">
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveCause}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">
                {selectedCause ? `Edit Cause: ${selectedCause.name}` : 'Create New Cause Category'}
              </h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Cause Name *</label>
              <input
                type="text"
                required
                value={causeName}
                onChange={(e) => setCauseName(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={causeSlug}
                  onChange={(e) => setCauseSlug(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Lucide Icon Identifier</label>
                <input
                  type="text"
                  value={causeIcon}
                  onChange={(e) => setCauseIcon(e.target.value)}
                  className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={causeDesc}
                onChange={(e) => setCauseDesc(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Banner Image URL</label>
              <input
                type="url"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Save Cause
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
