import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

const ALLOWED_ADMIN_ROLES = ['super_admin', 'admin', 'marketer', 'content_writer'];

export async function GET() {
  try {
    const testimonials = db.getTestimonials();
    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error: any) {
    console.error('[API /api/admin/testimonials GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Administrator access required' }, { status: 401 });
    }

    const body = await request.json();
    const { authorName, role, quote, avatarUrl, rating = 5, featured = true, badge = 'Verified' } = body;

    if (!authorName || !quote) {
      return NextResponse.json({ error: 'Author name and quote are required' }, { status: 400 });
    }

    const created = db.createTestimonial({
      authorName: String(authorName).trim(),
      role: role ? String(role).trim() : 'Supporter',
      quote: String(quote).trim(),
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      rating: Number(rating) || 5,
      featured: Boolean(featured),
      badge: badge ? String(badge).trim() : 'Verified',
      date: new Date().toISOString().split('T')[0],
    });

    try {
      revalidatePath('/');
      revalidatePath('/admin/testimonials');
    } catch (e) {
      console.warn('[Testimonials] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      testimonial: created,
      message: `Testimonial from "${created.authorName}" created.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/testimonials POST] Error:', error);
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

    const updated = db.updateTestimonial(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/testimonials');
    } catch (e) {
      console.warn('[Testimonials] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      testimonial: updated,
      message: `Testimonial from "${updated.authorName}" updated.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/testimonials PUT] Error:', error);
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
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    const success = db.deleteTestimonial(id);
    if (!success) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/testimonials');
    } catch (e) {
      console.warn('[Testimonials] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/testimonials DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
