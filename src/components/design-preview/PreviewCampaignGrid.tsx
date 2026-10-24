import React from 'react';
import Link from 'next/link';
import { PreviewCampaignCard, PreviewCampaignProps } from './PreviewCampaignCard';
import { PreviewCategoryCarousel } from './PreviewCategoryCarousel';
import { ArrowRight } from 'lucide-react';

export function PreviewCampaignGrid() {
  const sampleCampaigns: PreviewCampaignProps[] = [
    {
      id: 'prev-1',
      title: 'Save 4-Year-Old Aarav: Urgent Chemotherapy & Bone Marrow Transplant',
      category: 'Medical',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      raisedAmount: 780000,
      goalAmount: 1200000,
      supporterCount: 420,
      beneficiaryLocation: 'AIIMS, New Delhi',
      hasProductGiving: true,
    },
    {
      id: 'prev-2',
      title: 'Sponsor Schooling, Books & Digital STEM Labs for 500 Rural Girls',
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      raisedAmount: 430000,
      goalAmount: 850000,
      supporterCount: 280,
      beneficiaryLocation: 'Varanasi, Uttar Pradesh',
      hasProductGiving: true,
    },
    {
      id: 'prev-3',
      title: 'Serve Daily Hot Nutritious Meals to 1,000 Cancer Hospital Caregivers',
      category: 'Food Relief',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
      raisedAmount: 620000,
      goalAmount: 750000,
      supporterCount: 510,
      beneficiaryLocation: 'Tata Memorial, Mumbai',
      hasProductGiving: true,
    },
    {
      id: 'prev-4',
      title: 'Emergency Trauma Surgery & Sanctuary for 250 Rescued Stray Animals',
      category: 'Animals',
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      raisedAmount: 310000,
      goalAmount: 500000,
      supporterCount: 195,
      beneficiaryLocation: 'Bengaluru, Karnataka',
      hasProductGiving: true,
    },
    {
      id: 'prev-5',
      title: 'Motorized Wheelchairs & Assistive Tech for 40 Disabled Students',
      category: 'Disability',
      imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
      raisedAmount: 510000,
      goalAmount: 600000,
      supporterCount: 310,
      beneficiaryLocation: 'Hyderabad, Telangana',
      hasProductGiving: true,
    },
    {
      id: 'prev-6',
      title: 'Clean Drinking Water Solar Filtration Units for 12 Arid Drought Villages',
      category: 'Community',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      raisedAmount: 890000,
      goalAmount: 1100000,
      supporterCount: 460,
      beneficiaryLocation: 'Barmer, Rajasthan',
      hasProductGiving: true,
    },
  ];

  return (
    <section
      data-component="PreviewCampaignGrid"
      className="py-20 bg-[#FAF9F6] border-b border-[#E8E6E1]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1.5 rounded-full inline-block border border-[#FEE2E2]">
            EXPLORE CAUSES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#202124] tracking-tight">
            Behind Every Cause Is a Chance to Make a Difference.
          </h2>
          <p className="text-xs sm:text-sm text-[#555B63] max-w-xl mx-auto leading-relaxed">
            Choose a cause category below to discover urgent patient needs, community nourishment drives, and educational missions across India.
          </p>
        </div>

        {/* Cause Category Carousel */}
        <PreviewCategoryCarousel />

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sampleCampaigns.map((camp) => (
            <PreviewCampaignCard key={camp.id} {...camp} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center pt-8">
          <Link href="/campaigns">
            <button
              type="button"
              className="px-8 py-3.5 rounded-xl border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-extrabold text-xs transition duration-200 inline-flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>View All Active Campaigns</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
