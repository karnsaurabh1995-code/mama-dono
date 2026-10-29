import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdminApiAccess } from '@/lib/auth/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAdminApiAccess();
    if (auth.errorResponse) return auth.errorResponse;

    const announcements = db.getAnnouncements();
    return NextResponse.json({
      success: true,
      announcements,
    });
  } catch (error: any) {
    console.error('[API /api/admin/announcements GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminApiAccess([
      'super_admin',
      'admin',
      'marketer',
      'content_writer',
      'content_editor',
    ]);
    if (auth.errorResponse) return auth.errorResponse;
    const session = auth.staff;

    const body = await request.json();
    const { title, message, link, type = 'info', placement = 'top_banner', isActive = true } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const created = db.createAnnouncement(
      {
        title: String(title).trim(),
        message: String(message).trim(),
        link: link ? String(link).trim() : undefined,
        type,
        placement,
        isActive: Boolean(isActive),
        startDate: new Date().toISOString(),
      },
      session.name || 'Admin User'
    );

    try {
      revalidatePath('/');
      revalidatePath('/admin/announcements');
    } catch (e) {
      console.warn('[Announcements] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      announcement: created,
      message: `Announcement "${created.title}" created.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/announcements POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdminApiAccess([
      'super_admin',
      'admin',
      'marketer',
      'content_writer',
      'content_editor',
    ]);
    if (auth.errorResponse) return auth.errorResponse;
    const session = auth.staff;

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'ID and updates are required' }, { status: 400 });
    }

    const updated = db.updateAnnouncement(id, updates, session.name || 'Admin User');
    if (!updated) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/announcements');
    } catch (e) {
      console.warn('[Announcements] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      announcement: updated,
      message: `Announcement "${updated.title}" updated.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/announcements PUT] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminApiAccess(['super_admin', 'admin']);
    if (auth.errorResponse) return auth.errorResponse;
    const session = auth.staff;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const deleted = db.deleteAnnouncement(id, session.name || 'Admin User');
    if (!deleted) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/announcements');
    } catch (e) {
      console.warn('[Announcements] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/announcements DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
