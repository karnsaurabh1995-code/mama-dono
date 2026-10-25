import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession, setServerSession } from '@/lib/auth/server';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { verifyMsg91Otp } from '@/lib/auth/msg91';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce authenticated session
    const currentUser = await getServerSession();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required to link mobile number.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawPhone = body?.phone;
    const rawOtp = body?.otp;

    if (!rawPhone || !rawOtp) {
      return NextResponse.json(
        { error: 'Mobile number and verification code are required.' },
        { status: 400 }
      );
    }

    // 2. Normalize target phone
    const norm = normalizePhoneNumber(rawPhone);
    if (!norm.isValid) {
      return NextResponse.json(
        { error: norm.error || 'Invalid mobile number format.' },
        { status: 400 }
      );
    }

    // 3. Verify OTP challenge
    const challenge = db.getOtpChallenge(norm.e164);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Verification challenge expired. Please request a new OTP code.' },
        { status: 400 }
      );
    }

    const { locked } = db.recordOtpAttempt(norm.e164);
    if (locked) {
      return NextResponse.json(
        { error: 'Maximum attempts exceeded. This session is locked.' },
        { status: 429 }
      );
    }

    const verifyResult = await verifyMsg91Otp({
      mobile: norm.msg91Mobile,
      otp: rawOtp,
    });

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.message || 'Incorrect verification code.' },
        { status: 400 }
      );
    }

    // 4. Consume challenge
    db.deleteOtpChallenge(norm.e164);

    // 5. Link phone to the authenticated user in DatabaseStore
    const linkResult = db.linkUserPhone(currentUser.id, norm.e164, currentUser.name);
    if (!linkResult.success || !linkResult.user) {
      return NextResponse.json(
        { error: linkResult.error || 'Failed to link mobile number.' },
        { status: 400 }
      );
    }

    // 6. Refresh server-side session
    await setServerSession(linkResult.user);

    return NextResponse.json({
      success: true,
      message: `Mobile number ${norm.masked} successfully verified and linked to your account.`,
      user: {
        id: linkResult.user.id,
        name: linkResult.user.name,
        email: linkResult.user.email,
        phone: linkResult.user.phone,
        phoneVerified: linkResult.user.phoneVerified,
        role: linkResult.user.role,
      },
    });
  } catch (err: any) {
    console.error('[AUTH ERROR] account link phone failed:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while linking mobile number.' },
      { status: 500 }
    );
  }
}
