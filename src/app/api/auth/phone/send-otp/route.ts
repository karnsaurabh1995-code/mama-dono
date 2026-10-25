import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { sendMsg91Otp } from '@/lib/auth/msg91';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body?.phone;

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a valid mobile number.' },
        { status: 400 }
      );
    }

    // 1. Phone number normalization & format validation
    const norm = normalizePhoneNumber(rawPhone);
    if (!norm.isValid) {
      return NextResponse.json(
        { error: norm.error || 'Invalid mobile number. Please check and try again.' },
        { status: 400 }
      );
    }

    // 2. Client IP resolution for abuse control
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // 3. Multi-dimensional Rate Limiting (IP & Phone)
    const ipLimit = db.checkOtpRateLimit(clientIp, 'ip');
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: ipLimit.error, retryAfterSeconds: ipLimit.retryAfterSeconds },
        { status: 429 }
      );
    }

    const phoneLimit = db.checkOtpRateLimit(norm.e164, 'phone');
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { error: phoneLimit.error, retryAfterSeconds: phoneLimit.retryAfterSeconds },
        { status: 429 }
      );
    }

    // 4. Resend cooldown enforcement (60 seconds)
    const existingChallenge = db.getOtpChallenge(norm.e164);
    if (existingChallenge && Date.now() < existingChallenge.resendCooldownUntil) {
      const waitSeconds = Math.ceil((existingChallenge.resendCooldownUntil - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Please wait ${waitSeconds} seconds before requesting another code.`,
          cooldownSeconds: waitSeconds,
        },
        { status: 429 }
      );
    }

    // 5. Trigger MSG91 OTP Dispatch
    const sendResult = await sendMsg91Otp({
      mobile: norm.msg91Mobile,
      ip: clientIp,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.message || 'Failed to send verification SMS. Please try again.' },
        { status: sendResult.statusCode && sendResult.statusCode < 500 ? sendResult.statusCode : 502 }
      );
    }

    // 6. Record rate limiting and create challenge ledger entry
    db.recordOtpRateLimit(clientIp, 'ip');
    db.recordOtpRateLimit(norm.e164, 'phone');
    const challenge = db.createOtpChallenge(norm.e164);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${norm.masked}`,
      maskedPhone: norm.masked,
      cooldownSeconds: 60,
      challengeId: challenge.id,
      provider: sendResult.provider,
      ...(sendResult.rawResponse ? { devHint: sendResult.rawResponse } : {}),
    });
  } catch (err: any) {
    console.error('[AUTH ERROR] send-otp failed:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending OTP. Please try again.' },
      { status: 500 }
    );
  }
}
