'use client';

import React, { useState } from 'react';
import { Package, Heart, Plus, Minus, Share2, ShieldCheck, Truck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export function PreviewDualDonationModule() {
  const [activeTab, setActiveTab] = useState<'products' | 'money'>('products');

  // Preview Item Products
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    'item-1': 2,
    'item-2': 1,
  });

  const previewProducts = [
    {
      id: 'item-1',
      name: 'Chemotherapy Medication Vial',
      category: 'Medical',
      unitPrice: 1250,
      unit: 'vial',
      quantityRequired: 60,
      quantityFunded: 38,
      description: 'Critical targeted immunotherapy medication required prior to surgery.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'item-2',
      name: 'Sterile Surgical Care & Dressing Kit',
      category: 'Surgical',
      unitPrice: 450,
      unit: 'kit',
      quantityRequired: 120,
      quantityFunded: 74,
      description: 'Post-operative antiseptic swabs, gauze, and trauma dressings.',
      imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'item-3',
      name: 'Pediatric Nutritional Supplement Powder',
      category: 'Nutrition',
      unitPrice: 600,
      unit: 'tin',
      quantityRequired: 90,
      quantityFunded: 45,
      description: 'High-protein clinical recovery formula prescribed by oncologist.',
      imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Monetary Selection State
  const [selectedMonetary, setSelectedMonetary] = useState<number>(1001);
  const [customMonetary, setCustomMonetary] = useState<string>('');
  const [isMonthly, setIsMonthly] = useState<boolean>(false);
  const [previewFeedback, setPreviewFeedback] = useState<string>('');

  const triggerFeedback = (msg: string) => {
    setPreviewFeedback(msg);
    setTimeout(() => setPreviewFeedback(''), 3500);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: updated };
    });
  };

  const selectedItemsList = previewProducts
    .filter((it) => (selectedItems[it.id] || 0) > 0)
    .map((it) => ({
      ...it,
      qty: selectedItems[it.id],
    }));

  const totalSelectedUnits = selectedItemsList.reduce((sum, it) => sum + it.qty, 0);
  const totalProductsAmount = selectedItemsList.reduce(
    (sum, it) => sum + it.unitPrice * it.qty,
    0
  );

  const effectiveMonetaryAmount = customMonetary ? Number(customMonetary) : selectedMonetary;

  return (
    <div
      data-component="PreviewDualDonationModule"
      className="bg-white rounded-3xl border border-[#E8E6E1] shadow-md overflow-hidden"
    >
      {/* 1. Side-by-Side Segmented Tab Selector */}
      <div className="grid grid-cols-2 p-2 bg-[#FAF9F6] border-b border-[#E8E6E1] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#EF4949] text-white shadow-md'
              : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>DONATE PRODUCTS</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {previewProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('money')}
          className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'money'
              ? 'bg-[#EF4949] text-white shadow-md'
              : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
          }`}
        >
          <Heart className="w-4 h-4 shrink-0 fill-current" />
          <span>DONATE MONEY</span>
        </button>
      </div>

      {previewFeedback && (
        <div className="m-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{previewFeedback}</span>
        </div>
      )}

      {/* 2. TAB: DONATE PRODUCTS */}
      {activeTab === 'products' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h3 className="text-lg font-black text-[#202124] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#EF4949]" />
                Items Needed for This Campaign
              </h3>
              <p className="text-xs text-[#555B63] mt-0.5">
                Supplies are procured wholesale and delivered directly under verified hospital oversight.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              Direct Physical Fulfillment
            </span>
          </div>

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {previewProducts.map((it) => {
              const qty = selectedItems[it.id] || 0;
              const isSelected = qty > 0;
              const subtotal = it.unitPrice * (qty || 1);
              const itPct = Math.round((it.quantityFunded / it.quantityRequired) * 100);
              const remaining = it.quantityRequired - it.quantityFunded;

              return (
                <div
                  key={it.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                    isSelected
                      ? 'border-[#EF4949] bg-white ring-2 ring-[#EF4949]/20'
                      : 'border-neutral-200 bg-[#FAF9F6] hover:border-neutral-300'
                  }`}
                >
                  <div>
                    <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                          {it.category}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-[#202124] text-xs font-black font-mono shadow-xs">
                        {formatINR(it.unitPrice)}{' '}
                        <span className="text-[10px] font-normal text-neutral-500">/ {it.unit}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#202124] leading-snug">{it.name}</h4>
                        <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                          {it.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-emerald-700 font-mono font-bold">
                            {it.quantityFunded} {it.unit} funded
                          </span>
                          <span className="text-neutral-500 font-mono">{remaining} remaining</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${itPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 pt-2 border-t border-neutral-100 bg-white space-y-2">
                    {isSelected ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-[#FAF9F6] rounded-xl p-1.5 border border-neutral-200">
                          <span className="text-xs font-bold text-neutral-700 ml-1">
                            Qty: <strong className="font-mono text-[#EF4949]">{qty}</strong>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(it.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono font-black text-xs text-[#202124]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(it.id, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Subtotal:</span>
                          <span className="font-bold font-mono text-[#202124]">
                            {formatINR(subtotal)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(it.id, 1)}
                        className="w-full bg-[#EF4949] hover:bg-[#D93838] text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add ({formatINR(it.unitPrice)})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Summary Bar */}
          <div className="sticky bottom-4 z-30 p-4 sm:p-5 rounded-2xl bg-[#202124] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral-700">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                Selected Products
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-300">
                  Selected: <strong>{totalSelectedUnits} items</strong>
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                  {formatINR(totalProductsAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => triggerFeedback('Design Studio: Share link copied to preview clipboard.')}
                className="py-3 px-4 rounded-xl border border-neutral-600 hover:bg-neutral-800 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Share2 className="w-4 h-4 text-[#EF4949]" />
                <span>Share</span>
              </button>

              <button
                type="button"
                disabled={totalProductsAmount === 0}
                onClick={() =>
                  triggerFeedback(
                    `Design Studio Simulation: ${totalSelectedUnits} products (${formatINR(
                      totalProductsAmount
                    )}) selected. (Payment orders are isolated in design preview)`
                  )
                }
                className="w-full sm:w-auto bg-[#EF4949] hover:bg-[#D93838] text-white font-extrabold text-sm py-3 px-7 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>DONATE NOW ({formatINR(totalProductsAmount)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: DONATE MONEY */}
      {activeTab === 'money' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h3 className="text-lg font-black text-[#202124] flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#EF4949] fill-[#EF4949]" />
                Monetary Donation
              </h3>
              <p className="text-xs text-[#555B63] mt-0.5">
                Support medical bills, emergency tests, and critical treatments directly.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Section 80G Tax Benefit (50% Exemption)
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[#202124] block">
              Choose Contribution Amount (INR):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {[500, 1000, 2500, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedMonetary(amt);
                    setCustomMonetary('');
                  }}
                  className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer font-mono ${
                    selectedMonetary === amt && !customMonetary
                      ? 'bg-[#EF4949] text-white border-[#EF4949] shadow-md scale-102'
                      : 'bg-[#FAF9F6] text-[#202124] border-[#E8E6E1] hover:border-neutral-300 hover:bg-white'
                  }`}
                >
                  {formatINR(amt)}
                </button>
              ))}
            </div>

            <div className="relative pt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-neutral-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                value={customMonetary}
                onChange={(e) => setCustomMonetary(e.target.value)}
                placeholder="Or enter any custom donation amount"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl pl-9 pr-4 py-3 text-xs sm:text-sm font-semibold text-[#202124] focus:outline-hidden focus:border-[#EF4949] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#202124]">Support as a Monthly Donor?</h4>
              <p className="text-[11px] text-[#555B63]">
                Provide ongoing assistance for patient recovery. Modify or cancel anytime.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMonthly(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  !isMonthly
                    ? 'bg-[#202124] text-white'
                    : 'bg-white border border-neutral-300 text-neutral-600'
                }`}
              >
                One-Time
              </button>
              <button
                type="button"
                onClick={() => setIsMonthly(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  isMonthly
                    ? 'bg-[#EF4949] text-white shadow-xs'
                    : 'bg-white border border-neutral-300 text-neutral-600'
                }`}
              >
                Monthly Pledge
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              triggerFeedback(
                `Design Studio Simulation: ${formatINR(
                  effectiveMonetaryAmount || 1001
                )} selected (${isMonthly ? 'Monthly Pledge' : 'One-Time'}). (Live payments isolated)`
              )
            }
            className="w-full bg-[#EF4949] hover:bg-[#D93838] text-white font-extrabold text-base py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span>DONATE {formatINR(effectiveMonetaryAmount || 1001)} NOW</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
