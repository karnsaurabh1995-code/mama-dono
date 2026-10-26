import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';
import { PageSection } from '@/lib/types';

export const dynamic = 'force-dynamic';

function getRevalidateTarget(slug: string): string {
  switch (slug) {
    case 'home':
      return '/';
    case 'campaigns':
      return '/campaigns';
    case 'monthly-giving':
      return '/monthly-giving';
    case 'product-giving':
      return '/product-giving';
    case 'about':
      return '/about';
    case 'how-it-works':
      return '/how-it-works';
    case 'donate-checkout':
      return '/donate';
    case 'contact-faq':
      return '/contact';
    default:
      return '/';
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'content_editor', 'content_writer'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Content Editor or Administrator role required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'home';

    const draftSections = db.getPageSections(slug);
    const publishedSections = db.getPublishedPageSections(slug);
    const versions = db.getPageVersions(slug);

    return NextResponse.json({
      success: true,
      slug,
      draftSections,
      publishedSections,
      versions,
    });
  } catch (error: any) {
    console.error('[API /api/admin/website-builder GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'content_editor'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Platform Administrator or Content Editor role required' }, { status: 401 });
    }

    const body = await request.json();
    const slug = body.slug || body.pageSlug || 'home';
    const { action, sections, versionNumber } = body;

    const actorName = session.name || 'Content Editor';
    const targetPath = getRevalidateTarget(slug);

    if (action === 'save_draft') {
      if (!Array.isArray(sections)) {
        return NextResponse.json({ error: 'Invalid sections array' }, { status: 400 });
      }
      const updated = db.updatePageSections(slug, sections as PageSection[], actorName);
      return NextResponse.json({
        success: true,
        message: 'Draft page sections saved successfully.',
        sections: updated,
      });
    }

    if (action === 'publish') {
      if (Array.isArray(sections)) {
        db.updatePageSections(slug, sections as PageSection[], actorName);
      }
      const publishRes = db.publishPageSections(slug, actorName);

      // Revalidate cache for the live public route
      try {
        revalidatePath(targetPath);
      } catch (e) {
        console.warn('[WebsiteBuilder] Cache revalidation warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Version #${publishRes.version} published live!`,
        version: publishRes.version,
        publishedSections: db.getPublishedPageSections(slug),
        versions: db.getPageVersions(slug),
      });
    }

    if (action === 'restore') {
      if (typeof versionNumber !== 'number') {
        return NextResponse.json({ error: 'versionNumber is required for restore' }, { status: 400 });
      }
      const restored = db.restorePageVersion(slug, versionNumber, actorName);
      try {
        revalidatePath(targetPath);
      } catch (e) {
        console.warn('[WebsiteBuilder] Cache revalidation warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Restored page "${slug}" to version #${versionNumber}.`,
        sections: restored,
      });
    }

    if (action === 'reset') {
      const def = db.resetPageSectionsToDefault(slug, actorName);
      try {
        revalidatePath(targetPath);
      } catch (e) {
        console.warn('[WebsiteBuilder] Cache revalidation warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Reset page "${slug}" to default baseline.`,
        sections: def,
        versions: db.getPageVersions(slug),
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/admin/website-builder POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
