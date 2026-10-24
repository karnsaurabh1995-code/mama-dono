import React from 'react';
import Link from 'next/link';
import { DokindLogo } from '@/components/common/DokindLogo';
import { Search, Heart, Package, Shield, CalendarHeart, Menu } from 'lucide-react';

export function PreviewMainHeader() {
  return (
    <header
      data-component="PreviewMainHeader"
      className="bg-white border-b border-[#E8E6E1] sticky top-10 z-40 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/design-preview" className="shrink-0 flex items-center">
          <DokindLogo size="md" />
        </Link>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#202124]">
          <Link
            href="/design-preview"
            className="text-[#EF4949] hover:text-[#D93838] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/campaigns"
            className="hover:text-[#EF4949] transition-colors flex items-center gap-1.5"
          >
            <span>Explore Causes</span>
          </Link>
          <Link
            href="/monthly-giving"
            className="hover:text-[#EF4949] transition-colors flex items-center gap-1"
          >
            <CalendarHeart className="w-3.5 h-3.5 text-blue-600" />
            <span>Monthly Giving</span>
          </Link>
          <Link
            href="/product-giving"
            className="hover:text-[#EF4949] transition-colors flex items-center gap-1"
          >
            <Package className="w-3.5 h-3.5 text-amber-600" />
            <span>Product Giving</span>
          </Link>
          <Link
            href="/how-it-works"
            className="hover:text-[#EF4949] transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="/about"
            className="hover:text-[#EF4949] transition-colors"
          >
            Our Impact
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Inline Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search campaigns, causes..."
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#202124] focus:outline-hidden focus:border-[#EF4949] focus:bg-white transition"
              readOnly
            />
          </div>

          <Link
            href="/design-preview/campaign"
            className="px-4 py-2 rounded-xl bg-[#EF4949] hover:bg-[#D93838] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Donate Now</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
