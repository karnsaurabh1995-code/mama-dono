import React from 'react';
import Link from 'next/link';
import { formatINR, formatTimeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Heart, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { Donation } from '@/lib/types';

interface LiveDonationSectionProps {
  donations: Donation[];
}

export function LiveDonationSection({ donations }: LiveDonationSectionProps) {
  const displayDonations = donations.slice(0, 5);

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Large Editorial Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-neutral-200 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80"
                alt="Live community assistance and verified relief across India"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Live Platform Activity
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  Direct Community Support in Motion
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Every transaction is secured with 256-bit encryption and disbursed directly to verified healthcare providers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Live Giving Feed */}
          <div className="lg:col-span-6 bg-[#202124] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4949] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4949]" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Recent Donation Activity
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">Live Sync</span>
              </div>

              {/* Feed items */}
              <div className="divide-y divide-neutral-800/80 my-3">
                {displayDonations.map((d) => (
                  <div key={d.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 text-[#EF4949] flex items-center justify-center shrink-0">
                        <Heart className="w-3.5 h-3.5 fill-[#EF4949]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {d.isAnonymous ? 'Anonymous Donor' : d.donorName}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[200px] sm:max-w-xs">
                          {d.campaignTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        {formatINR(d.amount)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {formatTimeAgo(d.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant 80G Tax Receipt Generated</span>
              </div>
              <Link href="/campaigns">
                <Button size="sm" className="bg-[#EF4949] hover:bg-[#D93838] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span>Donate Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
