import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, Flame, Repeat, PackageCheck, Award } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'verified' | 'tax80g' | 'urgent' | 'monthly' | 'product' | 'default' | 'staffPick';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 rounded-full font-medium',
  };

  if (variant === 'verified') {
    return (
      <span
        className={cn(
          'inline-flex items-center bg-[#EBF7F1] text-[#25845B] border border-[#C2E8D4]',
          sizeStyles[size],
          className
        )}
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>{children || 'Verified Cause'}</span>
      </span>
    );
  }

  if (variant === 'tax80g') {
    return (
      <span
        className={cn(
          'inline-flex items-center bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]',
          sizeStyles[size],
          className
        )}
      >
        <span className="font-bold text-[10px] bg-slate-700 text-white px-1 rounded-sm">80G</span>
        <span>{children || 'Tax Benefit'}</span>
      </span>
    );
  }

  if (variant === 'urgent') {
    return (
      <span
        className={cn(
          'inline-flex items-center bg-[#FFF1F0] text-[#E84B45] border border-[#FFD0CC]',
          sizeStyles[size],
          className
        )}
      >
        <Flame className="w-3.5 h-3.5 shrink-0 fill-[#E84B45]" />
        <span>{children || 'Urgent Need'}</span>
      </span>
    );
  }

  if (variant === 'monthly') {
    return (
      <span
        className={cn(
          'inline-flex items-center bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
          sizeStyles[size],
          className
        )}
      >
        <Repeat className="w-3.5 h-3.5 shrink-0" />
        <span>{children || 'Monthly Mission'}</span>
      </span>
    );
  }

  if (variant === 'product') {
    return (
      <span
        className={cn(
          'inline-flex items-center bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
          sizeStyles[size],
          className
        )}
      >
        <PackageCheck className="w-3.5 h-3.5 shrink-0" />
        <span>{children || 'Product Giving'}</span>
      </span>
    );
  }

  if (variant === 'staffPick') {
    return (
      <span
        className={cn(
          'inline-flex items-center bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]',
          sizeStyles[size],
          className
        )}
      >
        <Award className="w-3.5 h-3.5 shrink-0" />
        <span>{children || 'Featured'}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center bg-[#F1EFEA] text-[#555B63] border border-[#E8E6E1]',
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
