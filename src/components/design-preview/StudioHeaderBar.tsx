'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Layout, Smartphone, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';

export function StudioHeaderBar() {
  const pathname = usePathname();

  const isHome = pathname === '/design-preview';
  const isCampaign = pathname === '/design-preview/campaign';
  const isMobile = pathname === '/design-preview/mobile';

  return (
    <div
      data-component="StudioHeaderBar"
      className="sticky top-0 z-50 bg-[#202124] text-white border-b border-neutral-700 shadow-md px-4 py-2.5"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Studio Branding & Mode Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EF4949] text-white font-extrabold uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Design Studio</span>
          </div>
          <span className="text-neutral-300 font-medium hidden sm:inline">
            Rocket.new Visual Edit Mode — Safe Prototyping
          </span>
          <span className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
            <ShieldCheck className="w-3 h-3" />
            Sandbox Isolated (Live DB & Payments Untouched)
          </span>
        </div>

        {/* Center: Quick Route Switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-800 p-1 rounded-xl border border-neutral-700">
          <Link
            href="/design-preview"
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              isHome
                ? 'bg-[#EF4949] text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Homepage</span>
          </Link>

          <Link
            href="/design-preview/campaign"
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              isCampaign
                ? 'bg-[#EF4949] text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Campaign Detail</span>
          </Link>

          <Link
            href="/design-preview/mobile"
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              isMobile
                ? 'bg-[#EF4949] text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device</span>
          </Link>
        </div>

        {/* Right: Exit to Live Site */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1 text-neutral-300 hover:text-white font-medium hover:underline px-2 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
