'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone, RotateCw, Monitor, CheckCircle2 } from 'lucide-react';
import { PreviewUtilityBar } from '@/components/design-preview/PreviewUtilityBar';
import { PreviewMainHeader } from '@/components/design-preview/PreviewMainHeader';
import { PreviewHeroCarousel } from '@/components/design-preview/PreviewHeroCarousel';
import { PreviewCampaignGrid } from '@/components/design-preview/PreviewCampaignGrid';
import { PreviewMonthlySection } from '@/components/design-preview/PreviewMonthlySection';
import { PreviewStartCampaignBanner } from '@/components/design-preview/PreviewStartCampaignBanner';
import { PreviewImpactSection } from '@/components/design-preview/PreviewImpactSection';
import { PreviewDualDonationModule } from '@/components/design-preview/PreviewDualDonationModule';
import { PreviewFooter } from '@/components/design-preview/PreviewFooter';

export default function DesignStudioMobilePage() {
  const [deviceWidth, setDeviceWidth] = useState<'390' | '414' | '100%'>('390');
  const [activeScreen, setActiveScreen] = useState<'home' | 'campaign'>('home');

  return (
    <div data-preview-page="mobile-simulator" className="min-h-screen bg-neutral-900 py-6 px-2 sm:px-4">
      {/* Simulator Device Controls Bar */}
      <div className="max-w-4xl mx-auto mb-6 bg-neutral-800 border border-neutral-700 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EF4949] flex items-center justify-center text-white shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Mobile Viewport Simulator</h3>
            <p className="text-[11px] text-neutral-400">
              Verify touch ergonomics, sticky bar clearance, and responsive wrapping.
            </p>
          </div>
        </div>

        {/* Screen Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveScreen('home')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                activeScreen === 'home' ? 'bg-[#EF4949] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Homepage
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('campaign')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                activeScreen === 'campaign' ? 'bg-[#EF4949] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Campaign Detail
            </button>
          </div>

          {/* Width Selector */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-700 text-xs font-mono">
            <button
              type="button"
              onClick={() => setDeviceWidth('390')}
              className={`px-2.5 py-1.5 rounded-lg cursor-pointer ${
                deviceWidth === '390' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
              }`}
            >
              390px
            </button>
            <button
              type="button"
              onClick={() => setDeviceWidth('414')}
              className={`px-2.5 py-1.5 rounded-lg cursor-pointer ${
                deviceWidth === '414' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
              }`}
            >
              414px
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Device Frame */}
      <div className="flex justify-center pb-12">
        <div
          style={{ width: deviceWidth === '100%' ? '100%' : `${deviceWidth}px` }}
          className="bg-[#FAF9F6] rounded-[40px] shadow-2xl border-8 border-neutral-800 overflow-hidden min-h-[844px] transition-all duration-300 relative"
        >
          {/* Simulated Speaker / Camera Notch */}
          <div className="w-32 h-4 bg-neutral-800 mx-auto rounded-b-xl mb-1" />

          {/* Render Active Screen Inside Mobile Viewport */}
          {activeScreen === 'home' ? (
            <div className="overflow-x-hidden">
              <PreviewUtilityBar />
              <PreviewMainHeader />
              <PreviewHeroCarousel />
              <PreviewCampaignGrid />
              <PreviewMonthlySection />
              <PreviewStartCampaignBanner />
              <PreviewImpactSection />
              <PreviewFooter />
            </div>
          ) : (
            <div className="overflow-x-hidden p-3 space-y-4">
              <PreviewUtilityBar />
              <PreviewMainHeader />
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#EF4949] uppercase bg-[#FFF0EF] px-2.5 py-1 rounded-full">
                  Medical
                </span>
                <h1 className="text-xl font-black text-[#202124] mt-2">
                  Save 4-Year-Old Aarav: Leukemia Treatment
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  AIIMS New Delhi • 420 Donors • ₹7.8L Raised
                </p>
              </div>

              {/* Dual Donation Module */}
              <PreviewDualDonationModule />
              <PreviewFooter />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
