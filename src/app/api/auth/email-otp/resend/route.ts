import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeEmail, isValidEmail, generateEmailOtp, hashOtpCode } from '@/lib/auth/email-otp';
import { sendLoginVerificationCode } from '@/lib/email/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const normEmail = normalizeEmail(email);
    if (!isValidEmail(normEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const challenge = db.getEmailOtpChallenge(normEmail);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'No active verification session found. Please enter your email again.' },
        { status: 404 }
      );
    }

    // Cooldown verification (60 seconds)
    const now = Date.now();
    if (now < challenge.resendCooldownUntil) {
      const waitSec = Math.ceil((challenge.resendCooldownUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${waitSec}s before requesting a new code.`,
          retryAfterSeconds: waitSec,
        },
        { status: 429 }
      );
    }

    if (challenge.resendCount >= challenge.maxResends) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum resend limit reached for this session. Please wait for this code to expire.',
        },
        { status: 429 }
      );
    }

    // Generate fresh OTP & digest
    const newOtp = generateEmailOtp();
    const digest = hashOtpCode(newOtp);

    challenge.codeDigest = digest;
    challenge.resendCount += 1;
    challenge.resendCooldownUntil = now + 60 * 1000;
    challenge.expiresAt = now + 10 * 60 * 1000;

    const sendResult = await sendLoginVerificationCode(normEmail, newOtp);
    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.error || 'Failed to deliver resend email.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email.',
      resendCooldown: 60,
      expiresAt: challenge.expiresAt,
      ...(sendResult.devCode ? { devCode: sendResult.devCode } : {}),
    });
  } catch (err: any) {
    console.error('[API /api/auth/email-otp/resend] Unexpected error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error while resending code.' },
      { status: 500 }
    );
  }
}
