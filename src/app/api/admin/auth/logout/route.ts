import { NextResponse } from 'next/server';
import { clearServerSession } from '@/lib/auth/server';

export async function POST() {
  try {
    await clearServerSession();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    console.error('[Admin Logout Error]:', error);
    return NextResponse.json({ success: false, error: 'Could not complete logout.' }, { status: 500 });
  }
}
