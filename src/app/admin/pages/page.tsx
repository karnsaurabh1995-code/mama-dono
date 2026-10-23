'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import {
  Layers,
  Plus,
  Paintbrush,
  ExternalLink,
  CheckCircle2,
  Search,
  FileText,
  X,
} from 'lucide-react';

interface CMSPage {
  slug: string;
  title: string;
  type: 'system' | 'custom';
  status: 'published' | 'draft';
  sectionsCount: number;
  lastUpdated: string;
}

export default function AdminPagesCMS() {
  const [pages, setPages] = useState<CMSPage[]>([
    { slug: 'home', title: 'Homepage Main Canvas', type: 'system', status: 'published', sectionsCount: 10, lastUpdated: '2026-10-23' },
    { slug: 'campaigns', title: 'Campaign Directory & Filters', type: 'system', status: 'published', sectionsCount: 6, lastUpdated: '2026-10-20' },
    { slug: 'monthly-giving', title: 'Monthly Missions & Sustained Giving', type: 'system', status: 'published', sectionsCount: 5, lastUpdated: '2026-10-18' },
    { slug: 'product-giving', title: 'Product Giving Essentials Catalog', type: 'system', status: 'published', sectionsCount: 5, lastUpdated: '2026-10-15' },
    { slug: 'about', title: 'About SevaSetu & Trust Principles', type: 'system', status: 'published', sectionsCount: 4, lastUpdated: '2026-10-12' },
    { slug: 'how-it-works', title: 'How It Works Dual Journey', type: 'system', status: 'published', sectionsCount: 4, lastUpdated: '2026-10-10' },
    { slug: 'donate-checkout', title: 'Donation Checkout Microcopy', type: 'system', status: 'published', sectionsCount: 3, lastUpdated: '2026-10-21' },
    { slug: 'contact-faq', title: 'Help Center & FAQs', type: 'system', status: 'published', sectionsCount: 4, lastUpdated: '2026-10-19' },
  ]);

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;

    const newPage: CMSPage = {
      slug: newPageSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
      title: newPageTitle.trim(),
      type: 'custom',
      status: 'draft',
      sectionsCount: 1,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setPages((prev) => [...prev, newPage]);
    setShowCreateModal(false);
    setNewPageTitle('');
    setNewPageSlug('');
    notify(`Landing page "${newPage.title}" created. You can now edit it in the Website Builder.`);
  };

  const filteredPages = pages.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Content Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Pages & Managed Content
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Overview of all system pages and custom landing pages editable via the visual website builder.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/website-builder">
            <Button size="sm" variant="outline" className="text-xs">
              <Paintbrush className="w-3.5 h-3.5 mr-1" />
              Open Website Builder
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Landing Page
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

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E4E9] shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-[#E2E4E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#E84B45]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Page Title & Slug</th>
                <th className="py-3 px-4">Page Type</th>
                <th className="py-3 px-4">Sections</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPages.map((p) => (
                <tr key={p.slug} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#202124]">{p.title}</p>
                    <span className="font-mono text-[10px] text-neutral-400">/{p.slug}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-bold">
                      {p.type}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-neutral-700">{p.sectionsCount} blocks</td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-neutral-400">{p.lastUpdated}</td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/website-builder`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E84B45] hover:underline"
                      >
                        <Paintbrush className="w-3.5 h-3.5" />
                        <span>Edit Layout</span>
                      </Link>

                      <Link
                        href={p.slug === 'home' ? '/' : `/${p.slug}`}
                        target="_blank"
                        className="text-neutral-400 hover:text-neutral-700"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Landing Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleCreatePage}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#202124]">Create Managed Landing Page</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Page Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Diwali Food Relief 2026"
                value={newPageTitle}
                onChange={(e) => {
                  setNewPageTitle(e.target.value);
                  if (!newPageSlug) {
                    setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">URL Path Slug *</label>
              <div className="flex items-center">
                <span className="bg-neutral-100 border border-r-0 border-[#E2E4E9] rounded-l-xl px-3 py-2 text-xs font-mono text-neutral-500">
                  /
                </span>
                <input
                  type="text"
                  required
                  placeholder="diwali-relief"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="flex-1 bg-white border border-[#E2E4E9] rounded-r-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                Create & Configure
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
