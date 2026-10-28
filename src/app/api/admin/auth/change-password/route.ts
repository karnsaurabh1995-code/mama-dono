import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, setServerSession } from '@/lib/auth/server';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerSession();

    if (!sessionUser || !sessionUser.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to update credentials.' },
        { status: 401 }
      );
    }

    const fullUser = db.getUserById(sessionUser.id);
    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'New password is required.' },
        { status: 400 }
      );
    }

    // If user has an existing password, verify the current password first
    if (fullUser.passwordHash) {
      if (!currentPassword || typeof currentPassword !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Current password is required to set a new password.' },
          { status: 400 }
        );
      }

      const isValidCurrent = await verifyPassword(currentPassword, fullUser.passwordHash);
      if (!isValidCurrent) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect.' },
          { status: 400 }
        );
      }
    }

    // Validate strength of new password
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { success: false, error: strengthCheck.message || 'Password does not meet security requirements.' },
        { status: 400 }
      );
    }

    // Prevent re-using the exact same password
    if (fullUser.passwordHash) {
      const isSamePassword = await verifyPassword(newPassword, fullUser.passwordHash);
      if (isSamePassword) {
        return NextResponse.json(
          { success: false, error: 'New password must be different from current password.' },
          { status: 400 }
        );
      }
    }

    // Hash and persist new password
    const newHash = await hashPassword(newPassword);
    const updatedUser = db.updateUser(fullUser.id, {
      passwordHash: newHash,
      requiresPasswordChange: false,
      lastResetAt: new Date().toISOString(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Could not update user credentials.' },
        { status: 500 }
      );
    }

    // Update active session cookie
    await setServerSession(updatedUser);

    db.createAuditLog({
      actorId: fullUser.id,
      actorName: fullUser.name,
      action: 'ADMIN_PASSWORD_CHANGED',
      targetType: 'user',
      targetId: fullUser.id,
      details: `Password successfully updated and first-login requirements satisfied for ${fullUser.email}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated.',
    });
  } catch (error: any) {
    console.error('[Admin Password Change Error]:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected internal error occurred while changing password.' },
      { status: 500 }
    );
  }
}
