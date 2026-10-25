import crypto from 'crypto';

/**
 * Normalizes email address deterministically:
 * - Trims surrounding whitespace
 * - Converts to lowercase
 * Preserves specific domain formatting without stripping dots/plus tags
 */
export function normalizeEmail(rawEmail: string): string {
  if (!rawEmail || typeof rawEmail !== 'string') return '';
  return rawEmail.trim().toLowerCase();
}

/**
 * Validates email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  // Standard RFC-compliant email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(clean);
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 * Uses crypto.randomInt to guarantee uniform randomness and 6-digit string format.
 */
export function generateEmailOtp(): string {
  // Generates integer in range [100000, 999999] inclusive
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Computes a keyed HMAC-SHA256 digest of the 6-digit OTP code.
 * Plaintext codes are never stored in the database.
 */
export function hashOtpCode(code: string, secret?: string): string {
  const hmacSecret = secret || process.env.AUTH_SECRET || 'dokind-email-otp-hmac-salt-secret-2026';
  return crypto.createHmac('sha256', hmacSecret).update(code.trim()).digest('hex');
}

/**
 * Verifies an entered OTP code against the stored HMAC-SHA256 digest
 * using timing-safe constant-time byte comparison.
 */
export function verifyOtpCode(enteredCode: string, storedDigest: string, secret?: string): boolean {
  try {
    if (!enteredCode || !storedDigest) return false;
    const cleanDigits = enteredCode.trim().replace(/\D/g, '');
    if (cleanDigits.length !== 6) return false;

    const candidateDigest = hashOtpCode(cleanDigits, secret);
    const candidateBuf = Buffer.from(candidateDigest, 'hex');
    const storedBuf = Buffer.from(storedDigest, 'hex');

    if (candidateBuf.length !== storedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateBuf, storedBuf);
  } catch {
    return false;
  }
}
