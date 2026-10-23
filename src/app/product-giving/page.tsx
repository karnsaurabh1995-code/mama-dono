import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, PackageCheck, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ProductGivingDirectoryPage() {
  const products = db.getProducts();

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Product Giving Catalog</span>
        </nav>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="bg-amber-600/40 text-amber-200 border border-amber-400/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>DonateKart Inspired Physical Giving</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Don’t Just Donate Money. Donate Tangible Essentials.
            </h1>
            <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
              Every item is requisitioned by on-ground NGOs, procured directly at wholesale prices, and distributed with geotagged photo proof sent straight to your email.
            </p>
          </div>
        </div>

        {/* 3-Pillar Transparency Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#202124]">100% Tangible Needs</h4>
              <p className="text-xs text-[#555B63] mt-0.5">
                Rations, blankets, school kits, and medical aids requested by field teams.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#202124]">Wholesale Delivery</h4>
              <p className="text-xs text-[#555B63] mt-0.5">
                Bulk procurement ensures up to 35% cost savings compared to retail stores.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#25845B] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#202124]">Geotagged Distribution</h4>
              <p className="text-xs text-[#555B63] mt-0.5">
                Photo evidence and beneficiary register updates shared with every donor.
              </p>
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[#202124]">
            Active Essential Needs Requiring Sponsorship ({products.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
