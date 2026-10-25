import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { retryMsg91Otp } from '@/lib/auth/msg91';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body?.phone;
    const retryType = (body?.retryType === 'voice' ? 'voice' : 'text') as 'text' | 'voice';

    if (!rawPhone) {
      return NextResponse.json(
        { error: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    // 1. Phone normalization
    const norm = normalizePhoneNumber(rawPhone);
    if (!norm.isValid) {
      return NextResponse.json(
        { error: norm.error || 'Invalid mobile number format.' },
        { status: 400 }
      );
    }

    // 2. Client IP & rate limit
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const ipLimit = db.checkOtpRateLimit(clientIp, 'ip');
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: ipLimit.error, retryAfterSeconds: ipLimit.retryAfterSeconds },
        { status: 429 }
      );
    }

    // 3. Challenge verification & resend cooldown check
    const challenge = db.getOtpChallenge(norm.e164);
    if (!challenge) {
      return NextResponse.json(
        { error: 'No active OTP verification session found. Please enter your number and request a new code.' },
        { status: 400 }
      );
    }

    const now = Date.now();
    if (now < challenge.resendCooldownUntil) {
      const waitSeconds = Math.ceil((challenge.resendCooldownUntil - now) / 1000);
      return NextResponse.json(
        {
          error: `Please wait ${waitSeconds} seconds before requesting another code.`,
          cooldownSeconds: waitSeconds,
        },
        { status: 429 }
      );
    }

    if (challenge.resendCount >= challenge.maxResends) {
      return NextResponse.json(
        { error: 'Maximum resend limit reached for this session. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    // 4. Call MSG91 Retry API
    const retryResult = await retryMsg91Otp({
      mobile: norm.msg91Mobile,
      retryType,
      ip: clientIp,
    });

    if (!retryResult.success) {
      return NextResponse.json(
        { error: retryResult.message || 'Failed to resend verification code. Please try again later.' },
        { status: 502 }
      );
    }

    // 5. Update challenge state with new cooldown
    challenge.resendCount += 1;
    challenge.resendCooldownUntil = Date.now() + 60 * 1000; // 60s cooldown
    db.recordOtpRateLimit(clientIp, 'ip');
    db.recordOtpRateLimit(norm.e164, 'phone');

    return NextResponse.json({
      success: true,
      message: `OTP resent successfully to ${norm.masked}`,
      cooldownSeconds: 60,
      resendCount: challenge.resendCount,
      ...(retryResult.rawResponse ? { devHint: retryResult.rawResponse } : {}),
    });
  } catch (err: any) {
    console.error('[AUTH ERROR] resend-otp failed:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resending OTP.' },
      { status: 500 }
    );
  }
}
