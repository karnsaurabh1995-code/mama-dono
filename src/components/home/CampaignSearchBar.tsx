'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Heart, Building2, Tag, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';

export function CampaignSearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const campaigns = db.getCampaigns({ search: query }).slice(0, 4);
  const organizations = db.getOrganizations().filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-[#E8E6E1] hover:border-[#D5D1C8] focus-within:border-[#E84B45] focus-within:ring-2 focus-within:ring-[#E84B45]/20 transition-all p-1.5">
          <div className="pl-3.5 pr-2 text-[#555B63]">
            <Search className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search urgent surgeries, child education, food relief, or NGOs..."
            className="w-full bg-transparent py-2.5 text-sm text-[#202124] placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-[#E84B45] hover:bg-[#BD302D] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Instant Search Results Dropdown */}
      {isOpen && query.trim().length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E8E6E1] py-3 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {campaigns.length === 0 && organizations.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#555B63]">
              No exact matches found for "{query}". Try searching for medical, children, or food.
            </div>
          ) : (
            <>
              {/* Matching Campaigns */}
              {campaigns.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#E84B45]" />
                    <span>Campaigns</span>
                  </div>
                  {campaigns.map((c) => (
                    <Link
                      key={c.id}
                      href={`/campaigns/${c.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 hover:bg-[#FAF9F6] rounded-xl transition-colors group"
                    >
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#202124] group-hover:text-[#E84B45] truncate">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-[#555B63]">
                          Raised {formatINR(c.raisedAmount)} of {formatINR(c.goalAmount)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Matching NGOs */}
              {organizations.length > 0 && (
                <div className="px-3 pt-2 border-t border-neutral-100">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verified NGOs</span>
                  </div>
                  {organizations.map((org) => (
                    <Link
                      key={org.id}
                      href={`/organizations/${org.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 hover:bg-[#FAF9F6] rounded-xl transition-colors group"
                    >
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#202124] group-hover:text-blue-600 truncate">
                          {org.name}
                        </p>
                        <p className="text-[11px] text-[#555B63] truncate">
                          {org.tagline}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* View all button */}
              <div className="pt-2 px-3 border-t border-neutral-100">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between text-xs font-semibold text-[#E84B45] p-2 hover:bg-[#FFF0EF] rounded-lg transition-colors"
                >
                  <span>See all results for "{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
