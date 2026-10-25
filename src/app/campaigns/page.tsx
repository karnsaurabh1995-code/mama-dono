'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { CAUSES_DATA } from '@/lib/data/causes';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'most_funded' | 'urgent'>('featured');

  const allCampaigns = db.getCampaigns({ status: 'active' });

  const filteredCampaigns = useMemo(() => {
    return allCampaigns
      .filter((c) => {
        if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchDesc = c.shortDescription.toLowerCase().includes(q);
          const matchOrg = (c.organizationName || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchOrg) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'most_funded') return b.raisedAmount - a.raisedAmount;
        if (sortBy === 'urgent') return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
        return 0;
      });
  }, [allCampaigns, search, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  return (
    <div className="py-8 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Discover Campaigns</span>
        </nav>

        {/* Page Title & Intro */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            Discover Verified Campaigns Across India
          </h1>
          <p className="text-sm text-[#555B63] max-w-3xl leading-relaxed">
            Support emergency surgeries, village girl scholarships, hospital daily meals, and essential supply drives. 100% verified documentation with instant 80G tax exemption receipts.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E6E1] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#555B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient, illness, student, NGO, or hospital..."
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#E84B45] focus:bg-white transition-all shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#202124] p-1 rounded-md transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="sort-campaigns" className="text-xs text-[#555B63] font-medium hidden sm:flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sort by:</span>
              </label>
              <select
                id="sort-campaigns"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-3 text-xs sm:text-sm font-medium text-[#202124] focus:outline-none focus:border-[#E84B45] focus:bg-white cursor-pointer transition-all shadow-2xs"
              >
                <option value="featured">Staff Picks & Featured</option>
                <option value="urgent">Urgent Deadlines</option>
                <option value="newest">Recently Published</option>
                <option value="most_funded">Most Raised</option>
              </select>
            </div>
          </div>

          {/* Cause Categories Filter Bar */}
          <div className="pt-3.5 border-t border-[#F0EFEA] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#555B63] uppercase tracking-wider text-[11px]">
                Filter by Cause
              </span>
              {(search || selectedCategory !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#E84B45] hover:text-[#c73934] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 text-xs no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap cursor-pointer transition-all duration-150 ${
                  selectedCategory === 'all'
                    ? 'bg-[#E84B45] text-white shadow-xs font-semibold'
                    : 'bg-[#FAF9F6] text-[#555B63] hover:text-[#202124] hover:bg-[#F3F1EC] border border-[#E8E6E1]'
                }`}
              >
                All Causes ({allCampaigns.length})
              </button>
              {CAUSES_DATA.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap cursor-pointer transition-all duration-150 ${
                    selectedCategory === c.id
                      ? 'bg-[#E84B45] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF9F6] text-[#555B63] hover:text-[#202124] hover:bg-[#F3F1EC] border border-[#E8E6E1]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#555B63]">
          <span>
            Showing <strong>{filteredCampaigns.length}</strong> active campaigns
          </span>
          {filteredCampaigns.length > 0 && (
            <span className="text-[#25845B] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              All campaigns verified by dokind Medical Social Work team
            </span>
          )}
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCampaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF0EF] text-[#E84B45] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#202124]">No campaigns match your filters</h3>
            <p className="text-xs text-[#555B63] leading-relaxed">
              Try clearing specific filters or searching for terms like "Aarav", "cancer", "education", or "meals".
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
