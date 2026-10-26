'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
import { Campaign, PageSection } from '@/lib/types';
import { PublishedSectionsRenderer } from '@/components/common/PublishedSectionsRenderer';

interface CampaignsClientProps {
  initialCampaigns: Campaign[];
  publishedSections: PageSection[];
}

export function CampaignsClient({ initialCampaigns, publishedSections }: CampaignsClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'most_funded' | 'urgent'>('featured');

  const heroSec = publishedSections.find((s) => s.type === 'hero' && s.isVisible !== false);

  const filteredCampaigns = useMemo(() => {
    return initialCampaigns
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
  }, [initialCampaigns, search, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  const hasActiveFilters = search.trim() !== '' || selectedCategory !== 'all' || sortBy !== 'featured';

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Explore Campaigns</span>
        </nav>

        {/* Hero Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#25845B] rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{heroSec?.badge || '100% Verified Medical & Social Fundraisers'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#202124] tracking-tight">
            {heroSec?.title || 'Every Rupee Saves a Life. Choose a Cause.'}
          </h1>
          <p className="text-sm sm:text-base text-[#555B63] max-w-2xl leading-relaxed">
            {heroSec?.subtitle || 'All campaigns are rigorously vetted with government hospitals, municipal bodies, and certified NGOs. Tax exemptions under Section 80G available instantly.'}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient, hospital, city or NGO..."
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#E84B45] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#E84B45] font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="urgent">Urgent First</option>
                <option value="most_funded">Most Funded</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#E84B45] text-white shadow-xs'
                  : 'bg-[#FAF9F6] border border-[#E8E6E1] text-[#555B63] hover:bg-neutral-100'
              }`}
            >
              All Causes ({initialCampaigns.length})
            </button>
            {CAUSES_DATA.map((cause) => {
              const count = initialCampaigns.filter((c) => c.category === cause.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cause.id}
                  onClick={() => setSelectedCategory(cause.id)}
                  className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cause.id
                      ? 'bg-[#E84B45] text-white font-bold shadow-xs'
                      : 'bg-[#FAF9F6] border border-[#E8E6E1] text-[#555B63] hover:bg-neutral-100'
                  }`}
                >
                  <span>{cause.name}</span>
                  <span className="text-[11px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center justify-between text-xs text-[#555B63]">
          <p>
            Showing <strong className="text-[#202124]">{filteredCampaigns.length}</strong> active campaigns
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#E84B45] font-semibold hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-[#202124]">No campaigns match your filters</h3>
            <p className="text-xs text-[#555B63] max-w-sm mx-auto">
              Try adjusting your search terms or selecting a different cause category.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        )}

        {/* Non-Hero Published Page Sections (e.g., stats, faqs, cta) */}
        <PublishedSectionsRenderer
          sections={publishedSections.filter((s) => s.type !== 'hero' && s.isVisible !== false)}
          activeCampaigns={initialCampaigns}
        />
      </div>
    </div>
  );
}
