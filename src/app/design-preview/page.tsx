import React from 'react';
import { PreviewUtilityBar } from '@/components/design-preview/PreviewUtilityBar';
import { PreviewMainHeader } from '@/components/design-preview/PreviewMainHeader';
import { PreviewHeroCarousel } from '@/components/design-preview/PreviewHeroCarousel';
import { PreviewCampaignGrid } from '@/components/design-preview/PreviewCampaignGrid';
import { PreviewMonthlySection } from '@/components/design-preview/PreviewMonthlySection';
import { PreviewStartCampaignBanner } from '@/components/design-preview/PreviewStartCampaignBanner';
import { PreviewImpactSection } from '@/components/design-preview/PreviewImpactSection';
import { PreviewTestimonialsCarousel } from '@/components/design-preview/PreviewTestimonialsCarousel';
import { PreviewDonationActivity } from '@/components/design-preview/PreviewDonationActivity';
import { PreviewAwardsAndMedia } from '@/components/design-preview/PreviewAwardsAndMedia';
import { PreviewNewsletter } from '@/components/design-preview/PreviewNewsletter';
import { PreviewFooter } from '@/components/design-preview/PreviewFooter';

export default function DesignStudioHomePage() {
  return (
    <div data-preview-page="homepage" className="flex flex-col min-h-screen">
      {/* 1. Slim Utility Bar */}
      <PreviewUtilityBar />

      {/* 2. Main Navigation & dokind Wordmark Logo */}
      <PreviewMainHeader />

      {/* 3. Hero Campaign Carousel */}
      <PreviewHeroCarousel />

      {/* 4 & 5. Horizontal Cause-Category Carousel & Featured Campaign Grid */}
      <PreviewCampaignGrid />

      {/* 6. Monthly Donation Programs Section */}
      <PreviewMonthlySection />

      {/* 7. Start a Campaign Promotional Split Banner */}
      <PreviewStartCampaignBanner />

      {/* 8. Our Impact Statistics & Beneficiary Photo */}
      <PreviewImpactSection />

      {/* 9. Donor Testimonials Carousel */}
      <PreviewTestimonialsCarousel />

      {/* 10. Live Donation Activity Section */}
      <PreviewDonationActivity />

      {/* 11. Awards & Genuine Media Mentions */}
      <PreviewAwardsAndMedia />

      {/* 12. Newsletter Subscription Banner */}
      <PreviewNewsletter />

      {/* 13. dokind Comprehensive Footer */}
      <PreviewFooter />
    </div>
  );
}
