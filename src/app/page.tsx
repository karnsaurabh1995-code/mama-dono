import React from 'react';
import { db } from '@/lib/db';
import { formatINR, formatTimeAgo } from '@/lib/utils';
import { Campaign, PageSection } from '@/lib/types';
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

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const activeCampaigns = db.getCampaigns({ status: 'active' });
  const stats = db.getPlatformStats();
  const testimonials = db.getTestimonials();
  const recentDonations = db.getDonations({ status: 'succeeded' });
  const faqs = db.getFAQs(undefined, true, true);
  const siteSettings = db.getSiteSettings();
  const curation = db.getHomepageCuration();
  const publishedSections = db.getPublishedPageSections('home');

  // Curated Hero Campaigns
  const heroCampaigns = (curation.heroCampaignIds || [])
    .map((id) => activeCampaigns.find((c) => c.id === id || c.slug === id))
    .filter((c): c is Campaign => Boolean(c));

  // Curated Featured Campaigns (for Cause & Campaign Grid)
  const featuredCampaigns = (curation.featuredCampaignIds || [])
    .map((id) => activeCampaigns.find((c) => c.id === id || c.slug === id))
    .filter((c): c is Campaign => Boolean(c));

  const allMissions = db.getMonthlyMissions({ isActive: true });

  const curatedMissions = (curation.monthlyMissionIds || [])
    .map((id) => allMissions.find((m) => m.id === id || m.slug === id))
    .filter((m): m is (typeof allMissions)[0] => Boolean(m));

  const displayMissions = curatedMissions.length > 0 ? curatedMissions : allMissions.slice(0, 3);

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

  const renderSection = (sec: PageSection) => {
    switch (sec.type) {
      case 'hero':
        return (
          <HeroCarousel
            key={sec.id}
            initialCampaigns={heroCampaigns.length > 0 ? heroCampaigns : undefined}
            title={sec.title}
            subtitle={sec.subtitle}
            badge={sec.badge}
            ctaText={sec.ctaText}
            ctaLink={sec.ctaLink}
            settings={sec.settings}
          />
        );
      case 'urgent_strip':
        return (
          <div className="mt-4 sm:mt-6" key={sec.id}>
            <LiveDonationTicker
              initialEvents={initialTickerEvents}
              mode={siteSettings.tickerMode}
              trustMessages={siteSettings.trustMessages}
            />
          </div>
        );
      case 'categories':
      case 'featured_campaigns':
      case 'products':
        return (
          <FeaturedCausesAndCampaigns
            key={sec.id}
            initialCampaigns={featuredCampaigns.length > 0 ? featuredCampaigns : activeCampaigns}
            title={sec.title}
            subtitle={sec.subtitle}
            badge={sec.badge}
            ctaText={sec.ctaText}
            ctaLink={sec.ctaLink}
            itemLimit={sec.settings?.itemLimit}
          />
        );
      case 'monthly_missions':
        return (
          <MonthlyDonationSection
            key={sec.id}
            missions={displayMissions}
            title={sec.title}
            subtitle={sec.subtitle}
            badge={sec.badge}
            ctaText={sec.ctaText}
            ctaLink={sec.ctaLink}
          />
        );
      case 'cta_box':
        return (
          <StartCampaignSection
            key={sec.id}
            title={sec.title}
            subtitle={sec.subtitle}
            badge={sec.badge}
            ctaText={sec.ctaText}
            ctaLink={sec.ctaLink}
          />
        );
      case 'stats':
        return (
          <OurImpactSection
            key={sec.id}
            stats={stats}
            title={sec.title}
            subtitle={sec.subtitle}
            badge={sec.badge}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsCarousel
            key={sec.id}
            testimonials={testimonials}
            title={sec.title}
            subtitle={sec.subtitle}
            badge={sec.badge}
          />
        );
      case 'faq':
        return (
          <HomepageFAQSection
            key={sec.id}
            faqs={faqs}
            title={sec.title}
            subtitle={sec.subtitle}
            badge={sec.badge}
          />
        );
      default:
        return null;
    }
  };

  const visibleSections = publishedSections.filter((s) => s.isVisible !== false);

  return (
    <div className="flex flex-col min-h-screen">
      {visibleSections.length > 0 ? (
        visibleSections.map(renderSection)
      ) : (
        <>
          {/* 1. Hero Campaign Carousel */}
          <HeroCarousel initialCampaigns={heroCampaigns.length > 0 ? heroCampaigns : undefined} />

          {/* 2. Full-Width Horizontal Live Donation & Trust Ticker */}
          <div className="mt-4 sm:mt-6">
            <LiveDonationTicker
              initialEvents={initialTickerEvents}
              mode={siteSettings.tickerMode}
              trustMessages={siteSettings.trustMessages}
            />
          </div>

          {/* 3. Featured Cause and Campaign Discovery Section */}
          <FeaturedCausesAndCampaigns
            initialCampaigns={featuredCampaigns.length > 0 ? featuredCampaigns : activeCampaigns}
          />

          {/* 4. Monthly Donation Programs Section */}
          <MonthlyDonationSection missions={displayMissions} />

          {/* 5. Start a Campaign Promotional Section */}
          <StartCampaignSection />

          {/* 6. Our Impact Statistics and Beneficiary Image */}
          <OurImpactSection stats={stats} />

          {/* 7. Donor Testimonials Carousel */}
          <TestimonialsCarousel testimonials={testimonials} />

          {/* 8. Administrator-Controlled FAQ Section */}
          <HomepageFAQSection faqs={faqs} />
        </>
      )}

      {/* 9. Featured In National Media Mentions */}
      <AwardsAndMediaSection />

      {/* 10. Newsletter Subscription Banner */}
      <NewsletterSection />
    </div>
  );
}
