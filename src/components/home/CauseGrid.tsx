import React from 'react';
import Link from 'next/link';
import { CAUSES_DATA } from '@/lib/data/causes';
import {
  HeartPulse,
  GraduationCap,
  Baby,
  UtensilsCrossed,
  Accessibility,
  Users,
  PawPrint,
  ShieldAlert,
  Sparkles,
  Trees,
  PackageCheck,
  Building2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse className="w-6 h-6 text-[#E84B45]" />,
  GraduationCap: <GraduationCap className="w-6 h-6 text-blue-600" />,
  Baby: <Baby className="w-6 h-6 text-pink-500" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6 text-amber-600" />,
  Accessibility: <Accessibility className="w-6 h-6 text-teal-600" />,
  Users: <Users className="w-6 h-6 text-indigo-600" />,
  PawPrint: <PawPrint className="w-6 h-6 text-orange-600" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-red-600" />,
  Sparkles: <Sparkles className="w-6 h-6 text-purple-600" />,
  Trees: <Trees className="w-6 h-6 text-emerald-600" />,
  PackageCheck: <PackageCheck className="w-6 h-6 text-amber-700" />,
  Building2: <Building2 className="w-6 h-6 text-cyan-700" />,
};

export function CauseGrid() {
  return (
    <section className="py-14 bg-white border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E84B45]">
              Explore Causes
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mt-1">
              Choose a Cause Close to Your Heart
            </h2>
          </div>
          <Link
            href="/causes"
            className="text-sm font-semibold text-[#E84B45] hover:text-[#BD302D] inline-flex items-center gap-1 group"
          >
            <span>View All Causes</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        {/* 12-category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {CAUSES_DATA.map((cause) => {
            const iconNode = ICON_MAP[cause.icon] || <HeartPulse className="w-6 h-6 text-[#E84B45]" />;
            return (
              <Link
                key={cause.id}
                href={`/causes/${cause.slug}`}
                className="group p-4 bg-[#FAF9F6] hover:bg-white rounded-xl border border-[#E8E6E1] hover:border-[#E84B45]/40 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-[#FFF0EF] border border-[#E8E6E1] flex items-center justify-center mb-2.5 transition-colors shadow-2xs">
                  {iconNode}
                </div>
                <span className="text-xs font-bold text-[#202124] group-hover:text-[#E84B45] transition-colors leading-tight line-clamp-1">
                  {cause.name}
                </span>
                <span className="text-[11px] text-[#555B63] mt-1 font-medium">
                  {cause.campaignCount} active
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
