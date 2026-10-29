import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { setServerSession, isStaffRole } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = body?.email;
    const password = body?.password;

    if (!rawEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(rawEmail).trim().toLowerCase();

    // 1. Administrative accounts MUST authenticate via /admin/login
    if (db.isDesignatedSuperAdmin(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Administrative accounts must authenticate via the Dokind Admin Portal.',
          isAdminRedirect: true,
        },
        { status: 403 }
      );
    }

    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (isStaffRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Administrative accounts must authenticate via the Dokind Admin Portal.',
          isAdminRedirect: true,
        },
        { status: 403 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Account suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password hash
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Password not set for this account. Please sign in with OTP.' },
        { status: 400 }
      );
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Set signed server session
    await setServerSession(user);

    db.createAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'USER_PASSWORD_LOGIN',
      targetType: 'user',
      targetId: user.id,
      details: `Logged in via email/password (${user.email})`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || '',
      },
      redirectUrl: user.role === 'fundraiser' ? '/fundraiser/dashboard' : '/account',
    });
  } catch (error: any) {
    console.error('[API /api/auth/login] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed due to internal error.' },
      { status: 500 }
    );
  }
}
