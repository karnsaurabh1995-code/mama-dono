import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeEmail, verifyOtpCode } from '@/lib/auth/email-otp';
import { setServerSession } from '@/lib/auth/server';
import { User } from '@/lib/types';
import { INITIAL_SUPER_ADMIN_ACCOUNTS, DEMO_USERS } from '@/lib/auth/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const normEmail = normalizeEmail(email);
    const cleanDigits = String(code).trim().replace(/\D/g, '');

    if (cleanDigits.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter the complete 6-digit verification code.' },
        { status: 400 }
      );
    }

    // 1. Retrieve active challenge
    const challenge = db.getEmailOtpChallenge(normEmail);
    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification code has expired or was not found. Please request a new code.',
        },
        { status: 400 }
      );
    }

    // 2. Validate timing-safe HMAC digest
    const isValid = verifyOtpCode(cleanDigits, challenge.codeDigest);

    if (!isValid) {
      const attemptResult = db.recordEmailOtpAttempt(normEmail);
      if (attemptResult.locked) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many incorrect attempts. This code has been locked for security. Please request a new code.',
          },
          { status: 429 }
        );
      }

      const remainingAttempts = challenge.maxAttempts - challenge.attempts;
      return NextResponse.json(
        {
          success: false,
          error: `Incorrect verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 3. Code is valid — Atomically consume challenge
    db.consumeEmailOtpChallenge(normEmail);

    // 4. Retrieve or register user
    let user: User | undefined = db.getUserByEmail(normEmail);

    // Check designated super admins
    if (!user && db.isDesignatedSuperAdmin(normEmail)) {
      user = INITIAL_SUPER_ADMIN_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === normEmail
      );
    }

    // Check demo users
    if (!user) {
      user = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === normEmail
      );
    }

    // If user does not exist, securely create new verified account with standard 'donor' role
    if (!user) {
      const newUser: User = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: normEmail.split('@')[0],
        email: normEmail,
        role: 'donor',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.createUser(newUser);
      user = newUser;
    }

    // 5. Establish secure HTTP-only server session cookie ('dokind_session')
    await setServerSession(user);

    // 6. Return sanitized display snapshot
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. Welcome to Dokind!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        secondaryRole: user.secondaryRole,
        roles: user.roles || (user.secondaryRole ? [user.role, user.secondaryRole] : [user.role]),
        avatarUrl: user.avatarUrl,
        department: user.department,
        jobTitle: user.jobTitle,
        employeeId: user.employeeId,
      },
    });
  } catch (err: any) {
    console.error('[API /api/auth/email-otp/verify] Unexpected error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error while verifying code.' },
      { status: 500 }
    );
  }
}
