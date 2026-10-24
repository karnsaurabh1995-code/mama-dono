'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProductNeed } from '@/lib/types';
import { formatINR, calculatePercentage } from '@/lib/utils';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Package, Plus, Minus, CheckCircle, Truck, Clock } from 'lucide-react';

interface ProductCardProps {
  product: ProductNeed;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const percentage = calculatePercentage(product.quantityFunded, product.quantityRequired);
  const totalAmount = quantity * product.unitCost;

  const handleIncrement = () => {
    if (quantity < product.remainingNeed) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const statusBadges = {
    pending: { label: 'Fundraising Live', color: 'bg-amber-100 text-amber-800' },
    procuring: { label: 'In Wholesale Procurement', color: 'bg-blue-100 text-blue-800' },
    dispatched: { label: 'Dispatched to Ground', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Delivered to Beneficiaries', color: 'bg-emerald-100 text-emerald-800' },
  };

  const currentBadge = statusBadges[product.fulfillmentStatus] || statusBadges.pending;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#D5D1C8] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${currentBadge.color}`}
          >
            {currentBadge.label}
          </span>
        </div>

        {/* Unit Cost Pill */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md">
          {formatINR(product.unitCost)} / {product.unit.replace(/s$/, '')}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#555B63] uppercase tracking-wider">
            {product.organizationName}
          </span>
          <h3 className="text-base font-bold text-[#202124] leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-[#555B63] line-clamp-1">
            Target: {product.targetBeneficiaries}
          </p>
        </div>

        {/* Quantity Progress */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <ProgressBar value={percentage} height="sm" />
          <div className="flex justify-between text-xs text-[#555B63]">
            <span>
              <strong>{product.quantityFunded}</strong> of {product.quantityRequired} {product.unit} funded
            </span>
            <span className="font-bold text-[#25845B]">{percentage}%</span>
          </div>
          <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200/60 font-medium">
            Remaining need: {product.remainingNeed} {product.unit}
          </div>
        </div>

        {/* Quantity Selector & Sponsor Button */}
        <div className="pt-2 border-t border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#202124]">Select Quantity:</span>
            <div className="flex items-center border border-[#E8E6E1] rounded-lg overflow-hidden bg-[#FAF9F6]">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="p-1.5 hover:bg-neutral-200 disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 text-[#202124]" />
              </button>
              <span className="px-3 text-xs font-bold text-[#202124] min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.remainingNeed}
                className="p-1.5 hover:bg-neutral-200 disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 text-[#202124]" />
              </button>
            </div>
          </div>

          {/* Checkout CTA */}
          <Link
            href={`/donate/${product.campaignId}?amount=${totalAmount}&product=${encodeURIComponent(
              product.name
            )}&qty=${quantity}`}
            className="w-full inline-flex items-center justify-between font-bold bg-[#EF4949] hover:bg-[#D9363E] text-white py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <span>Sponsor {quantity} {quantity === 1 ? product.unit.replace(/s$/, '') : product.unit}</span>
            <span className="bg-black/20 px-2 py-0.5 rounded text-xs font-mono">
              {formatINR(totalAmount)}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
