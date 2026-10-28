import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Repeat, ShieldCheck, Users, ArrowRight } from 'lucide-react';

interface MissionProps {
  id: string;
  slug: string;
  title: string;
  cause: string;
  tagline: string;
  monthlyAmount: number;
  supportersCount: number;
  impactNote: string;
  imageUrl: string;
}

export function MissionCard({ mission }: { mission: MissionProps }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Cover */}
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
          <img
            src={mission.imageUrl}
            alt={mission.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <Repeat className="w-3 h-3" />
              <span>Monthly Mission</span>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#555B63]">
            <ShieldCheck className="w-4 h-4 text-[#25845B]" />
            <span>Audited NGO Program</span>
          </div>

          <h3 className="text-base font-bold text-[#202124] leading-snug">
            {mission.title}
          </h3>

          <p className="text-xs text-[#555B63] leading-relaxed">
            {mission.tagline}
          </p>

          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] text-xs space-y-1">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Your Monthly Impact:
            </div>
            <div className="font-semibold text-[#202124]">
              {mission.impactNote}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 pt-0 border-t border-neutral-100 mt-2 space-y-3">
        <div className="flex items-center justify-between text-xs pt-3">
          <span className="flex items-center gap-1 text-[#555B63]">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span>{mission.supportersCount} monthly donors</span>
          </span>
          <span className="font-bold text-[#202124]">
            Starts at {formatINR(mission.monthlyAmount)}/mo
          </span>
        </div>

        <Link href={`/monthly-giving/${mission.slug}`} className="block w-full">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center font-bold inline-flex items-center gap-2 whitespace-nowrap"
            rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
          >
            <span>Join Mission</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
