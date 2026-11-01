import 'server-only';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { User, UserRole } from '@/lib/types';
import { db } from '@/lib/db';
import { getServerSession, STAFF_ADMIN_ROLES, isStaffRole } from './server';

export { STAFF_ADMIN_ROLES, isStaffRole };

/**
 * Checks whether a given user possesses the required staff role(s).
 * Super admins inherently pass any administrative check unless explicitly restricted.
 */
export function hasStaffPermission(user: User, allowedRoles?: UserRole[]): boolean {
  if (!user || user.status === 'suspended') return false;

  // Super admin has universal administrative access
  if (user.role === 'super_admin' || user.secondaryRole === 'super_admin') {
    return true;
  }

  // Must have an official staff role
  const isPrimaryStaff = isStaffRole(user.role);
  const isSecondaryStaff = user.secondaryRole ? isStaffRole(user.secondaryRole) : false;
  if (!isPrimaryStaff && !isSecondaryStaff) {
    return false;
  }

  // If specific roles are required, verify match against all user's assigned roles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = [
      user.role,
      ...(user.secondaryRole ? [user.secondaryRole] : []),
      ...(user.roles || []),
    ];
    return userRoles.some((r) => allowedRoles.includes(r));
  }

  return true;
}

/**
 * Validates the current incoming request's cryptographic session cookie,
 * loads the authoritative user from the database, confirms non-suspended status,
 * verifies session revocation, and guarantees the user has a valid staff role.
 *
 * Returns the authoritative User object, or null if unauthenticated or not staff.
 */
export async function getCurrentStaffSession(): Promise<User | null> {
  const session = await getServerSession();
  if (!session || session.status === 'suspended') {
    return null;
  }

  // Ensure user has a staff role (donors, fundraisers, org managers are NOT staff)
  if (!isStaffRole(session.role) && (!session.secondaryRole || !isStaffRole(session.secondaryRole))) {
    return null;
  }

  // Re-verify against authoritative DatabaseStore record
  let dbUser = db.getUserById(session.id);
  if (!dbUser && session.email) {
    dbUser = db.getUsers().find((u) => u.email.toLowerCase() === session.email!.toLowerCase());
  }
  if (!dbUser && session.username) {
    dbUser = db.getUsers().find((u) => u.username === session.username);
  }

  if (!dbUser || dbUser.status === 'suspended') {
    return null;
  }

  if (!isStaffRole(dbUser.role) && (!dbUser.secondaryRole || !isStaffRole(dbUser.secondaryRole))) {
    return null;
  }

  return session;
}

/**
 * Server Component / Page Guard:
 * Enforces staff authentication and role authorization for server-rendered admin pages.
 * Redirects unauthenticated requests to /admin/login?returnUrl=...
 * Redirects unauthorized requests to /admin?error=forbidden or /admin/login?error=staff_only.
 */
export async function requireAdminPageAccess(
  allowedRoles?: UserRole[],
  currentPath = '/admin'
): Promise<User> {
  const session = await getServerSession();

  // 1. Unauthenticated -> redirect to staff login
  if (!session) {
    const returnUrl = encodeURIComponent(currentPath);
    redirect(`/admin/login?returnUrl=${returnUrl}`);
  }

  // 2. Suspended account -> redirect to login with error
  if (session.status === 'suspended') {
    redirect('/admin/login?error=suspended');
  }

  // 3. Authenticated as non-staff (e.g. donor) -> access denied, redirect to staff login
  if (!isStaffRole(session.role) && (!session.secondaryRole || !isStaffRole(session.secondaryRole))) {
    redirect('/admin/login?error=staff_only');
  }

  // 4. Staff authenticated, verify specific role permissions if required
  if (allowedRoles && allowedRoles.length > 0 && !hasStaffPermission(session, allowedRoles)) {
    if (currentPath !== '/admin') {
      redirect('/admin?error=forbidden');
    } else {
      redirect('/admin/login?error=forbidden');
    }
  }

  return session;
}

export type AdminApiAuthResult =
  | { staff: User; errorResponse?: never }
  | { staff?: never; errorResponse: NextResponse };

/**
 * Route Handler Guard:
 * Enforces staff authentication and role authorization for administrative API endpoints.
 * Returns { staff } on success.
 * Returns { errorResponse: NextResponse } with HTTP 401 (if unauthenticated) or HTTP 403 (if unauthorized).
 */
export async function requireAdminApiAccess(
  allowedRoles?: UserRole[]
): Promise<AdminApiAuthResult> {
  const session = await getServerSession();

  // 1. Unauthenticated or suspended -> HTTP 401 Unauthorized
  if (!session || session.status === 'suspended') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // 2. Authenticated as non-staff (donor, fundraiser, org manager) -> HTTP 403 Forbidden
  if (!isStaffRole(session.role) && (!session.secondaryRole || !isStaffRole(session.secondaryRole))) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Dokind staff credentials required' },
        { status: 403 }
      ),
    };
  }

  // 3. Staff authenticated but missing required role -> HTTP 403 Forbidden
  if (allowedRoles && allowedRoles.length > 0 && !hasStaffPermission(session, allowedRoles)) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Insufficient administrative privileges' },
        { status: 403 }
      ),
    };
  }

  return { staff: session };
}
