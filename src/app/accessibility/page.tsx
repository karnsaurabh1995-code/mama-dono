import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function AccessibilityStatementPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Accessibility Statement</span>
        </nav>

        <div className="bg-white rounded-3xl border border-[#E8E6E1] p-8 sm:p-12 shadow-xs space-y-6">
          <h1 className="text-3xl font-black text-[#202124]">Accessibility Statement (WCAG 2.2 AA)</h1>
          <p className="text-xs text-neutral-400">Commitment to Inclusive Digital Crowdfunding</p>

          <div className="prose text-xs sm:text-sm text-[#404348] space-y-4 leading-relaxed whitespace-pre-line">
            <h3 className="text-base font-bold text-[#202124]">Our Standards & Architecture</h3>
            dokind is engineered to adhere strictly to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards to ensure all citizens can discover causes and donate without barriers.

            <h3 className="text-base font-bold text-[#202124]">Key Accessibility Features Implemented</h3>
            - **Keyboard Navigation & Visible Focus**: Every interactive control, modal, and button has high-contrast 2px coral-red focus indicators.
            - **Screen Reader Compatibility**: All campaign progress bars include ARIA live values (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
            - **Accessible Color Contrast**: All text, buttons, and badges maintain at least 4.5:1 contrast ratios against light and dark backgrounds.
            - **Reduced Motion Support**: Carousel and live ticker animations respect user preferences for reduced motion (`prefers-reduced-motion`).
            - **Semantic HTML**: Proper use of landmarks (`header`, `main`, `footer`, `nav`, `article`), accessible form labels, and descriptive image alt tags.
          </div>
        </div>
      </div>
    </div>
  );
}
