import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'button' | 'span';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      as = 'button',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary: 'bg-[#EF4949] text-white hover:bg-[#D9363E] shadow-sm active:scale-[0.99]',
      secondary: 'bg-[#202124] text-white hover:bg-[#33353A] shadow-sm',
      outline:
        'border border-[#EAE7E2] bg-white text-[#202124] hover:bg-[#FAF9F6] hover:border-[#D5D1C8]',
      ghost: 'bg-transparent text-[#62666D] hover:text-[#202124] hover:bg-black/5',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-[#238665] text-white hover:bg-[#1E6B49]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 gap-2 h-10',
      lg: 'text-base px-6 py-3.5 gap-2.5 h-12',
    };

    if (as === 'span') {
      return (
        <span
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          aria-disabled={disabled || isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
          {!isLoading && leftIcon}
          <span>{children}</span>
          {!isLoading && rightIcon}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
