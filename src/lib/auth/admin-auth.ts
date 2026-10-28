import crypto from 'crypto';
import { db } from '@/lib/db';
import { verifyPassword, hashPasswordSync } from './password';
import { User, UserRole } from '@/lib/types';

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const ALLOWED_ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'reviewer',
  'finance',
  'content_editor',
  'fundraiser',
  'organization_manager',
];

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export function checkAdminRateLimit(
  identifier: string,
  ip: string
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const cleanId = (identifier || '').trim().toLowerCase();
  const key = `${ip}:${cleanId}`;

  const entry = loginAttempts.get(key);
  if (!entry) {
    return { allowed: true };
  }

  if (now > entry.resetAt) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordAdminFailedAttempt(identifier: string, ip: string): void {
  const now = Date.now();
  const cleanId = (identifier || '').trim().toLowerCase();
  const key = `${ip}:${cleanId}`;

  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearAdminAttempts(identifier: string, ip: string): void {
  const cleanId = (identifier || '').trim().toLowerCase();
  loginAttempts.delete(`${ip}:${cleanId}`);
}

export function resetAllAdminRateLimits(): void {
  loginAttempts.clear();
}

function constantTimeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf-8');
  const bBuf = Buffer.from(b, 'utf-8');
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function authenticateAdmin(
  identifier: string,
  password: string
): Promise<{ success: boolean; user?: User; requiresPasswordChange?: boolean; error?: string }> {
  if (!identifier || !password) {
    return { success: false, error: 'Admin ID / Email and password are required.' };
  }

  const clean = identifier.trim();
  const user = db.getUserByUsernameOrEmail(clean);

  // If user does not exist or is suspended -> reject with generic non-enumerating error
  if (!user || user.status === 'suspended') {
    return { success: false, error: 'Invalid Admin ID or Password.' };
  }

  // Verify role has administrative access
  const isSuperAdmin = user.role === 'super_admin' || user.secondaryRole === 'super_admin';
  const hasStaffRole =
    ALLOWED_ADMIN_ROLES.includes(user.role) ||
    (user.secondaryRole && ALLOWED_ADMIN_ROLES.includes(user.secondaryRole));

  if (!isSuperAdmin && !hasStaffRole) {
    return { success: false, error: 'Access denied: insufficient administrative privileges.' };
  }

  // Path A: Standard Authentication when passwordHash is present
  // Once a password hash is stored, ONLY the password matching that hash can authenticate.
  // There is NO fallback to bootstrap passwords once a hash is present.
  if (user.passwordHash) {
    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      return { success: false, error: 'Invalid Admin ID or Password.' };
    }

    return {
      success: true,
      user,
      requiresPasswordChange: !!user.requiresPasswordChange,
    };
  }

  // Path B: Strict One-Time Bootstrap Path when account has NO passwordHash
  // ONLY permitted for designated Super Admin accounts
  const isDesignated = isSuperAdmin && db.isDesignatedSuperAdmin(user.email);
  if (!isDesignated) {
    return { success: false, error: 'Invalid Admin ID or Password.' };
  }

  // Determine bootstrap secret:
  // In production: must be explicitly provided via ADMIN_BOOTSTRAP_PASSWORD
  // In development: fallback to 'sarthakraj726' if not set
  const bootstrapPassword =
    process.env.ADMIN_BOOTSTRAP_PASSWORD ||
    (process.env.NODE_ENV !== 'production' ? 'sarthakraj726' : undefined);

  if (!bootstrapPassword) {
    console.error(
      '[Admin Auth] ADMIN_BOOTSTRAP_NOT_CONFIGURED: Super Admin account has no password hash and ADMIN_BOOTSTRAP_PASSWORD is not configured in production.'
    );
    return { success: false, error: 'Invalid Admin ID or Password.' };
  }

  const matches = constantTimeCompare(password, bootstrapPassword);
  if (!matches) {
    return { success: false, error: 'Invalid Admin ID or Password.' };
  }

  // Bootstrapped successfully: initialize salted scrypt hash, mark requiresPasswordChange, persist, and audit
  const newHash = hashPasswordSync(password);
  user.passwordHash = newHash;
  user.requiresPasswordChange = true;
  db.updateUser(user.id, {
    passwordHash: newHash,
    requiresPasswordChange: true,
  });

  db.createAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: 'SUPER_ADMIN_BOOTSTRAPPED',
    targetType: 'user',
    targetId: user.id,
    details: `Designated Super Admin (${user.email}) initialized credentials via one-time bootstrap authentication. Password rotation required.`,
  });

  return {
    success: true,
    user,
    requiresPasswordChange: true,
  };
}
