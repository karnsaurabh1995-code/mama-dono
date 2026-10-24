import React from 'react';
import Link from 'next/link';
import { PreviewUtilityBar } from '@/components/design-preview/PreviewUtilityBar';
import { PreviewMainHeader } from '@/components/design-preview/PreviewMainHeader';
import { PreviewDualDonationModule } from '@/components/design-preview/PreviewDualDonationModule';
import { PreviewFooter } from '@/components/design-preview/PreviewFooter';
import { formatINR } from '@/lib/utils';
import {
  Heart,
  Share2,
  ShieldCheck,
  Calendar,
  MapPin,
  Hospital,
  Package,
  FileText,
  Clock,
  ChevronRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export default function DesignStudioCampaignPage() {
  return (
    <div data-preview-page="campaign-detail" className="flex flex-col min-h-screen">
      <PreviewUtilityBar />
      <PreviewMainHeader />

      <div className="py-10 bg-[#FAF9F6] flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#555B63]">
            <Link href="/design-preview" className="hover:text-[#202124]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hover:text-[#202124]">Campaigns</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#202124] font-semibold">
              Save 4-Year-Old Aarav: Leukemia Treatment & Bone Marrow Transplant
            </span>
          </nav>

          {/* 1. Campaign Title & Meta Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#FFF0EF] text-[#EF4949] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#FEE2E2]">
                Medical Emergency
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Medical & NGO Verified</span>
              </span>
              <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                50% Tax Exemption 80G
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#202124] tracking-tight leading-tight">
              Save 4-Year-Old Aarav: Leukemia Treatment & Bone Marrow Transplant
            </h1>

            <div className="flex items-center gap-4 text-xs text-[#555B63] flex-wrap">
              <span>
                Organized by <strong>Child Heart & Cancer Foundation</strong>
              </span>
              <span className="flex items-center gap-1 text-[#202124] font-medium">
                <Hospital className="w-3.5 h-3.5 text-[#EF4949]" />
                <span>AIIMS, New Delhi</span>
              </span>
              <span className="flex items-center gap-1 text-[#202124] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#EF4949]" />
                <span>New Delhi, India</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Created Oct 2026</span>
              </span>
            </div>
          </div>

          {/* 2. Hero Split: Large Artwork + Campaign Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-neutral-100 shadow-md border border-[#E8E6E1]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
                  alt="Aarav medical treatment"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Beneficiary Info Strip */}
              <div className="p-4 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Beneficiary
                  </span>
                  <strong className="text-sm text-[#202124]">Aarav Sharma (Age 4)</strong>
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Hospital UHID
                  </span>
                  <span className="text-xs text-[#202124] font-mono font-bold">AIIMS-PED-2026-9921</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Escrow Payout
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">
                    Direct AIIMS Patient Ledger
                  </span>
                </div>
              </div>
            </div>

            {/* Right Overview Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-md space-y-5">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#202124] font-mono">
                    ₹7,80,000
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">
                    65% of ₹12,00,000
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-[#EF4949] rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between text-xs text-[#555B63] pt-1">
                  <span>420 Donors</span>
                  <span>Ends in 14 days</span>
                </div>
              </div>

              {/* Item Fulfillment summary */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#202124]">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#EF4949]" />
                    Essential Items Fulfillment
                  </span>
                  <span className="text-emerald-700 font-mono">157 / 270 items (58%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Section 80G Tax Exemption Certificate issued instantly.</span>
              </div>
            </div>
          </div>

          {/* 3. DUAL-DONATION MODULE (Donate Products | Donate Money) */}
          <div className="pt-2">
            <PreviewDualDonationModule />
          </div>

          {/* 4. Campaign Story Narrative */}
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-10 shadow-2xs space-y-6">
            <div className="space-y-2 pb-4 border-b border-[#E8E6E1]">
              <span className="text-xs font-black uppercase tracking-widest text-[#EF4949] bg-[#FFF0EF] px-3.5 py-1 rounded-full border border-[#FEE2E2]">
                PATIENT STORY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
                About Aarav&apos;s Battle with Acute Leukemia
              </h2>
            </div>

            <div className="text-sm sm:text-base leading-relaxed text-[#404348] space-y-4">
              <p>
                Four-year-old Aarav loved chasing kites in his village in western UP. Three months ago, unexplained high fevers and severe fatigue led his parents to a local clinic, which quickly referred them to AIIMS New Delhi.
              </p>
              <p>
                Biopsy tests confirmed Acute Lymphoblastic Leukemia (High Risk). Doctors have scheduled a bone marrow transplant following 4 intensive rounds of chemotherapy. His father, Ramesh, works as a daily wage helper earning ₹350 a day, and the family has exhausted every rupee they possessed.
              </p>
            </div>

            {/* Structured Story Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E8E6E1]">
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200 space-y-2">
                <h4 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EF4949]" />
                  What Your Contribution Makes Possible
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Direct coverage of chemotherapy vials, sterile ICU care, HLA-matched bone marrow extraction, and post-operative immunosuppressants.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200 space-y-2">
                <h4 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Direct Hospital Disbursement
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  100% of donor funds are transferred directly into the AIIMS Pediatric Oncology patient deposit account. Zero intermediary deductions.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Itemized Medical Budget */}
          <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 sm:p-10 shadow-2xs space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                FINANCIAL TRANSPARENCY
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-2">
                Itemized Medical Budget
              </h2>
            </div>

            <div className="divide-y divide-[#E8E6E1] border border-[#E8E6E1] rounded-2xl overflow-hidden">
              {[
                { item: 'Chemotherapy Induction & Immunotherapy Cycles (4 rounds)', amount: 350000 },
                { item: 'Allogeneic Bone Marrow Transplant Procedure & ICU Isolation', amount: 550000 },
                { item: 'Antibiotic, Antifungal & Post-Transplant Medications', amount: 180000 },
                { item: 'Hospital Bed Charges, Nursing & Diagnostic Pathology', amount: 120000 },
              ].map((b, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm bg-white">
                  <span className="font-bold text-[#202124]">{b.item}</span>
                  <span className="font-black text-[#202124] font-mono ml-4 text-right shrink-0">
                    {formatINR(b.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PreviewFooter />
    </div>
  );
}
