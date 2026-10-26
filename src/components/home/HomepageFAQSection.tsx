'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FAQItem } from '@/lib/types';
import { ChevronDown, HelpCircle, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HomepageFAQSectionProps {
  faqs?: FAQItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function HomepageFAQSection({ faqs = [], title, subtitle, badge }: HomepageFAQSectionProps) {
  // Filter for active FAQs configured for the homepage, fallback to initial if none specifically marked
  const activeFaqs = faqs.filter((f) => f.isActive !== false && f.showOnHomepage !== false);
  const displayFaqs = activeFaqs.length > 0 ? activeFaqs.slice(0, 6) : faqs.slice(0, 6);

  const [openId, setOpenId] = useState<string | null>(displayFaqs[0]?.id || null);

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (displayFaqs.length === 0) return null;

  return (
    <section className="py-20 bg-white border-b border-[#E8E6E1]" aria-label="Frequently Asked Questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-red-100">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{badge || 'TRANSPARENCY & ASSISTANCE'}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#202124] tracking-tight">
            {title || 'Questions About Giving?'}
          </h2>
          <p className="text-xs sm:text-sm text-[#555B63] max-w-xl mx-auto leading-relaxed">
            {subtitle || 'Everything you need to know about donation security, Section 80G tax benefits, patient verification, and transparent fund utilization.'}
          </p>
        </div>

        {/* Accessible Accordion Container */}
        <div className="space-y-3">
          {displayFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#202124]/30 bg-[#FAF9F6] shadow-sm'
                    : 'border-[#E8E6E1] bg-white hover:border-neutral-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:bg-neutral-50"
                >
                  <span className="text-sm sm:text-base font-bold text-[#202124]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-[#202124] text-white border-[#202124]'
                        : 'bg-[#FAF9F6] text-[#555B63] border-[#E8E6E1]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#555B63] leading-relaxed border-t border-neutral-200/50">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Link to Complete /faq page */}
        <div className="text-center pt-4">
          <Link href="/faq">
            <Button variant="outline" size="md" className="rounded-full text-xs font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore All Questions in Help Center
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
