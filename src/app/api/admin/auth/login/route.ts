import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  checkAdminRateLimit,
  recordAdminFailedAttempt,
  clearAdminAttempts,
  authenticateAdmin,
} from '@/lib/auth/admin-auth';
import { setServerSession } from '@/lib/auth/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { identifier, password } = body;

    if (!identifier || typeof identifier !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Admin identifier and password are required.' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const rateCheck = checkAdminRateLimit(identifier, ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSeconds || 60} seconds.`,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Authentication attempt
    const authResult = await authenticateAdmin(identifier, password);

    if (!authResult.success || !authResult.user) {
      recordAdminFailedAttempt(identifier, ip);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Invalid Admin ID or Password.' },
        { status: 401 }
      );
    }

    // Clear rate limiter on success
    clearAdminAttempts(identifier, ip);

    // Update last login timestamp
    const now = new Date().toISOString();
    db.updateUser(authResult.user.id, { lastLoginAt: now });

    // Establish cryptographic session
    await setServerSession(authResult.user);

    // Audit log
    db.createAuditLog({
      actorId: authResult.user.id,
      actorName: authResult.user.name,
      action: 'ADMIN_LOGIN_SUCCESS',
      targetType: 'user',
      targetId: authResult.user.id,
      details: `Admin user ${authResult.user.email} (${authResult.user.username || 'n/a'}) signed in successfully from ${ip}`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        name: authResult.user.name,
        email: authResult.user.email,
        username: authResult.user.username,
        role: authResult.user.role,
        requiresPasswordChange: !!authResult.requiresPasswordChange,
      },
      requiresPasswordChange: !!authResult.requiresPasswordChange,
    });
  } catch (error: any) {
    console.error('[Admin Login Error]:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected internal error occurred during authentication.' },
      { status: 500 }
    );
  }
}
