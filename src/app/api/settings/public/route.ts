import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PUBLIC WEBSITE SETTINGS ENDPOINT
 *
 * Exposes only safe, public-facing settings required by visitor UI (header, footer, contact).
 * Strictly redacts all server-side secrets, payment keys, and administrative metadata.
 */

export async function GET() {
  try {
    const s = db.getSiteSettings();
    const activeTopBanners = typeof db.getAnnouncements === 'function'
      ? db.getAnnouncements('top_banner').filter((a) => a.isActive)
      : [];

    return NextResponse.json(
      {
        success: true,
        settings: {
          platformName: s.platformName || 'dokind',
          tagline: s.tagline || 'Transparent Indian Crowdfunding',
          contactEmail: s.contactEmail || 'support@dokind.org.in',
          contactPhone: s.contactPhone || '+91 80 4719 2300',
          supportAddress: s.supportAddress || 'dokind Foundation, Connaught Place, New Delhi - 110001, India',
          darpanPortalRef: s.darpanPortalRef || 'NITI Aayog NGO-Darpan Portal Recognized',
          maintenanceMode: Boolean(s.maintenanceMode),
          maintenanceMessage: s.maintenanceMessage || 'Platform maintenance in progress. All donations and campaigns remain secure.',
          logoUrl: s.logoUrl || '',
          logoLightUrl: s.logoLightUrl || '',
          logoDarkUrl: s.logoDarkUrl || '',
          logoFaviconUrl: s.logoFaviconUrl || '',
          tickerMode: s.tickerMode || 'live_donations',
          trustMessages: s.trustMessages || [],
          minimumDonationINR: s.minimumDonationINR || 50,
          enableTax80G: s.enableTax80G !== false,
          topBanner: activeTopBanners.length > 0 ? {
            id: activeTopBanners[0].id,
            title: activeTopBanners[0].title,
            message: activeTopBanners[0].message,
            link: activeTopBanners[0].link,
            type: activeTopBanners[0].type,
          } : null,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[API /api/settings/public] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
