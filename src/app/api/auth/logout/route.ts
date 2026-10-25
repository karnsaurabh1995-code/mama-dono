import { NextResponse } from 'next/server';
import { clearServerSession } from '@/lib/auth/server';

export async function POST() {
  try {
    await clearServerSession();
    return NextResponse.json({ success: true, message: 'Signed out successfully.' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
