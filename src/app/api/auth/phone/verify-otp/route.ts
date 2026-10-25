import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { verifyMsg91Otp } from '@/lib/auth/msg91';
import { setServerSession } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body?.phone;
    const rawOtp = body?.otp;
    const preferredName = body?.name?.trim();

    if (!rawPhone || !rawOtp) {
      return NextResponse.json(
        { error: 'Mobile number and verification OTP code are required.' },
        { status: 400 }
      );
    }

    // 1. Normalize phone number
    const norm = normalizePhoneNumber(rawPhone);
    if (!norm.isValid) {
      return NextResponse.json(
        { error: norm.error || 'Invalid mobile number format.' },
        { status: 400 }
      );
    }

    // 2. Validate active challenge in database ledger
    const challenge = db.getOtpChallenge(norm.e164);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Verification challenge expired or not found. Please request a new code.' },
        { status: 400 }
      );
    }

    // 3. Track verification attempt & enforce brute-force lockout (max 5 attempts)
    const { locked } = db.recordOtpAttempt(norm.e164);
    if (locked) {
      return NextResponse.json(
        {
          error: 'Maximum verification attempts exceeded. For security, this session is locked. Please request a new OTP.',
        },
        { status: 429 }
      );
    }

    // 4. Verify OTP with MSG91 Provider
    const verifyResult = await verifyMsg91Otp({
      mobile: norm.msg91Mobile,
      otp: rawOtp,
    });

    if (!verifyResult.success) {
      const remainingAttempts = Math.max(0, challenge.maxAttempts - challenge.attempts);
      return NextResponse.json(
        {
          error: verifyResult.message || 'Incorrect verification code. Please check and try again.',
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 5. Code is authentic — consume challenge to prevent replay
    db.deleteOtpChallenge(norm.e164);

    // 6. User account association / registration
    let user = db.getUserByPhone(norm.e164);
    let isNewUser = false;

    if (user) {
      // Existing user lookup
      if (user.status === 'suspended') {
        return NextResponse.json(
          { error: 'Your dokind account has been suspended. Please contact Trust & Safety support.' },
          { status: 403 }
        );
      }

      // Mark phone as verified
      user.phoneVerified = true;
      user.phoneVerifiedAt = new Date().toISOString();
      user.lastLoginAt = new Date().toISOString();

      db.createAuditLog({
        actorId: user.id,
        actorName: user.name,
        action: 'USER_PHONE_LOGIN',
        targetType: 'user',
        targetId: user.id,
        details: `Logged in via verified mobile OTP (${norm.masked})`,
      });
    } else {
      // New user registration — strictly provisioned with 'donor' role (NEVER admin/staff)
      isNewUser = true;
      const fallbackEmail = `donor_${norm.msg91Mobile}@dokind.in`;
      const displayName = preferredName || `Donor ${norm.nationalNumber.slice(-4)}`;

      user = db.createUser({
        id: `usr-donor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: displayName,
        email: fallbackEmail,
        phone: norm.e164,
        phoneVerified: true,
        phoneVerifiedAt: new Date().toISOString(),
        role: 'donor', // STRICTLY DONOR
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      db.createAuditLog({
        actorId: user.id,
        actorName: user.name,
        action: 'USER_PHONE_REGISTERED',
        targetType: 'user',
        targetId: user.id,
        details: `Registered new donor account via verified mobile OTP (${norm.masked})`,
      });
    }

    // 7. Establish authoritative server-side session cookie ('dokind_session')
    await setServerSession(user);

    // Determine safe destination based on user's authoritative DB role
    const isAdminUser = ['super_admin', 'admin', 'support_admin', 'ops_admin', 'marketer', 'content_writer', 'reviewer', 'finance'].includes(user.role);
    const redirectUrl = isAdminUser ? '/admin' : '/account';

    return NextResponse.json({
      success: true,
      message: 'Mobile number verified successfully.',
      isNewUser,
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        role: user.role,
        secondaryRole: user.secondaryRole,
        roles: user.roles || (user.secondaryRole ? [user.role, user.secondaryRole] : [user.role]),
        avatarUrl: user.avatarUrl || '',
      },
    });
  } catch (err: any) {
    console.error('[AUTH ERROR] verify-otp failed:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during OTP verification. Please try again.' },
      { status: 500 }
    );
  }
}
