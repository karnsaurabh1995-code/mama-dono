'use client';

import React from 'react';

export interface BrushStrokeFrameProps {
  imageUrl: string;
  altText?: string;
  frameStyle?: 'organic_brush' | 'watercolor_edge' | 'subtle_splatter' | 'clean_rounded';
  focalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  frameSize?: 'normal' | 'large' | 'compact';
  className?: string;
}

/**
 * BrushStrokeFrame
 *
 * Renders an image inside a decorative organic painterly brush-stroke frame
 * inspired by artistic cultural aesthetics and authentic hand-crafted charity dispatches.
 */
export function BrushStrokeFrame({
  imageUrl,
  altText = 'Dokind newsletter story',
  frameStyle = 'organic_brush',
  focalPoint = 'center',
  frameSize = 'normal',
  className = '',
}: BrushStrokeFrameProps) {
  if (!imageUrl) return null;

  const focalPointClass = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
  }[focalPoint] || 'object-center';

  const sizeClass = {
    compact: 'h-64 sm:h-72 lg:h-80',
    normal: 'h-72 sm:h-84 lg:h-96',
    large: 'h-84 sm:h-96 lg:h-[430px]',
  }[frameSize] || 'h-72 sm:h-84 lg:h-96';

  // Specific border-radius and SVG clipping characteristics per style
  const getStyleWrapperClasses = () => {
    switch (frameStyle) {
      case 'watercolor_edge':
        return 'rounded-[38%_62%_63%_37%/41%_44%_56%_59%] shadow-2xl transition-all duration-500';
      case 'subtle_splatter':
        return 'rounded-[28px_44px_24px_52px] shadow-2xl transition-all duration-500';
      case 'clean_rounded':
        return 'rounded-3xl shadow-xl transition-all duration-500';
      case 'organic_brush':
      default:
        return 'rounded-[46%_54%_49%_51%/52%_45%_55%_48%] shadow-2xl transition-all duration-500';
    }
  };

  return (
    <div className={`relative flex items-center justify-center p-3 select-none ${className}`}>
      {/* Decorative Outer Watercolor Paint Blobs / Splatters */}
      {frameStyle !== 'clean_rounded' && (
        <>
          <div
            className="absolute -top-3 -left-3 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none -z-0"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none -z-0"
            aria-hidden="true"
          />
        </>
      )}

      {/* Decorative Paint Edge Border SVG Overlay */}
      {frameStyle === 'organic_brush' && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 text-white/30 scale-105"
          viewBox="0 0 400 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Subtle distressed brush stroke contours */}
          <path
            d="M24 50 C 70 20, 160 35, 240 22 C 320 10, 360 40, 375 90 C 390 140, 385 220, 365 270 C 345 310, 260 300, 180 305 C 100 310, 45 285, 30 240 C 15 190, 10 110, 24 50 Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 4 12 3"
            className="opacity-60"
          />
          {/* Paint dots & splatters */}
          <circle cx="20" cy="45" r="3.5" fill="currentColor" className="opacity-70" />
          <circle cx="15" cy="65" r="2" fill="currentColor" className="opacity-50" />
          <circle cx="380" cy="85" r="4" fill="currentColor" className="opacity-70" />
          <circle cx="390" cy="115" r="2.5" fill="currentColor" className="opacity-50" />
          <circle cx="370" cy="275" r="3" fill="currentColor" className="opacity-60" />
          <circle cx="25" cy="250" r="3.5" fill="currentColor" className="opacity-70" />
        </svg>
      )}

      {frameStyle === 'subtle_splatter' && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 text-white/30 scale-102"
          viewBox="0 0 400 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="15" cy="30" r="5" fill="currentColor" className="opacity-70" />
          <circle cx="35" cy="18" r="2.5" fill="currentColor" className="opacity-60" />
          <circle cx="385" cy="40" r="4.5" fill="currentColor" className="opacity-70" />
          <circle cx="370" cy="25" r="2" fill="currentColor" className="opacity-50" />
          <circle cx="388" cy="280" r="4" fill="currentColor" className="opacity-60" />
          <circle cx="22" cy="290" r="4.5" fill="currentColor" className="opacity-70" />
        </svg>
      )}

      {/* Main Framed Image Container */}
      <div
        className={`relative w-full ${sizeClass} overflow-hidden border-4 border-white/60 bg-white/10 backdrop-blur-xs ${getStyleWrapperClasses()}`}
      >
        <img
          src={imageUrl}
          alt={altText}
          className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${focalPointClass}`}
          loading="lazy"
        />

        {/* Soft artistic vignette highlight */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-white/10"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
