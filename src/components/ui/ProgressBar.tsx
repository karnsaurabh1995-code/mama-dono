import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // Percentage (e.g. 75)
  className?: string;
  barClassName?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  height = 'md',
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clamped}% funded`}
        className={cn(
          'w-full bg-[#EFECE6] rounded-full overflow-hidden relative',
          heightStyles[height]
        )}
      >
        <div
          className={cn(
            'h-full bg-[#E84B45] rounded-full transition-all duration-700 ease-out',
            clamped >= 100 && 'bg-[#25845B]',
            barClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mt-1 text-[#555B63] font-medium">
          <span>{clamped}% Funded</span>
        </div>
      )}
    </div>
  );
}
