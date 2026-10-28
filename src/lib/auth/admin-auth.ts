import { db } from '@/lib/db';
import { verifyPassword } from './password';
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

export async function authenticateAdmin(
  identifier: string,
  password: string
): Promise<{ success: boolean; user?: User; requiresPasswordChange?: boolean; error?: string }> {
  if (!identifier || !password) {
    return { success: false, error: 'Admin ID / Email and password are required.' };
  }

  const clean = identifier.trim();
  const user = db.getUserByUsernameOrEmail(clean);

  // If user does not exist or has no password hash or is suspended
  if (!user || !user.passwordHash || user.status === 'suspended') {
    return { success: false, error: 'Invalid Admin ID or Password.' };
  }

  // Verify password using timingSafeEqual
  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return { success: false, error: 'Invalid Admin ID or Password.' };
  }

  // Verify role has administration access
  const isSuperAdmin = user.role === 'super_admin' || (user.secondaryRole === 'super_admin');
  const hasStaffRole = ALLOWED_ADMIN_ROLES.includes(user.role) || (user.secondaryRole && ALLOWED_ADMIN_ROLES.includes(user.secondaryRole));

  if (!isSuperAdmin && !hasStaffRole) {
    return { success: false, error: 'Access denied: insufficient administrative privileges.' };
  }

  return {
    success: true,
    user,
    requiresPasswordChange: !!user.requiresPasswordChange,
  };
}
