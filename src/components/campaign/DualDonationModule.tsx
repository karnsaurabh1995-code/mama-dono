'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Campaign, CampaignItemNeed } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Package,
  Heart,
  Plus,
  Minus,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface DualDonationModuleProps {
  campaign: Campaign;
  items: CampaignItemNeed[];
  layout?: 'sidebar' | 'full';
  onShareClick?: () => void;
  onPhysicalPledgeClick?: (item: CampaignItemNeed) => void;
}

export function DualDonationModule({
  campaign,
  items,
  layout = 'sidebar',
  onShareClick,
  onPhysicalPledgeClick,
}: DualDonationModuleProps) {
  const router = useRouter();

  // Tab State: If items exist, default to 'products' or 'money' based on availability
  const hasItems = items && items.length > 0;
  const [activeTab, setActiveTab] = useState<'products' | 'money'>(hasItems ? 'products' : 'money');

  // Product Selection Map: itemId -> quantity (0 if not selected)
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(() => {
    // If items exist, pre-select the first item with quantity 1 for instant discoverability
    if (items.length > 0) {
      return { [items[0].id]: 1 };
    }
    return {};
  });

  // Monetary Donation State
  const [selectedAmount, setSelectedAmount] = useState<number>(1001);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isMonthly, setIsMonthly] = useState<boolean>(campaign.campaignType === 'monthly');

  // Handlers for Product Selection
  const getItemQty = (itemId: string) => selectedItems[itemId] || 0;

  const handleAddItem = (itemId: string) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const handleUpdateItemQty = (itemId: string, delta: number) => {
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

  // Calculations for Product Donations
  const selectedItemsList = items
    .filter((it) => (selectedItems[it.id] || 0) > 0)
    .map((it) => ({
      itemId: it.id,
      itemName: it.name,
      unitPrice: it.unitPrice,
      quantity: selectedItems[it.id],
    }));

  const totalSelectedUnits = selectedItemsList.reduce((sum, it) => sum + it.quantity, 0);
  const totalProductsAmount = selectedItemsList.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0
  );

  // Monetary Calculations
  const effectiveMonetaryAmount = customAmount ? Number(customAmount) : selectedAmount;

  // Checkout URLs
  const productsCheckoutParam = encodeURIComponent(JSON.stringify(selectedItemsList));
  const productsCheckoutUrl = `/donate/${campaign.id}?items=${productsCheckoutParam}&amount=${totalProductsAmount}`;
  const monetaryCheckoutUrl = `/donate/${campaign.id}?amount=${effectiveMonetaryAmount}${isMonthly ? '&recurring=true' : ''}`;

  const isSidebar = layout === 'sidebar';

  return (
    <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-md overflow-hidden transition-all">
      {/* 1. Side-by-Side Segmented Tab Selector (DONATE PRODUCTS | DONATE MONEY) */}
      <div className="grid grid-cols-2 p-1.5 sm:p-2 bg-[#FAF9F6] border-b border-[#E8E6E1] gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => hasItems && setActiveTab('products')}
          disabled={!hasItems}
          className={`py-3 px-3 sm:px-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#EF4949] text-white shadow-md'
              : hasItems
              ? 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
              : 'opacity-40 cursor-not-allowed text-neutral-400'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span className="truncate">Donate Products</span>
          {hasItems && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {items.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('money')}
          className={`py-3 px-3 sm:px-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            activeTab === 'money'
              ? 'bg-[#EF4949] text-white shadow-md'
              : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
          }`}
        >
          <Heart className="w-4 h-4 shrink-0 fill-current" />
          <span className="truncate">Donate Money</span>
        </button>
      </div>

      {/* 2. TAB CONTENT: DONATE PRODUCTS */}
      {activeTab === 'products' && (
        <div className={`p-4 sm:p-6 space-y-5 ${isSidebar ? 'text-xs' : ''}`}>
          <div className="flex items-center justify-between gap-2 pb-1">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#202124] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#EF4949]" />
                Select Products to Sponsor
              </h3>
              <p className="text-[11px] text-[#555B63] mt-0.5">
                Procured wholesale and delivered with verified geo-tagged proof.
              </p>
            </div>
          </div>

          {/* Product Items: Vertical Stack in Sidebar Mode or Grid in Full Mode */}
          <div className={isSidebar ? 'space-y-3 max-h-[380px] overflow-y-auto pr-1' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
            {items.map((it) => {
              const qty = getItemQty(it.id);
              const isSelected = qty > 0;
              const subtotal = it.unitPrice * (qty || 1);
              const remaining = Math.max(0, it.quantityRequired - it.quantityFunded);

              if (isSidebar) {
                return (
                  <div
                    key={it.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#EF4949] bg-[#FFF8F7] ring-1 ring-[#EF4949]/30'
                        : 'border-[#E8E6E1] bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#202124] truncate">{it.name}</h4>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-mono font-bold text-[#EF4949] text-xs">
                            {formatINR(it.unitPrice)}
                          </span>
                          <span className="text-[10px] text-neutral-400">/ {it.unit}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-medium block">
                          {it.quantityFunded} of {it.quantityRequired} funded
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 bg-white border border-[#E8E6E1] rounded-xl p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(it.id, -1)}
                            className="w-6 h-6 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-[#202124]">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(it.id, 1)}
                            className="w-6 h-6 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddItem(it.id)}
                          className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#EF4949] text-[#202124] hover:text-white border border-[#E8E6E1] rounded-xl font-bold text-xs transition cursor-pointer"
                        >
                          + Add
                        </button>
                      )}

                      {(it.donationMode === 'both' || it.donationMode === 'physical_goods') && (
                        <button
                          type="button"
                          onClick={() => onPhysicalPledgeClick && onPhysicalPledgeClick(it)}
                          className="text-[10px] text-neutral-400 hover:text-purple-600 underline"
                        >
                          Ship goods
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // Full Grid Layout fallback
              return (
                <div
                  key={it.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs ${
                    isSelected ? 'border-[#EF4949] bg-white ring-2 ring-[#EF4949]/20' : 'border-neutral-200 bg-[#FAF9F6]'
                  }`}
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                    <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-[#202124] leading-snug">{it.name}</h4>
                    <span className="font-mono font-bold text-[#EF4949] text-xs">
                      {formatINR(it.unitPrice)} / {it.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary & Primary Donate Button */}
          <div className="pt-3 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-medium">
                Selected: <strong>{totalSelectedUnits} items</strong>
              </span>
              <span className="text-base font-black text-[#202124] font-mono">
                {formatINR(totalProductsAmount)}
              </span>
            </div>

            <Link
              href={totalProductsAmount > 0 ? productsCheckoutUrl : '#'}
              aria-disabled={totalProductsAmount === 0}
              className={`w-full inline-flex items-center justify-center gap-2 bg-[#EF4949] hover:bg-[#D9363E] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md transition-all ${
                totalProductsAmount === 0 ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'
              }`}
            >
              <span>DONATE PRODUCTS ({formatINR(totalProductsAmount)})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <p className="text-[10px] text-center text-neutral-400">
              Tax exemption 80G applies to product contributions.
            </p>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: DONATE MONEY */}
      {activeTab === 'money' && (
        <div className={`p-4 sm:p-6 space-y-5 ${isSidebar ? 'text-xs' : ''}`}>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#202124] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#EF4949] fill-[#EF4949]" />
              Monetary Support
            </h3>
            <p className="text-[11px] text-[#555B63] mt-0.5">
              Directly disburses to hospital escrows and emergency treatments.
            </p>
          </div>

          {/* Preset Buttons Grid */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-600 block">
              Quick Amount Selection (INR):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2500, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-mono ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-[#EF4949] text-white border-[#EF4949] shadow-xs'
                      : 'bg-[#FAF9F6] text-[#202124] border-[#E8E6E1] hover:border-neutral-300'
                  }`}
                >
                  {formatINR(amt)}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative pt-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Or enter any custom amount"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-[#202124] focus:outline-none focus:border-[#EF4949]"
              />
            </div>
          </div>

          {/* One-Time vs Monthly Toggle */}
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#202124] block">Monthly Giving</span>
              <span className="text-[10px] text-neutral-500">Provide recurring hope</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMonthly(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  !isMonthly ? 'bg-[#202124] text-white' : 'bg-white text-neutral-600 border border-neutral-300'
                }`}
              >
                One-Time
              </button>
              <button
                type="button"
                onClick={() => setIsMonthly(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  isMonthly ? 'bg-[#EF4949] text-white shadow-xs' : 'bg-white text-neutral-600 border border-neutral-300'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Primary Donate Money CTA */}
          <div className="pt-2">
            <Link
              href={monetaryCheckoutUrl}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#EF4949] hover:bg-[#D9363E] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <Heart className="w-4 h-4 fill-white shrink-0" />
              <span>DONATE {formatINR(effectiveMonetaryAmount || 1001)} NOW</span>
              <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
            </Link>
          </div>

          <div className="text-center text-[10px] text-neutral-400 space-y-0.5 pt-1">
            <p>🔒 256-bit Bank-Grade Razorpay Checkout</p>
            <p>Instant Form 10BE 80G Tax Exemption Receipt</p>
          </div>
        </div>
      )}
    </div>
  );
}
