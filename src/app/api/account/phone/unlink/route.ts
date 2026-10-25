import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession, setServerSession } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getServerSession();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required to unlink mobile number.' },
        { status: 401 }
      );
    }

    const unlinkResult = db.unlinkUserPhone(currentUser.id, currentUser.name);
    if (!unlinkResult.success || !unlinkResult.user) {
      return NextResponse.json(
        { error: unlinkResult.error || 'Failed to unlink mobile number.' },
        { status: 400 }
      );
    }

    // Refresh server session with unlinked phone
    await setServerSession(unlinkResult.user);

    return NextResponse.json({
      success: true,
      message: 'Mobile number unlinked from your account.',
      user: {
        id: unlinkResult.user.id,
        name: unlinkResult.user.name,
        email: unlinkResult.user.email,
        phone: undefined,
        phoneVerified: false,
        role: unlinkResult.user.role,
      },
    });
  } catch (err: any) {
    console.error('[AUTH ERROR] account unlink phone failed:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while unlinking mobile number.' },
      { status: 500 }
    );
  }
}
