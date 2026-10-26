export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import React from 'react';
import Link from 'next/link';
import { MissionCard } from '@/components/home/MissionCard';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Repeat, ChevronRight, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export const MISSIONS = [
  {
    id: 'mission-zero-hunger',
    slug: 'mission-zero-hunger',
    title: 'Mission 1000: Daily Hospital Meals',
    cause: 'food-hunger',
    tagline: 'Provide hot hygienic food to patient attendants outside major municipal cancer hospitals in Mumbai.',
    monthlyAmount: 501,
    supportersCount: 420,
    impactNote: 'Feeds 15 impoverished caregivers every month',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    description: 'Every morning outside KEM and Tata Memorial hospitals, thousands of low-income families stand by patients battling severe illnesses. Your monthly support ensures hot wholesome meals are cooked and distributed daily.',
  },
  {
    id: 'mission-girl-scholarship',
    slug: 'mission-girl-scholarship',
    title: 'Mission Shiksha: Educate a Girl Child',
    cause: 'education',
    tagline: 'Sponsor school uniforms, bridge tutoring, and STEM digital tablets for rural girl students in UP.',
    monthlyAmount: 1001,
    supportersCount: 310,
    impactNote: 'Covers full schooling and textbooks for 1 girl student',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    description: 'Provide an underprivileged girl student with textbooks, uniforms, after-school mentoring, and digital tablet access so she remains in school and avoids early marriage.',
  },
  {
    id: 'mission-animal-rescue',
    slug: 'mission-animal-rescue',
    title: 'Mission Karuna: Stray Animal Hospital Care',
    cause: 'animals',
    tagline: 'Fund round-the-clock emergency veterinary surgeries and rehabilitation for injured stray animals.',
    monthlyAmount: 751,
    supportersCount: 260,
    impactNote: 'Sponsors medical treatments and food for 2 rescued dogs',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    description: 'Rescuing injured community animals, providing critical orthopedic fracture repairs, and feeding 250 sanctuary animals in Bengaluru.',
  },
  {
    id: 'mission-elderly-care',
    slug: 'mission-elderly-care',
    title: 'Mission Sahara: Dignified Elderly Healthcare',
    cause: 'elderly',
    tagline: 'Sponsor monthly doctor visits, geriatric medicines, and warm meals for abandoned elders.',
    monthlyAmount: 851,
    supportersCount: 195,
    impactNote: 'Provides full monthly medications for 2 senior citizens',
    imageUrl: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80',
    description: 'Abandoned seniors often suffer in silence from hypertension, diabetes, and joint disorders. Your monthly support sends mobile geriatric health vans with prescription medicines directly to old-age shelter homes.',
  },
];

export default function MonthlyGivingPage() {
  const publishedSections = db.getPublishedPageSections('monthly-giving');
  const heroSec = publishedSections.find((s) => s.type === 'hero' && s.isVisible !== false);
  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Monthly Giving Missions</span>
        </nav>

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#172554] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="bg-blue-500/30 text-blue-200 border border-blue-400/40 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5" />
              <span>{heroSec?.badge || 'Give.do Inspired Sustained Impact'}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {heroSec?.title || 'Small Monthly Gifts. Lifelong Transformation.'}
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              {heroSec?.subtitle || 'When you give monthly, non-profits spend less time fundraising and more time curing illnesses, teaching children, and feeding families. Cancel or pause anytime in 1 click.'}
            </p>
          </div>
        </div>

        {/* Missions Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[#202124]">Active Monthly Missions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MISSIONS.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </div>
        </div>

        {/* Why Monthly Giving Matters */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-8 shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-[#202124] text-center">
            How Monthly Giving Works & Your Peace of Mind
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#555B63]">
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-[#202124]">Automated Seamless Debits</h4>
              <p>
                Set up recurring auto-debit via UPI Autopay, Debit Cards, or Credit Cards with standard RBI compliant e-mandates.
              </p>
            </div>
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-sm font-bold text-[#202124]">Monthly Field Impact Reports</h4>
              <p>
                Every month, you receive a direct photo & video report showing the exact students, patients, or animals your gift sustained.
              </p>
            </div>
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-sm font-bold text-[#202124]">Zero Lock-in, 1-Click Cancel</h4>
              <p>
                You retain complete control. Pause, increase, decrease amount, or cancel anytime directly in your donor dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
