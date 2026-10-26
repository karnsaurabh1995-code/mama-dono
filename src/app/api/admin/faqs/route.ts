import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

const ALLOWED_ADMIN_ROLES = ['super_admin', 'admin', 'marketer', 'content_writer'];

export async function GET() {
  try {
    const faqs = db.getFAQs();
    return NextResponse.json({
      success: true,
      faqs,
    });
  } catch (error: any) {
    console.error('[API /api/admin/faqs GET] Error:', error);
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
    const { question, answer, category = 'donor', showOnHomepage = true, isActive = true } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const created = db.createFAQ(
      {
        question: String(question).trim(),
        answer: String(answer).trim(),
        category,
        showOnHomepage: Boolean(showOnHomepage),
        isActive: Boolean(isActive),
      },
      session.name || 'Admin User'
    );

    try {
      revalidatePath('/');
      revalidatePath('/faq');
      revalidatePath('/admin/faqs');
    } catch (e) {
      console.warn('[FAQs] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      faq: created,
      message: `FAQ "${created.question.substring(0, 30)}..." created.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/faqs POST] Error:', error);
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

    // Reorder mode
    if (body.reorder && Array.isArray(body.orderedIds)) {
      const reordered = db.reorderFAQs(body.orderedIds, session.name || 'Admin User');
      try {
        revalidatePath('/');
        revalidatePath('/faq');
        revalidatePath('/admin/faqs');
      } catch (e) {
        console.warn('[FAQs] Revalidation warning:', e);
      }
      return NextResponse.json({
        success: true,
        faqs: reordered,
        message: 'FAQs reordered successfully.',
      });
    }

    const { id, updates } = body;
    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'ID and updates are required' }, { status: 400 });
    }

    const updated = db.updateFAQ(id, updates, session.name || 'Admin User');
    if (!updated) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/faq');
      revalidatePath('/admin/faqs');
    } catch (e) {
      console.warn('[FAQs] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      faq: updated,
      message: `FAQ updated.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/faqs PUT] Error:', error);
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
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    const success = db.deleteFAQ(id, session.name || 'Admin User');
    if (!success) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/faq');
      revalidatePath('/admin/faqs');
    } catch (e) {
      console.warn('[FAQs] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ removed.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/faqs DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
