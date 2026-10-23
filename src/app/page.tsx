import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CampaignSearchBar } from '@/components/home/CampaignSearchBar';
import { CauseGrid } from '@/components/home/CauseGrid';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { ProductCard } from '@/components/product/ProductCard';
import { MissionCard } from '@/components/home/MissionCard';
import { LiveDonationTicker } from '@/components/common/LiveDonationTicker';
import { Button } from '@/components/ui/Button';
import { formatINRCompact } from '@/lib/utils';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Heart,
  TrendingUp,
  FileCheck,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  BadgeCheck,
} from 'lucide-react';

export default function HomePage() {
  const sections = db.getPageSections('home').filter((s) => s.isVisible);
  const urgentCampaigns = db.getCampaigns({ urgent: true, status: 'active' }).slice(0, 3);
  const featuredCampaigns = db.getCampaigns({ featured: true, status: 'active' }).slice(0, 4);
  const products = db.getProducts().slice(0, 3);
  const stories = db.getStories().slice(0, 3);
  const stats = db.getPlatformStats();


  const missions = [
    {
      id: 'm1',
      slug: 'mission-zero-hunger',
      title: 'Mission 1000: Daily Hospital Meals',
      cause: 'food-hunger',
      tagline: 'Provide hot hygienic food to patient attendants outside major municipal cancer hospitals.',
      monthlyAmount: 501,
      supportersCount: 420,
      impactNote: 'Feeds 15 impoverished caregivers every month',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'm2',
      slug: 'mission-girl-scholarship',
      title: 'Mission Shiksha: Educate a Girl Child',
      cause: 'education',
      tagline: 'Sponsor school uniforms, bridge tutoring, and STEM digital tablets in rural eastern UP.',
      monthlyAmount: 1001,
      supportersCount: 310,
      impactNote: 'Covers full schooling and textbooks for 1 girl student',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'm3',
      slug: 'mission-animal-rescue',
      title: 'Mission Karuna: Stray Animal Hospital Care',
      cause: 'animals',
      tagline: 'Fund round-the-clock emergency veterinary surgeries and rehabilitation for injured stray animals.',
      monthlyAmount: 751,
      supportersCount: 260,
      impactNote: 'Sponsors medical treatments and food for 2 rescued dogs',
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Builder section overrides
  const urgentSection = sections.find((s) => s.type === 'urgent_strip');
  const featuredSection = sections.find((s) => s.type === 'featured_campaigns');
  const monthlySection = sections.find((s) => s.type === 'monthly_missions');
  const productSection = sections.find((s) => s.type === 'products');
  const statsSection = sections.find((s) => s.type === 'stats');
  const ctaSection = sections.find((s) => s.type === 'cta_box');
  const categoriesSection = sections.find((s) => s.type === 'categories');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Live Donation Activity Strip */}
      <LiveDonationTicker />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Search Bar Floating Strip */}
      <div className="relative -mt-7 z-30 px-4">
        <CampaignSearchBar />
      </div>

      {/* Cause Categories */}
      {categoriesSection && <CauseGrid />}

      {/* Section D: Urgent Needs */}
      {urgentSection && (
        <section
          className="py-16 border-b border-[#FEE2E2]"
          style={{ backgroundColor: urgentSection.settings.bgColor || '#FFF9F8' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E84B45] bg-[#FFEBEA] px-3 py-1 rounded-full mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E84B45] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E84B45]"></span>
                  </span>
                  <span>{urgentSection.badge || 'Critical Deadlines'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
                  {urgentSection.title}
                </h2>
                <p className="text-sm text-[#555B63] mt-1 max-w-2xl">
                  {urgentSection.subtitle || 'Every minute counts for these patients and emergency relief missions.'}
                </p>
              </div>
              <Link href="/campaigns?filter=urgent" className="text-sm font-semibold text-[#E84B45] hover:underline shrink-0">
                View All Urgent Appeals &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentCampaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section E: Featured Campaigns */}
      {featuredSection && (
        <section
          className="py-16 border-b border-[#E8E6E1]"
          style={{ backgroundColor: featuredSection.settings.bgColor || '#FFFFFF' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E84B45]">
                  {featuredSection.badge || 'Staff Picks'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mt-1">
                  {featuredSection.title}
                </h2>
                <p className="text-sm text-[#555B63] mt-1 max-w-2xl">
                  {featuredSection.subtitle || 'Reviewed campaigns with high transparency, active milestone updates, and documented impact.'}
                </p>
              </div>
              <Link href={featuredSection.ctaLink || '/campaigns'} className="text-sm font-semibold text-[#E84B45] hover:underline shrink-0">
                {featuredSection.ctaText || 'Browse All Campaigns'} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCampaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} featured />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* Section F & G: Browse by Mission & Monthly Giving (Give.do inspired) */}
      <section className="py-16 bg-[#FAF9F6] border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Recurring Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mt-3">
              Become a Monthly Changemaker
            </h2>
            <p className="text-sm text-[#555B63] mt-2 leading-relaxed">
              Recurring giving allows grassroots non-profits to plan long-term missions with stability. Cancel or modify your contribution anytime directly from your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>

          <div className="mt-10 p-6 bg-white rounded-2xl border border-[#E8E6E1] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#202124]">
                  Zero Commitment Risk & Complete Control
                </h4>
                <p className="text-xs text-[#555B63]">
                  Automated recurring debits via UPI Autopay / Cards. One-click cancellation anytime with no questions asked.
                </p>
              </div>
            </div>
            <Link href="/monthly-giving">
              <Button variant="outline" size="sm" className="shrink-0 font-medium">
                Explore All Monthly Missions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section H: Product Giving (DonateKart inspired) */}
      <section className="py-16 bg-white border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Tangible Giving
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mt-2">
                Donate Physical Products & Essential Kits
              </h2>
              <p className="text-sm text-[#555B63] mt-1 max-w-2xl">
                Know exactly where every rupee goes. Sponsor food kits, school supplies, wheelchairs, and blankets procured at wholesale rates and delivered with geotagged photo proof.
              </p>
            </div>
            <Link href="/product-giving" className="text-sm font-semibold text-[#E84B45] hover:underline shrink-0">
              View Product Giving Catalog &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Section I: How It Works Dual Journey */}
      <section className="py-16 bg-[#FAF9F6] border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E84B45]">
              Step-by-Step Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mt-2">
              How SevaSetu Works
            </h2>
            <p className="text-sm text-[#555B63] mt-2">
              A trusted bridge connecting compassionate donors with genuine causes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donor Journey */}
            <div className="bg-white p-7 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EF] text-[#E84B45] flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-[#E84B45]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#202124]">For Donors</h3>
                  <p className="text-xs text-[#555B63]">Simple, safe, and 100% tax-deductible giving</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1', title: 'Discover a Verified Cause', desc: 'Browse verified medical emergencies, monthly missions, or essential products.' },
                  { step: '2', title: 'Review Real Estimates', desc: 'Inspect doctor letters, hospital estimate certificates, or NGO 12A/80G documents.' },
                  { step: '3', title: 'Secure Instant Checkout', desc: 'Pay seamlessly via UPI (GPay/PhonePe), NetBanking, or Cards via Razorpay.' },
                  { step: '4', title: 'Receive Instant 80G Receipt', desc: 'Get immediate tax exemption receipt (Form 10BE compliant) and follow patient updates.' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E8E6E1] text-[#E84B45] font-bold text-xs flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#202124]">{item.title}</h4>
                      <p className="text-xs text-[#555B63] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fundraiser Journey */}
            <div className="bg-white p-7 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#25845B] flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#202124]">For Fundraisers & NGOs</h3>
                  <p className="text-xs text-[#555B63]">Raise emergency funds with zero platform fee</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1', title: 'Start a Campaign in 5 Minutes', desc: 'Choose your cause, set target amount, and enter patient or project background.' },
                  { step: '2', title: 'Upload Proof Documents', desc: 'Submit hospital estimate letters, doctor notes, or NGO registration certificates.' },
                  { step: '3', title: 'Review & Swift Verification', desc: 'Our compliance team verifies authenticity with hospitals/institutions in hours.' },
                  { step: '4', title: 'Direct Hospital/Vendor Payout', desc: 'Receive transparent disbursements directly to hospital or verified vendor accounts.' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E8E6E1] text-[#25845B] font-bold text-xs flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#202124]">{item.title}</h4>
                      <p className="text-xs text-[#555B63] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section J: Trust & Transparency Safeguards */}
      <section className="py-16 bg-white border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#25845B]">
              Rigorous Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mt-2">
              Why Donors & NGOs Trust SevaSetu
            </h2>
            <p className="text-sm text-[#555B63] mt-2">
              We uphold strict factual standards and verified operational practices across every campaign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#E84B45]">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#202124]">
                100% Medical Verification
              </h4>
              <p className="text-xs text-[#555B63] leading-relaxed">
                Hospital billing estimates, consultant doctor stamps, and UHID numbers are checked directly with hospital patient accounts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#25845B]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#202124]">
                Section 80G Tax Benefits
              </h4>
              <p className="text-xs text-[#555B63] leading-relaxed">
                Eligible donations receive immediate 80G certificates. Donors can claim up to 50% tax deductions on income tax filings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-blue-600">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#202124]">
                Direct Hospital Disbursements
              </h4>
              <p className="text-xs text-[#555B63] leading-relaxed">
                For major medical fundraisers, funds are transferred straight to hospital accounts or registered pharmacy bills to prevent diversion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-amber-600">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#202124]">
                Audited NGOs & Darpan ID
              </h4>
              <p className="text-xs text-[#555B63] leading-relaxed">
                All non-profit partners must furnish verified MCA filings, 12A/80G URNs, and active NITI Aayog NGO-Darpan portal credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section K: Real Platform Impact Metrics */}
      <section className="py-14 bg-gradient-to-br from-[#202124] to-[#151618] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-[#E84B45]">
                {formatINRCompact(stats.totalRaised)}
              </div>
              <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
                Direct Aid Raised
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.totalDonorsCount}+
              </div>
              <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
                Verified Donors
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.verifiedNGOs}
              </div>
              <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
                Audited Partner NGOs
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {stats.documentedBeneficiaries.toLocaleString('en-IN')}+
              </div>
              <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
                Beneficiaries Reached
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section M: Stories of Real Impact */}
      <section className="py-16 bg-[#FAF9F6] border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E84B45]">
                Field Updates
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight mt-1">
                Real Stories of Lives Transformed
              </h2>
              <p className="text-sm text-[#555B63] mt-1 max-w-2xl">
                Read how community generosity has restored vision, funded lifesaving cancer therapies, and brought water to arid villages.
              </p>
            </div>
            <Link href="/stories" className="text-sm font-semibold text-[#E84B45] hover:underline shrink-0">
              Read All Impact Stories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-md capitalize">
                        {story.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[#202124] leading-snug group-hover:text-[#E84B45] transition-colors">
                      <Link href={`/stories/${story.slug}`}>
                        {story.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#555B63] line-clamp-2 leading-relaxed">
                      {story.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-neutral-100 mt-2">
                  <div className="grid grid-cols-3 gap-1 py-3 text-center bg-[#FAF9F6] rounded-xl text-[11px]">
                    {story.impactMetrics.map((m, idx) => (
                      <div key={idx}>
                        <div className="font-bold text-[#202124]">{m.value}</div>
                        <div className="text-[10px] text-neutral-400">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/stories/${story.slug}`}
                    className="mt-3 block text-center text-xs font-semibold text-[#E84B45] hover:underline"
                  >
                    Read Full Story &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section N: Start a Campaign CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#202124] via-[#2D2E33] to-[#202124] text-white p-8 sm:p-12 overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="bg-[#E84B45] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Zero Platform Fee for Medical Emergencies
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Need Urgent Financial Help for a Surgery or Social Cause?
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Launch your verified fundraiser on SevaSetu in under 10 minutes. Our medical social workers assist you with hospital verification and rapid campaign approvals.
              </p>
              <div className="pt-2 flex items-center gap-4 flex-wrap">
                <Link href="/start-campaign">
                  <Button variant="primary" size="lg" className="font-bold">
                    Start a Fundraiser Now
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    Learn How It Works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Decorative background shape */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#E84B45]/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
