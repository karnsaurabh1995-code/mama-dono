import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

const ALLOWED_ADMIN_ROLES = ['super_admin', 'admin', 'marketer'];

export async function GET() {
  try {
    const redirects = db.getRedirectRules();
    const settings = db.getSiteSettings();

    return NextResponse.json({
      success: true,
      redirects,
      seo: {
        metaTitle: settings.metaTitle || 'dokind — India’s Transparent Crowdfunding Platform',
        metaDescription: settings.metaDescription || 'Support urgent pediatric surgeries, hospital food missions, and verified grassroots NGOs across India.',
        gaId: settings.googleAnalyticsId || 'G-DOKIND2026',
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/redirects GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // If updating SEO metadata
    if (body.type === 'seo') {
      const { metaTitle, metaDescription, gaId } = body;
      const updatedSettings = db.updateSiteSettings(
        {
          metaTitle: metaTitle ? String(metaTitle).trim() : undefined,
          metaDescription: metaDescription ? String(metaDescription).trim() : undefined,
          googleAnalyticsId: gaId ? String(gaId).trim() : undefined,
        },
        session.name || 'Admin User'
      );

      try {
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/admin/seo');
      } catch (e) {
        console.warn('[SEO] Revalidation warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: 'Global SEO metadata and tracking tags saved and persisted.',
        seo: {
          metaTitle: updatedSettings.metaTitle,
          metaDescription: updatedSettings.metaDescription,
          gaId: updatedSettings.googleAnalyticsId,
        },
      });
    }

    // Creating a redirect rule
    const { fromPath, toPath, statusCode = 301, isActive = true } = body;
    if (!fromPath || !toPath) {
      return NextResponse.json({ error: 'Both fromPath and toPath are required' }, { status: 400 });
    }

    const newRule = db.createRedirectRule(
      {
        fromPath: String(fromPath).trim(),
        toPath: String(toPath).trim(),
        statusCode: Number(statusCode) as 301 | 302,
        isActive: Boolean(isActive),
      },
      session.name || 'Admin User'
    );

    try {
      revalidatePath('/admin/seo');
    } catch (e) {
      console.warn('[Redirects] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      redirect: newRule,
      message: `Redirect from ${newRule.fromPath} to ${newRule.toPath} created.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/redirects POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'ID and updates are required' }, { status: 400 });
    }

    const updated = db.updateRedirectRule(id, updates, session.name || 'Admin User');
    if (!updated) {
      return NextResponse.json({ error: 'Redirect rule not found' }, { status: 404 });
    }

    try {
      revalidatePath('/admin/seo');
    } catch (e) {
      console.warn('[Redirects] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      redirect: updated,
      message: 'Redirect rule updated.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/redirects PUT] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Redirect ID is required' }, { status: 400 });
    }

    const success = db.deleteRedirectRule(id, session.name || 'Admin User');
    if (!success) {
      return NextResponse.json({ error: 'Redirect rule not found' }, { status: 404 });
    }

    try {
      revalidatePath('/admin/seo');
    } catch (e) {
      console.warn('[Redirects] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Redirect rule removed.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/redirects DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
