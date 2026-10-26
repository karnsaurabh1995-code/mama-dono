import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required for database export' }, { status: 401 });
    }

    const snapshot = db.exportDatabaseSnapshot();
    return new Response(snapshot, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dokind_database_snapshot_${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/database/snapshot GET] Error:', error);
    return NextResponse.json({ error: 'Failed to export database snapshot' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin or Admin role required for snapshot restore' }, { status: 401 });
    }

    const body = await request.json();
    const rawSnapshot = typeof body === 'string' ? body : JSON.stringify(body);

    const success = db.importDatabaseSnapshot(rawSnapshot, session.name || 'Admin User');
    if (!success) {
      return NextResponse.json({ error: 'Invalid database snapshot JSON or schema mismatch' }, { status: 400 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/about');
      revalidatePath('/campaigns');
      revalidatePath('/faq');
      revalidatePath('/admin');
    } catch (e) {
      console.warn('[Snapshot Restore] Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Platform state successfully restored and persisted to disk.',
      settings: db.getSiteSettings(),
    });
  } catch (error: any) {
    console.error('[API /api/admin/database/snapshot POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
