'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { Button } from '@/components/ui/Button';
import { Search, ChevronRight, Building2, Heart, BookOpen, AlertCircle } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (searchParams?.get('q')) {
      setQuery(searchParams.get('q') || '');
    }
  }, [searchParams]);

  const campaigns = query.trim()
    ? db.getCampaigns({ search: query, status: 'active' })
    : [];

  const organizations = query.trim()
    ? db.getOrganizations().filter((o) =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const stories = query.trim()
    ? db.getStories().filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.excerpt.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const totalResults = campaigns.length + organizations.length + stories.length;

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Search Platform</span>
        </nav>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-[#202124] text-center">
            Search Causes, Patients & NGOs
          </h1>
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords (e.g. cancer, AIIMS, girl education, food, dogs)..."
              className="w-full bg-white border border-[#E8E6E1] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#E84B45] shadow-sm"
            />
          </div>
        </div>

        {/* Results Overview */}
        {query.trim() && (
          <div className="text-xs text-[#555B63]">
            Found <strong>{totalResults}</strong> result{totalResults === 1 ? '' : 's'} for "
            <strong>{query}</strong>"
          </div>
        )}

        {/* Results Sections */}
        {totalResults > 0 ? (
          <div className="space-y-10">
            {/* Campaigns */}
            {campaigns.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#202124] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#E84B45]" />
                  <span>Matching Campaigns ({campaigns.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {campaigns.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Organizations */}
            {organizations.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#202124] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Verified Non-Profit Organizations ({organizations.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizations.map((org) => (
                    <Link
                      key={org.id}
                      href={`/organizations/${org.slug}`}
                      className="p-4 bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5 group"
                    >
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#202124] group-hover:text-blue-600 truncate">
                          {org.name}
                        </h4>
                        <p className="text-[11px] text-[#555B63] truncate">{org.tagline}</p>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                          Verified 80G Partner
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : query.trim() ? (
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-12 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-bold text-[#202124]">No matching results found</h3>
            <p className="text-xs text-[#555B63]">
              Try searching with a broader keyword like "medical", "children", or "ration".
            </p>
            <Link href="/campaigns">
              <Button variant="primary" size="sm">
                Explore All Campaigns
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
