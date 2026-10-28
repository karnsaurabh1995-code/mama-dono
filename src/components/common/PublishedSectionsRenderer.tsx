import React from 'react';
import { PageSection, Campaign } from '@/lib/types';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { FeaturedCausesAndCampaigns } from '@/components/home/FeaturedCausesAndCampaigns';
import { MonthlyDonationSection } from '@/components/home/MonthlyDonationSection';
import { StartCampaignSection } from '@/components/home/StartCampaignSection';
import { OurImpactSection } from '@/components/home/OurImpactSection';
import { TestimonialsCarousel } from '@/components/home/TestimonialsCarousel';
import { HomepageFAQSection } from '@/components/home/HomepageFAQSection';
import { LiveDonationTicker } from '@/components/common/LiveDonationTicker';

interface PublishedSectionsRendererProps {
  sections: PageSection[];
  heroCampaigns?: Campaign[];
  activeCampaigns?: Campaign[];
  featuredCampaigns?: Campaign[];
  missions?: any[];
  stats?: any;
  testimonials?: any[];
  faqs?: any[];
  tickerEvents?: any[];
  siteSettings?: any;
}

export function PublishedSectionsRenderer({
  sections,
  heroCampaigns = [],
  activeCampaigns = [],
  featuredCampaigns = [],
  missions,
  stats,
  testimonials = [],
  faqs = [],
  tickerEvents = [],
  siteSettings,
}: PublishedSectionsRendererProps) {
  const visible = sections.filter((s) => s.isVisible !== false);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((sec) => {
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
                {siteSettings && (
                  <LiveDonationTicker
                    initialEvents={tickerEvents}
                    mode={siteSettings.tickerMode}
                    trustMessages={siteSettings.trustMessages}
                  />
                )}
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
                missions={missions}
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
            return stats ? (
              <OurImpactSection
                key={sec.id}
                stats={stats}
                title={sec.title}
                subtitle={sec.subtitle}
                badge={sec.badge}
              />
            ) : null;

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
      })}
    </>
  );
}
