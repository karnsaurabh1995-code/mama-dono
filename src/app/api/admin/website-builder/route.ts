import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { publishingRepo } from '@/lib/publishing/repository';
import { getServerSession } from '@/lib/auth/server';
import { PageSection, PageSectionType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID_PAGE_SLUGS = [
  'home',
  'campaigns',
  'monthly-giving',
  'product-giving',
  'about',
  'how-it-works',
  'contact',
  'help',
  'contact-faq',
];

const VALID_SECTION_TYPES: PageSectionType[] = [
  'hero',
  'urgent_strip',
  'categories',
  'featured_campaigns',
  'monthly_missions',
  'products',
  'stats',
  'testimonials',
  'faq',
  'cta_box',
];

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
    case 'contact':
    case 'contact-faq':
      return '/contact';
    case 'help':
      return '/help';
    default:
      return '/';
  }
}

function validateSections(sections: any[]): { valid: boolean; error?: string; cleanSections?: PageSection[] } {
  if (!Array.isArray(sections) || sections.length === 0) {
    return { valid: false, error: 'Sections payload must be a non-empty array.' };
  }

  const cleanSections: PageSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (!s || typeof s !== 'object') {
      return { valid: false, error: `Section at index ${i} is not a valid object.` };
    }

    if (!s.id || typeof s.id !== 'string') {
      return { valid: false, error: `Section at index ${i} is missing a valid 'id' string.` };
    }

    if (!s.type || !VALID_SECTION_TYPES.includes(s.type)) {
      return {
        valid: false,
        error: `Section "${s.id}" has unsupported type "${s.type}". Allowed: ${VALID_SECTION_TYPES.join(', ')}`,
      };
    }

    cleanSections.push({
      id: String(s.id).trim(),
      pageSlug: String(s.pageSlug || 'home').trim(),
      type: s.type,
      title: typeof s.title === 'string' ? s.title.trim() : '',
      subtitle: typeof s.subtitle === 'string' ? s.subtitle.trim() : undefined,
      badge: typeof s.badge === 'string' ? s.badge.trim() : undefined,
      ctaText: typeof s.ctaText === 'string' ? s.ctaText.trim() : undefined,
      ctaLink: typeof s.ctaLink === 'string' ? s.ctaLink.trim() : undefined,
      order: typeof s.order === 'number' ? s.order : i,
      isVisible: s.isVisible !== false,
      settings: typeof s.settings === 'object' && s.settings !== null ? s.settings : {},
    });
  }

  return { valid: true, cleanSections };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'content_editor', 'content_writer'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Content Editor or Administrator role required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get('slug') || 'home';
    const slug = VALID_PAGE_SLUGS.includes(rawSlug) ? rawSlug : 'home';

    const draftSections = await publishingRepo.getDraftSections(slug);
    const publishedSections = await publishingRepo.getPublishedSections(slug);
    const versions = await publishingRepo.getVersions(slug);

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
    const rawSlug = body.slug || body.pageSlug || 'home';
    const slug = VALID_PAGE_SLUGS.includes(rawSlug) ? rawSlug : 'home';
    const { action, sections, versionNumber } = body;

    const actorName = session.name || 'Content Editor';
    const targetPath = getRevalidateTarget(slug);

    if (action === 'save_draft') {
      const validation = validateSections(sections);
      if (!validation.valid || !validation.cleanSections) {
        return NextResponse.json({ error: validation.error || 'Invalid sections array' }, { status: 400 });
      }

      const updated = await publishingRepo.saveDraft(slug, validation.cleanSections, actorName);
      return NextResponse.json({
        success: true,
        message: 'Draft page sections saved successfully.',
        sections: updated,
      });
    }

    if (action === 'publish') {
      let cleanSectionsToPublish: PageSection[];

      if (Array.isArray(sections)) {
        const validation = validateSections(sections);
        if (!validation.valid || !validation.cleanSections) {
          return NextResponse.json({ error: validation.error || 'Invalid sections array' }, { status: 400 });
        }
        cleanSectionsToPublish = validation.cleanSections;
      } else {
        cleanSectionsToPublish = await publishingRepo.getDraftSections(slug);
      }

      // Execute authoritative publication through shared publishing repository
      const publishRes = await publishingRepo.publish(slug, cleanSectionsToPublish, actorName);

      // Revalidate cache for the live public route
      try {
        revalidatePath(targetPath);
      } catch (e) {
        console.warn('[WebsiteBuilder] Cache revalidation warning:', e);
      }

      const allVersions = await publishingRepo.getVersions(slug);

      return NextResponse.json({
        success: true,
        message: `Version #${publishRes.version} published live!`,
        version: publishRes.version,
        publishedSections: publishRes.publishedSections,
        versions: allVersions,
      });
    }

    if (action === 'restore') {
      if (typeof versionNumber !== 'number') {
        return NextResponse.json({ error: 'versionNumber is required for restore' }, { status: 400 });
      }
      const restored = await publishingRepo.restoreVersion(slug, versionNumber, actorName);
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
      const def = await publishingRepo.resetToDefault(slug, actorName);
      try {
        revalidatePath(targetPath);
      } catch (e) {
        console.warn('[WebsiteBuilder] Cache revalidation warning:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Reset page "${slug}" to default baseline.`,
        sections: def,
        versions: await publishingRepo.getVersions(slug),
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/admin/website-builder POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
