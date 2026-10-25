import { cookies } from 'next/headers';
import { User } from '@/lib/types';
import { db } from '@/lib/db';
import { DEMO_USERS, INITIAL_SUPER_ADMIN_ACCOUNTS } from './constants';

/**
 * Server-Side Session Resolver for Next.js App Router
 *
 * Reads the secure session cookie ('dokind_session') sent by the browser,
 * authoritatively validates the user in DatabaseStore, verifies account status,
 * and extracts a safe, serializable user display snapshot for identical server
 * and client initial rendering.
 */
export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie =
      cookieStore.get('dokind_session')?.value ||
      cookieStore.get('sevasetu_session')?.value;

    if (!sessionCookie) {
      return null;
    }

    const decoded = decodeURIComponent(sessionCookie);
    const sessionData = JSON.parse(decoded);

    if (!sessionData || !sessionData.id) {
      return null;
    }

    // 1. Authoritative lookup in DatabaseStore by ID or email
    let user: User | undefined = db.getUserById(sessionData.id);

    // 2. Fallback check for designated super admin accounts
    if (!user && sessionData.email && db.isDesignatedSuperAdmin(sessionData.email)) {
      user = INITIAL_SUPER_ADMIN_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === sessionData.email.toLowerCase()
      );
    }

    // 3. Fallback check for standard demo users
    if (!user) {
      user = Object.values(DEMO_USERS).find(
        (u) =>
          u.id === sessionData.id ||
          (sessionData.role && u.role === sessionData.role && u.name === sessionData.name)
      );
    }

    if (!user) {
      return null;
    }

    // 4. Session validity check: suspended accounts and revoked sessions are denied
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

    // 5. Return clean serializable display snapshot (No password hashes or sensitive internal tokens)
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
 * Sets an authenticated server-side session cookie ('dokind_session')
 */
export async function setServerSession(user: User): Promise<void> {
  const cookieStore = await cookies();
  const sessionPayload = encodeURIComponent(
    JSON.stringify({
      id: user.id,
      role: user.role,
      secondaryRole: user.secondaryRole,
      roles: user.roles || (user.secondaryRole ? [user.role, user.secondaryRole] : [user.role]),
      name: user.name,
      email: user.email,
      phone: user.phone,
      sessionCreatedAt: new Date().toISOString(),
    })
  );
  cookieStore.set('dokind_session', sessionPayload, {
    path: '/',
    maxAge: 2592000, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Clears active session cookies
 */
export async function clearServerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('dokind_session');
  cookieStore.delete('sevasetu_session');
}
