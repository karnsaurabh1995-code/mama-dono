'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Activity, Pause, Play, Sparkles } from 'lucide-react';

interface TickerEvent {
  id: string;
  displayName: string;
  amountFormatted: string;
  campaignTitle: string;
  campaignSlug: string;
  timeAgo: string;
  isRecurring?: boolean;
}

export function LiveDonationTicker() {
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTicker() {
      try {
        const res = await fetch('/api/donations/ticker');
        const data = await res.json();
        if (isMounted && data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to load donation ticker', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTicker();
    const interval = setInterval(fetchTicker, 20000); // 20s refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading || events.length === 0) {
    return null;
  }

  // Duplicate events for smooth infinite loop
  const displayEvents = [...events, ...events];

  return (
    <div
      role="region"
      aria-label="Live Donation Activity"
      className="bg-[#FFF8F7] border-b border-[#FEE2E2] text-xs py-2 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        {/* Ticker Badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-[#E84B45] text-white px-2.5 py-1 rounded-full font-medium shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Activity className="w-3 h-3" />
          <span className="text-[11px] font-semibold tracking-wide uppercase">Live Giving</span>
        </div>

        {/* Scrolling Items */}
        <div
          className="flex-1 overflow-hidden relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`flex items-center gap-8 ${
              isPaused ? '' : 'animate-marquee'
            }`}
          >
            {displayEvents.map((evt, idx) => (
              <Link
                key={`${evt.id}-${idx}`}
                href={`/campaigns/${evt.campaignSlug}`}
                className="inline-flex items-center gap-2 hover:underline shrink-0 group text-[#202124]"
              >
                <Heart className="w-3.5 h-3.5 text-[#E84B45] fill-[#E84B45] shrink-0" />
                <span className="font-semibold text-[#202124]">{evt.displayName}</span>
                <span className="text-[#555B63]">donated</span>
                <span className="font-bold text-[#E84B45] bg-white px-1.5 py-0.5 rounded border border-[#FFD0CC]">
                  {evt.amountFormatted}
                </span>
                <span className="text-[#555B63] max-w-[200px] sm:max-w-xs truncate">
                  for {evt.campaignTitle}
                </span>
                <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                  {evt.timeAgo}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Control Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="shrink-0 p-1 text-[#555B63] hover:text-[#202124] rounded focus:outline-none"
          title={isPaused ? 'Resume live ticker' : 'Pause ticker'}
          aria-label={isPaused ? 'Resume live ticker' : 'Pause ticker'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
