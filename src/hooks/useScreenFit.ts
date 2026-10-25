'use client';

import { useState, useEffect, useCallback } from 'react';

export type ScreenTier =
  | 'phone'       // < 640px (Mobile smartphones, foldables)
  | 'tablet'      // 640px - 1023px (iPads, tablets, e-readers)
  | 'laptop'      // 1024px - 1439px (Standard laptops, Chromebooks)
  | 'desktop'     // 1440px - 2159px (Full HD desktops, QHD monitors)
  | 'ultrawide'   // 2160px - 2559px (Ultrawide 21:9 & 32:9 displays)
  | 'tv'          // 2560px - 3839px (4K Smart TVs, 10-ft living room displays)
  | 'billboard';  // >= 3840px (Digital Billboards, DOOH, giant 8K LED walls)

export interface ScreenFitState {
  width: number;
  height: number;
  tier: ScreenTier;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  pixelRatio: number;
  isTVOrBillboard: boolean;
  scaleFactor: number;
  simulationTier: ScreenTier | 'auto';
}

function calculateTier(width: number): ScreenTier {
  if (width < 640) return 'phone';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'laptop';
  if (width < 2160) return 'desktop';
  if (width < 2560) return 'ultrawide';
  if (width < 3840) return 'tv';
  return 'billboard';
}

function calculateScaleFactor(tier: ScreenTier): number {
  switch (tier) {
    case 'phone':
      return 1.0;
    case 'tablet':
      return 1.05;
    case 'laptop':
      return 1.0;
    case 'desktop':
      return 1.1;
    case 'ultrawide':
      return 1.2;
    case 'tv':
      return 1.45;
    case 'billboard':
      return 1.85;
    default:
      return 1.0;
  }
}

export function useScreenFit() {
  const [fitState, setFitState] = useState<ScreenFitState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    tier: 'laptop',
    orientation: 'landscape',
    isTouch: false,
    pixelRatio: 1,
    isTVOrBillboard: false,
    scaleFactor: 1.0,
    simulationTier: 'auto',
  });

  const updateFitMetrics = useCallback((overrideWidth?: number, overrideHeight?: number) => {
    if (typeof window === 'undefined') return;

    const w = overrideWidth ?? window.innerWidth;
    const h = overrideHeight ?? window.innerHeight;
    const tier = calculateTier(w);
    const orientation = w >= h ? 'landscape' : 'portrait';
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const pixelRatio = window.devicePixelRatio || 1;
    const isTVOrBillboard = tier === 'tv' || tier === 'billboard';
    const scaleFactor = calculateScaleFactor(tier);

    // Apply attributes directly to root HTML element for instant global CSS auto-fit
    const root = document.documentElement;
    root.setAttribute('data-screen-tier', tier);
    root.setAttribute('data-orientation', orientation);
    root.setAttribute('data-touch', isTouch ? 'true' : 'false');
    root.setAttribute('data-tv-billboard', isTVOrBillboard ? 'true' : 'false');
    root.style.setProperty('--screen-w', `${w}px`);
    root.style.setProperty('--screen-h', `${h}px`);
    root.style.setProperty('--screen-scale-factor', `${scaleFactor}`);

    setFitState((prev) => ({
      ...prev,
      width: w,
      height: h,
      tier,
      orientation,
      isTouch,
      pixelRatio,
      isTVOrBillboard,
      scaleFactor,
    }));
  }, []);

  useEffect(() => {
    updateFitMetrics();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateFitMetrics();
      }, 50);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateFitMetrics]);

  return { fitState, updateFitMetrics };
}
