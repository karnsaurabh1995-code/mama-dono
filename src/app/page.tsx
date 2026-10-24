import React from 'react';
import { db } from '@/lib/db';
import { formatINR, formatTimeAgo } from '@/lib/utils';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { FeaturedCausesAndCampaigns } from '@/components/home/FeaturedCausesAndCampaigns';
import { MonthlyDonationSection } from '@/components/home/MonthlyDonationSection';
import { StartCampaignSection } from '@/components/home/StartCampaignSection';
import { OurImpactSection } from '@/components/home/OurImpactSection';
import { TestimonialsCarousel } from '@/components/home/TestimonialsCarousel';
import { HomepageFAQSection } from '@/components/home/HomepageFAQSection';
import { AwardsAndMediaSection } from '@/components/home/AwardsAndMediaSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { LiveDonationTicker } from '@/components/common/LiveDonationTicker';

export default function HomePage() {
  const activeCampaigns = db.getCampaigns({ status: 'active' });
  const stats = db.getPlatformStats();
  const testimonials = db.getTestimonials();
  const recentDonations = db.getDonations({ status: 'succeeded' });
  const faqs = db.getFAQs(undefined, true, true);
  const siteSettings = db.getSiteSettings();

  const initialTickerEvents = recentDonations.slice(0, 15).map((d) => {
    let displayName = 'Anonymous Donor';
    if (!d.isAnonymous && d.donorName) {
      const parts = d.donorName.trim().split(' ');
      if (parts.length > 1) {
        displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
      } else {
        displayName = parts[0];
      }
    }
    return {
      id: d.id,
      displayName,
      amountFormatted: formatINR(d.amount),
      campaignTitle: d.campaignTitle,
      campaignSlug: d.campaignSlug,
      timeAgo: formatTimeAgo(d.createdAt),
      isRecurring: d.isRecurring,
    };
  });

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Campaign Carousel (True Hope Foundation Split Layout) */}
      <HeroCarousel />

      {/* 2. Full-Width Horizontal Live Donation & Trust Ticker (DonateKart Reference - Directly beneath Hero) */}
      <div className="mt-4 sm:mt-6">
        <LiveDonationTicker
          initialEvents={initialTickerEvents}
          mode={siteSettings.tickerMode}
          trustMessages={siteSettings.trustMessages}
        />
      </div>

      {/* 3. Featured Cause and Campaign Discovery Section */}
      <FeaturedCausesAndCampaigns initialCampaigns={activeCampaigns} />

      {/* 4. Monthly Donation Programs Section */}
      <MonthlyDonationSection missions={missions} />

      {/* 5. Start a Campaign Promotional Section */}
      <StartCampaignSection />

      {/* 6. Our Impact Statistics and Beneficiary Image */}
      <OurImpactSection stats={stats} />

      {/* 7. Donor Testimonials Carousel */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* 8. Administrator-Controlled FAQ Section (Questions About Giving?) */}
      <HomepageFAQSection faqs={faqs} />

      {/* 9. Featured In National Media Mentions */}
      <AwardsAndMediaSection />

      {/* 10. Newsletter Subscription Banner */}
      <NewsletterSection />
    </div>
  );
}
