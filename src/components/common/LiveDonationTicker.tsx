'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { DokindMark } from './DokindLogo';

export interface TickerEvent {
  id: string;
  displayName: string;
  amountFormatted: string;
  campaignTitle: string;
  campaignSlug: string;
  timeAgo: string;
  isRecurring?: boolean;
}

interface LiveDonationTickerProps {
  initialEvents?: TickerEvent[];
  mode?: 'live_donations' | 'trust_messages' | 'hybrid';
  trustMessages?: string[];
  className?: string;
}

const DEFAULT_TRUST_MESSAGES = [
  '100% Tax Deductible under Section 80G with Instant Receipts',
  'Direct Hospital & Verified NGO Escrow Disbursements',
  'Zero Platform Fee On Emergency Pediatric & Cancer Surgeries',
  'Wholesale Item Giving With Zero Markup & Live Tracking',
  'NITI Aayog NGO-Darpan Verified Grassroots Partners',
];

export function LiveDonationTicker({
  initialEvents,
  mode: propMode,
  trustMessages: propTrustMessages,
  className = '',
}: LiveDonationTickerProps) {
  const [events, setEvents] = useState<TickerEvent[]>(initialEvents || []);
  const [tickerMode, setTickerMode] = useState<'live_donations' | 'trust_messages' | 'hybrid'>(
    propMode || 'live_donations'
  );
  const [trustMessages, setTrustMessages] = useState<string[]>(
    propTrustMessages && propTrustMessages.length > 0 ? propTrustMessages : DEFAULT_TRUST_MESSAGES
  );
  const [isPaused, setIsPaused] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTicker() {
      try {
        const res = await fetch('/api/donations/ticker');
        const data = await res.json();
        if (isMounted) {
          if (data.enabled === false) {
            setEnabled(false);
            return;
          }
          setEnabled(true);
          if (data.events && Array.isArray(data.events)) {
            setEvents(data.events);
          }
          if (data.tickerMode && !propMode) {
            setTickerMode(data.tickerMode);
          }
          if (data.trustMessages && Array.isArray(data.trustMessages) && !propTrustMessages) {
            setTrustMessages(data.trustMessages);
          }
        }
      } catch (err) {
        console.error('Failed to load donation ticker', err);
      }
    }

    if (!initialEvents || initialEvents.length === 0) {
      fetchTicker();
    }
    const interval = setInterval(fetchTicker, 25000); // 25s background refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [initialEvents, propMode, propTrustMessages]);

  if (!enabled) {
    return null;
  }

  // Generate scroll items based on configured mode
  type TickerItem =
    | { type: 'donation'; data: TickerEvent }
    | { type: 'trust'; message: string };

  let items: TickerItem[] = [];

  if (tickerMode === 'trust_messages' || (tickerMode === 'live_donations' && events.length === 0)) {
    // Mode 2: Trust and assurance messages
    items = trustMessages.map((msg) => ({ type: 'trust', message: msg }));
  } else if (tickerMode === 'hybrid') {
    // Mode 3: Hybrid interleaving
    const maxLen = Math.max(events.length, trustMessages.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < events.length) {
        items.push({ type: 'donation', data: events[i] });
      }
      if (i < trustMessages.length) {
        items.push({ type: 'trust', message: trustMessages[i] });
      }
    }
  } else {
    // Mode 1: Genuine verified live donations
    items = events.map((evt) => ({ type: 'donation', data: evt }));
    // If fewer than 4 events, augment with trust messages for continuous loop
    if (items.length < 4) {
      trustMessages.forEach((msg) => items.push({ type: 'trust', message: msg }));
    }
  }

  if (items.length === 0) {
    return null;
  }

  // Duplicate for smooth seamless CSS infinite marquee (-50% translation)
  const displayItems = [...items, ...items, ...items];

  return (
    <div
      role="region"
      aria-label="dokind Live Giving and Trust Ticker"
      className={`w-full bg-[#FAF9F6] border-y border-[#E8E6E1] py-2.5 overflow-hidden select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Left subtle fade mask */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAF9F6] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Strip */}
        <div
          className={`flex items-center shrink-0 ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{ willChange: 'transform' }}
        >
          {displayItems.map((item, idx) => (
            <div key={`${idx}`} className="inline-flex items-center shrink-0">
              {item.type === 'donation' ? (
                <Link
                  href={`/campaigns/${item.data.campaignSlug}`}
                  className="inline-flex items-center gap-2 px-4 hover:text-[#EF4949] transition-colors text-xs sm:text-sm text-[#202124] group cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-[#EF4949] fill-[#EF4949] shrink-0" />
                  <span className="font-semibold text-[#202124] group-hover:text-[#EF4949]">
                    {item.data.displayName}
                  </span>
                  <span className="text-[#62666D]">donated</span>
                  <span className="font-bold text-[#202124] bg-white px-1.5 py-0.5 rounded border border-[#E8E6E1] shadow-2xs">
                    {item.data.amountFormatted}
                  </span>
                  <span className="text-[#62666D] max-w-[160px] sm:max-w-[220px] truncate">
                    for {item.data.campaignTitle}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    ({item.data.timeAgo})
                  </span>
                </Link>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 text-xs sm:text-sm text-[#202124] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[#202124] tracking-tight">{item.message}</span>
                </div>
              )}

              {/* DonateKart-Inspired Brand Mark Separator */}
              <div className="inline-flex items-center px-3 text-neutral-300 pointer-events-none" aria-hidden="true">
                <DokindMark size={14} className="opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Right subtle fade mask */}
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAF9F6] to-transparent z-10 pointer-events-none" />
      </div>
    </div>
  );
}
