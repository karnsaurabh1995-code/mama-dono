import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeEmail, isValidEmail, generateEmailOtp, hashOtpCode } from '@/lib/auth/email-otp';
import { sendLoginVerificationCode } from '@/lib/email/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter your email address.' },
        { status: 400 }
      );
    }

    const normEmail = normalizeEmail(email);
    if (!isValidEmail(normEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' },
        { status: 400 }
      );
    }

    // IP Extraction for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // Rate Limit Checks
    const rateCheck = db.checkEmailOtpRateLimit(normEmail, clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.error || 'Too many OTP requests. Please try again later.',
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Cooldown check on existing active challenge
    const existing = db.getEmailOtpChallenge(normEmail);
    if (existing && Date.now() < existing.resendCooldownUntil) {
      const waitSec = Math.ceil((existing.resendCooldownUntil - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${waitSec}s before requesting another verification code.`,
          retryAfterSeconds: waitSec,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP code & HMAC-SHA256 digest
    const otpCode = generateEmailOtp();
    const digest = hashOtpCode(otpCode);

    // Save protected challenge record
    const challenge = db.createEmailOtpChallenge(normEmail, digest);
    db.recordEmailOtpRateLimit(normEmail, clientIp);

    // Deliver email via centralized email service
    const sendResult = await sendLoginVerificationCode(normEmail, otpCode);
    if (!sendResult.success) {
      db.deleteEmailOtpChallenge(normEmail);
      return NextResponse.json(
        {
          success: false,
          error: sendResult.error || 'Unable to deliver verification email. Please verify your address and try again.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email inbox.',
      email: normEmail,
      resendCooldown: 60,
      expiresAt: challenge.expiresAt,
      // Provide devCode only in non-production for local simulation testing
      ...(sendResult.devCode ? { devCode: sendResult.devCode } : {}),
    });
  } catch (err: any) {
    console.error('[API /api/auth/email-otp/request] Unexpected error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing verification code.' },
      { status: 500 }
    );
  }
}
