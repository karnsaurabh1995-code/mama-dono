'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageSection, FAQItem } from '@/lib/types';
import { PublishedSectionsRenderer } from '@/components/common/PublishedSectionsRenderer';

interface HelpCenterClientProps {
  publishedSections: PageSection[];
  allFaqs: FAQItem[];
}

export function HelpCenterClient({ publishedSections, allFaqs }: HelpCenterClientProps) {
  const heroSec = publishedSections.find((s) => s.type === 'hero' && s.isVisible !== false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const faqs = allFaqs
    .filter((f) => selectedCategory === 'all' || f.category === selectedCategory)
    .filter((f) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Help Center & FAQs</span>
        </nav>

        {/* Header & Search */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="bg-[#FFF0EF] text-[#E84B45] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {heroSec?.badge || 'Knowledge Base'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
            {heroSec?.title || 'Frequently Asked Questions'}
          </h1>
          <p className="text-sm text-[#555B63]">
            {heroSec?.subtitle || 'Learn about donation security, Section 80G tax deductions, verification standards, and recurring monthly giving.'}
          </p>

          <div className="relative max-w-lg mx-auto">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. 80G, cancel recurring, AIIMS)..."
              className="w-full bg-white border border-[#E8E6E1] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#202124] placeholder-neutral-400 focus:outline-none focus:border-[#E84B45] shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'donor', label: 'For Donors' },
            { id: 'tax_80g', label: '80G Tax Benefits' },
            { id: 'payments', label: 'Payments & Razorpay' },
            { id: 'fundraiser', label: 'For Fundraisers' },
            { id: 'verification', label: 'NGO Verification' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#E84B45] text-white shadow-xs'
                  : 'bg-white border border-[#E8E6E1] text-[#555B63] hover:bg-neutral-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                >
                  <span className="font-bold text-sm text-[#202124] leading-snug">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#E84B45] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-[#555B63] leading-relaxed border-t border-neutral-100 mt-2 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions card */}
        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 text-center space-y-3 shadow-xs">
          <h3 className="text-base font-bold text-[#202124]">Still have questions?</h3>
          <p className="text-xs text-[#555B63] max-w-sm mx-auto">
            Our donor care and hospital support desk is available Monday through Saturday.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <Link href="/contact">
              <Button variant="primary" size="sm">
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </div>

        {/* Non-Hero Published Page Sections (e.g., cta) */}
        <PublishedSectionsRenderer
          sections={publishedSections.filter((s) => s.type !== 'hero' && s.isVisible !== false)}
        />
      </div>
    </div>
  );
}
