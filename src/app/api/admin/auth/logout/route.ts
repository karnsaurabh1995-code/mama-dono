import { NextResponse } from 'next/server';
import { clearServerSession, getServerSession } from '@/lib/auth/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const sessionUser = await getServerSession();
    if (sessionUser?.id) {
      db.updateUser(sessionUser.id, {
        sessionRevokedAt: new Date().toISOString(),
      });
    }
    await clearServerSession();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    console.error('[Admin Logout Error]:', error);
    return NextResponse.json({ success: false, error: 'Could not complete logout.' }, { status: 500 });
  }
}
