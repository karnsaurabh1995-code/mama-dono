import { cookies } from 'next/headers';
import crypto from 'crypto';
import { User } from '@/lib/types';
import { db } from '@/lib/db';
import { DEMO_USERS, INITIAL_SUPER_ADMIN_ACCOUNTS } from './constants';

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

    // 2. Backward compatibility in non-production environments for legacy JSON cookies
    if (!sessionData && process.env.NODE_ENV !== 'production') {
      try {
        const decoded = decodeURIComponent(sessionCookie);
        const parsed = JSON.parse(decoded);
        if (parsed && parsed.id) {
          sessionData = {
            id: parsed.id,
            sessionCreatedAt: parsed.sessionCreatedAt || new Date().toISOString(),
          };
        }
      } catch {
        sessionData = null;
      }
    }

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
