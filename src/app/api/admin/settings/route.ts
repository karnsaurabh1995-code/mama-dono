import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';
import { SiteSettings } from '@/lib/types';

/**
 * ADMIN SETTINGS API
 *
 * GET: Retrieves the authoritative platform settings
 * POST: Updates and persists platform settings with RBAC verification & cache revalidation
 */

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'support_admin', 'marketer', 'ops_admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Administrator access required' }, { status: 401 });
    }

    const settings = db.getSiteSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('[API /api/admin/settings GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'support_admin'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: High-level administrative authority required to modify site settings' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    // Input validation & sanitation
    const updates: Partial<SiteSettings> = {};

    if (body.platformName !== undefined) updates.platformName = String(body.platformName).trim();
    if (body.tagline !== undefined) updates.tagline = String(body.tagline).trim();
    if (body.contactEmail !== undefined) {
      const email = String(body.contactEmail).trim();
      if (email && !email.includes('@')) {
        return NextResponse.json({ error: 'Invalid contact email address' }, { status: 400 });
      }
      updates.contactEmail = email;
    }
    if (body.contactPhone !== undefined) updates.contactPhone = String(body.contactPhone).trim();
    if (body.supportAddress !== undefined) updates.supportAddress = String(body.supportAddress).trim();
    if (body.darpanPortalRef !== undefined) updates.darpanPortalRef = String(body.darpanPortalRef).trim();
    if (body.isTestMode !== undefined) updates.isTestMode = Boolean(body.isTestMode);
    if (body.liveTickerEnabled !== undefined) updates.liveTickerEnabled = Boolean(body.liveTickerEnabled);
    if (body.maintenanceMode !== undefined) updates.maintenanceMode = Boolean(body.maintenanceMode);
    if (body.maintenanceMessage !== undefined) updates.maintenanceMessage = String(body.maintenanceMessage).trim();
    if (body.minimumDonationINR !== undefined) updates.minimumDonationINR = Math.max(10, Number(body.minimumDonationINR) || 50);
    if (body.enableTax80G !== undefined) updates.enableTax80G = Boolean(body.enableTax80G);
    if (body.platformFeeEnabled !== undefined) updates.platformFeeEnabled = Boolean(body.platformFeeEnabled);
    if (body.defaultPlatformFeePercent !== undefined) updates.defaultPlatformFeePercent = Number(body.defaultPlatformFeePercent);
    if (body.tickerMode !== undefined) updates.tickerMode = body.tickerMode;
    if (body.trustMessages !== undefined && Array.isArray(body.trustMessages)) updates.trustMessages = body.trustMessages;
    if (body.logoUrl !== undefined) updates.logoUrl = String(body.logoUrl).trim();
    if (body.logoLightUrl !== undefined) updates.logoLightUrl = String(body.logoLightUrl).trim();
    if (body.logoDarkUrl !== undefined) updates.logoDarkUrl = String(body.logoDarkUrl).trim();
    if (body.logoFaviconUrl !== undefined) updates.logoFaviconUrl = String(body.logoFaviconUrl).trim();

    const updatedSettings = db.updateSiteSettings(updates, session.name || 'Administrator');

    // Next.js App Router targeted cache revalidation
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/about');
      revalidatePath('/contact');
      revalidatePath('/faq');
    } catch (revalidateErr) {
      console.warn('[API /api/admin/settings] Revalidation notice:', revalidateErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Platform settings and security configurations saved successfully',
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('[API /api/admin/settings POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
