'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export interface PublicSiteSettings {
  platformName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  supportAddress: string;
  darpanPortalRef: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  logoFaviconUrl?: string;
  tickerMode?: string;
  trustMessages?: string[];
  minimumDonationINR?: number;
  enableTax80G?: boolean;
  topBanner?: {
    id: string;
    title: string;
    message: string;
    link?: string;
    type: 'info' | 'urgent' | 'success';
  } | null;
}

const DEFAULT_SETTINGS: PublicSiteSettings = {
  platformName: 'dokind',
  tagline: 'Transparent Indian Crowdfunding',
  contactEmail: 'support@dokind.org.in',
  contactPhone: '+91 80 4719 2300',
  supportAddress: 'dokind Foundation, Connaught Place, New Delhi - 110001, India',
  darpanPortalRef: 'NITI Aayog NGO-Darpan Portal Recognized',
  maintenanceMode: false,
  maintenanceMessage: 'Platform maintenance in progress. All donations and campaigns remain secure.',
  tickerMode: 'live_donations',
  trustMessages: [],
  minimumDonationINR: 50,
  enableTax80G: true,
  topBanner: null,
};

interface SiteSettingsContextValue {
  settings: PublicSiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings/public', {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      }
    } catch (err) {
      console.warn('[SiteSettingsProvider] Failed to fetch public settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Real-time synchronization: when admin saves settings, update immediately across all open tabs
  useRealtimeSync(
    useCallback(
      (event: string) => {
        if (event === 'site_settings_updated') {
          refreshSettings();
        }
      },
      [refreshSettings]
    )
  );

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      refreshSettings: async () => {},
    };
  }
  return context;
}
