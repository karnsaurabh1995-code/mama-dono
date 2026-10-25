'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';

interface DokindLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  customLogoUrl?: string;
  customAltText?: string;
  forceVector?: boolean;
}

/**
 * Official Dokind Brand Wordmark
 *
 * Geometric bold lowercase wordmark featuring:
 * - Bold lowercase typography matching approved brand identity
 * - Precise mathematical alignment of the letter 'i' stem
 * - Distinctive brand red dot (#D91E25) centered directly over the 'i' stem
 * - High-contrast rendering for both dark headers and light backgrounds
 * - Dynamic Admin Logo Override support with automatic fallback
 */
export function DokindLogo({
  variant = 'dark',
  size = 'md',
  showTagline = false,
  tagline = 'Small acts. Real impact.',
  className = '',
  customLogoUrl,
  customAltText,
  forceVector = false,
}: DokindLogoProps) {
  const [imageError, setImageError] = useState(false);
  const isLight = variant === 'light';
  const fillColor = isLight ? '#FFFFFF' : '#18181B';

  const settings = db.getSiteSettings();

  // Determine dynamic custom logo if configured
  let effectiveLogoUrl = customLogoUrl;
  if (!effectiveLogoUrl && !forceVector) {
    if (isLight && settings.logoLightUrl) {
      effectiveLogoUrl = settings.logoLightUrl;
    } else if (!isLight && settings.logoDarkUrl) {
      effectiveLogoUrl = settings.logoDarkUrl;
    } else if (settings.logoUrl) {
      effectiveLogoUrl = settings.logoUrl;
    } else {
      // Default to the official approved new Dokind brand logo
      effectiveLogoUrl = isLight ? '/dokind-logo-white.png' : '/dokind-logo.png';
    }
  }

  const effectiveAlt = customAltText || settings.logoAltText || 'dokind crowdfunding';

  // Responsive image/vector height tokens
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-7 sm:h-8',
    lg: 'h-9 sm:h-10',
    xl: 'h-11 sm:h-12',
  }[size];

  return (
    <div className={`inline-flex flex-col select-none ${className}`} aria-label="dokind crowdfunding">
      <div className="flex items-center">
        {effectiveLogoUrl && !imageError ? (
          /* Official Dokind Logo Image Asset */
          <img
            src={effectiveLogoUrl}
            alt={effectiveAlt}
            className={`${sizeClasses} w-auto object-contain shrink-0`}
            onError={() => setImageError(true)}
          />
        ) : (
          /* Vector Fallback Wordmark with zero excess left padding */
          <svg
            viewBox="9.5 5.5 83 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${sizeClasses} w-auto shrink-0`}
            aria-hidden="true"
          >
            {/* Main letter shapes for d, o, k, i (stem), n, d */}
            <path
              fill={fillColor}
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 18.9 7 v 18 h -3.2 v -1.6 c -1 1.2 -2.3 1.9 -3.9 1.9 c -3.4 0 -5.9 -2.7 -5.9 -6.3 s 2.5 -6.3 5.9 -6.3 c 1.6 0 2.9 .7 3.9 1.9 V 7 h 3.2 z m -3.2 12 c 0 -2.2 -1.6 -3.8 -3.6 -3.8 s -3.6 1.6 -3.6 3.8 s 1.6 3.8 3.6 3.8 s 3.6 -1.6 3.6 -3.8 z M 27.85 12.5 c -3.8 0 -6.85 2.8 -6.85 6.45 s 3.05 6.45 6.85 6.45 s 6.85 -2.8 6.85 -6.45 s -3.05 -6.45 -6.85 -6.45 z m 0 9.7 c -2 0 -3.6 -1.5 -3.6 -3.25 s 1.6 -3.25 3.6 -3.25 s 3.6 1.5 3.6 3.25 s -1.6 3.25 -3.6 3.25 z M 37 7 h 3.2 v 9.2 l 5.7 -6.7 h 3.9 l -6.2 7.1 l 6.7 8.4 h -4.1 l -4.8 -6.2 v 6.2 h -3.2 V 7 z M 53 12.7 h 3.2 v 12.3 h -3.2 z M 59 12.7 h 3.2 v 1.6 c 1 -1.2 2.3 -1.8 3.9 -1.8 c 3.4 0 5.6 2.3 5.6 5.9 v 6.6 h -3.2 v -6.3 c 0 -1.9 -1.1 -3.1 -2.8 -3.1 c -1.7 0 -3.5 1.3 -3.5 3.6 v 5.8 h -3.2 v -12.3 z M 91.9 7 v 18 h -3.2 v -1.6 c -1 1.2 -2.3 1.9 -3.9 1.9 c -3.4 0 -5.9 -2.7 -5.9 -6.3 s 2.5 -6.3 5.9 -6.3 c 1.6 0 2.9 .7 3.9 1.9 V 7 h 3.2 z m -3.2 12 c 0 -2.2 -1.6 -3.8 -3.6 -3.8 s -3.6 1.6 -3.6 3.8 s 1.6 3.8 3.6 3.8 s 3.6 -1.6 3.6 -3.8 z"
            />
            {/* Distinctive dokind brand red dot centered over 'i' stem */}
            <circle cx="54.6" cy="8.5" r="2.4" fill="#D91E25" />
          </svg>
        )}
        <span className="sr-only">dokind</span>
      </div>

      {showTagline && (
        <span
          className={`text-[10px] font-medium tracking-wider uppercase mt-1 ${
            isLight ? 'text-neutral-400' : 'text-[#62666D]'
          }`}
        >
          {tagline}
        </span>
      )}
    </div>
  );
}

/**
 * Standalone Icon Mark for mobile headers, badges, and small avatars
 */
export function DokindMark({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const settings = db.getSiteSettings();
  if (settings.logoFaviconUrl) {
    return (
      <img
        src={settings.logoFaviconUrl}
        alt="dokind icon"
        width={size}
        height={size}
        className={`shrink-0 rounded-lg object-contain ${className}`}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#18181B" />
      <circle cx="21" cy="9" r="3.2" fill="#D91E25" />
      <path
        d="M17.5 7v18h-3.2v-1.6c-1 1.2-2.3 1.9-3.9 1.9-3.4 0-5.9-2.7-5.9-6.3s2.5-6.3 5.9-6.3c1.6 0 2.9.7 3.9 1.9V7h3.2zm-3.2 12c0-2.2-1.6-3.8-3.6-3.8s-3.6 1.6-3.6 3.8 1.6 3.8 3.6 3.8 3.6-1.6 3.6-3.8z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
