import React from 'react';
import { cn } from '@/lib/utils';
import { Repeat, PackageCheck, Award } from 'lucide-react';
import { CampaignBadge } from '../campaign/CampaignBadge';

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
  const cardOrDetail = size === 'sm' ? 'card' : 'detail';

  // Delegate core campaign badges to the central admin-styled CampaignBadge system
  if (variant === 'verified') {
    return (
      <CampaignBadge
        type="verified"
        text={typeof children === 'string' ? children : undefined}
        variant={cardOrDetail}
        className={className}
      />
    );
  }

  if (variant === 'tax80g') {
    return (
      <CampaignBadge
        type="tax_80g"
        text={typeof children === 'string' ? children : undefined}
        variant={cardOrDetail}
        className={className}
      />
    );
  }

  if (variant === 'urgent') {
    return (
      <CampaignBadge
        type="urgent"
        text={typeof children === 'string' ? children : undefined}
        variant={cardOrDetail}
        className={className}
      />
    );
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 rounded-full font-medium',
  };

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
