import { cookies } from 'next/headers';
import crypto from 'crypto';
import { User, UserRole } from '@/lib/types';
import { db } from '@/lib/db';
import { DEMO_USERS, INITIAL_SUPER_ADMIN_ACCOUNTS } from './constants';

export const STAFF_ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'ops_admin',
  'support_admin',
  'finance',
  'reviewer',
  'campaign_manager',
  'content_editor',
  'content_writer',
  'marketer',
  'support_staff',
  'head_staff',
  'lead_generator',
];

export function isStaffRole(role?: string): boolean {
  if (!role) return false;
  return STAFF_ADMIN_ROLES.includes(role as UserRole);
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: AUTH_SECRET environment variable must be configured in production.');
    }
    return 'dokind-local-dev-auth-signing-secret-minimum-32-chars';
  }
  return secret;
}

/**
 * Generates an HMAC-SHA256 signature for a payload string.
 */
function signPayload(payload: string): string {
  const secret = getAuthSecret();
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

/**
 * Validates an HMAC-SHA256 signature using timingSafeEqual to prevent microsecond timing leaks.
 */
function verifySignature(payload: string, signature: string): boolean {
  try {
    const expected = signPayload(payload);
    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

interface SessionData {
  id: string;
  sessionCreatedAt: string;
}

/**
 * Server-Side Session Resolver for Next.js App Router
 *
 * Reads the signed session cookie ('dokind_session') sent by the browser,
 * verifies cryptographic HMAC authenticity, authoritatively validates the user
 * in DatabaseStore, verifies account status, and extracts a safe, serializable
 * user display snapshot.
 */
export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dokind_session')?.value;

    if (!sessionCookie) {
      return null;
    }

    let sessionData: SessionData | null = null;

    // 1. Signed session format: <base64url_payload>.<signature>
    if (sessionCookie.includes('.')) {
      const parts = sessionCookie.split('.');
      if (parts.length === 2) {
        const [encodedPayload, signature] = parts;
        if (verifySignature(encodedPayload, signature)) {
          try {
            const raw = Buffer.from(encodedPayload, 'base64url').toString('utf8');
            sessionData = JSON.parse(raw);
          } catch {
            sessionData = null;
          }
        }
      }
    }

    // 2. Reject any unsigned or tampered session token unconditionally
    if (!sessionData || !sessionData.id) {
      return null;
    }

    // 3. Authoritative lookup in DatabaseStore by ID
    let user: User | undefined = db.getUserById(sessionData.id);

    // 4. Fallback check for designated super admin accounts
    if (!user) {
      const allUsers = db.getUsers();
      const match = allUsers.find((u) => u.id === sessionData?.id);
      if (match) {
        user = match;
      }
    }

    if (!user && (sessionData as any).email && db.isDesignatedSuperAdmin((sessionData as any).email)) {
      user = INITIAL_SUPER_ADMIN_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === (sessionData as any).email.toLowerCase()
      );
    }

    // 5. Fallback check for standard demo users (strictly non-production only)
    if (!user && process.env.NODE_ENV !== 'production') {
      user = Object.values(DEMO_USERS).find(
        (u) => u.id === sessionData?.id
      );
    }

    if (!user) {
      return null;
    }

    // 6. Session validity check: suspended accounts and revoked sessions are denied
    if (user.status === 'suspended') {
      return null;
    }

    if (user.sessionRevokedAt && sessionData.sessionCreatedAt) {
      const revokedTime = new Date(user.sessionRevokedAt).getTime();
      const sessionTime = new Date(sessionData.sessionCreatedAt).getTime();
      if (sessionTime < revokedTime) {
        return null;
      }
    }

    // 7. Return clean serializable display snapshot (No password hashes or sensitive internal tokens)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      secondaryRole: user.secondaryRole,
      roles: user.roles || (user.secondaryRole ? [user.role, user.secondaryRole] : [user.role]),
      avatarUrl: user.avatarUrl || '',
      employeeId: user.employeeId,
      status: user.status || 'active',
      department: user.department,
      jobTitle: user.jobTitle,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * Sets an authenticated server-side session cookie ('dokind_session') with HMAC signature
 */
export async function setServerSession(user: User): Promise<void> {
  const cookieStore = await cookies();
  const sessionPayload: SessionData = {
    id: user.id,
    sessionCreatedAt: new Date().toISOString(),
  };

  const encodedPayload = Buffer.from(JSON.stringify(sessionPayload)).toString('base64url');
  const signature = signPayload(encodedPayload);
  const signedToken = `${encodedPayload}.${signature}`;

  cookieStore.set('dokind_session', signedToken, {
    path: '/',
    maxAge: 2592000, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });
}

/**
 * Clears active session cookies
 */
export async function clearServerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('dokind_session');
}

/**
 * DAL GUARD: Enforces that the current request has a valid, non-suspended authenticated user session.
 */
export async function requireAuthenticatedUser(): Promise<User> {
  const session = await getServerSession();
  if (!session || session.status === 'suspended') {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  return session;
}

/**
 * DAL GUARD: Enforces that the current session possesses one of the allowed roles.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuthenticatedUser();
  const hasRole =
    allowedRoles.includes(user.role) ||
    (user.secondaryRole && allowedRoles.includes(user.secondaryRole)) ||
    (user.roles && user.roles.some((r) => allowedRoles.includes(r)));

  if (!hasRole) {
    throw new Error('FORBIDDEN: Insufficient permissions');
  }
  return user;
}

/**
 * DAL GUARD: Enforces that the current session possesses an internal administrative/staff role.
 */
export async function requireAdminRole(): Promise<User> {
  return requireRole(STAFF_ADMIN_ROLES);
}

/**
 * DAL GUARD: Enforces resource ownership to prevent Insecure Direct Object References (IDOR).
 * Super Admins and Platform Admins are permitted for administrative oversight.
 */
export async function requireResourceOwnership(resourceOwnerId: string, resourceOwnerEmail?: string): Promise<User> {
  const user = await requireAuthenticatedUser();
  if (user.role === 'super_admin' || user.role === 'admin') {
    return user;
  }
  const isOwner =
    user.id === resourceOwnerId ||
    (resourceOwnerEmail && user.email?.toLowerCase().trim() === resourceOwnerEmail.toLowerCase().trim());

  if (!isOwner) {
    throw new Error('FORBIDDEN: Access denied: You do not own this resource');
  }
  return user;
}
