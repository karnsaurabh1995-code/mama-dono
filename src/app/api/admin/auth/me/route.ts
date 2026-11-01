import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '@/lib/auth/admin-guard';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const staffUser = await getCurrentStaffSession();

    if (!staffUser || !staffUser.id) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const fullUser = db.getUserById(staffUser.id);
    const requiresPasswordChange = fullUser ? !!fullUser.requiresPasswordChange : false;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        username: staffUser.username || fullUser?.username,
        role: staffUser.role,
        secondaryRole: staffUser.secondaryRole || fullUser?.secondaryRole,
        roles: staffUser.roles || fullUser?.roles || [staffUser.role],
        status: staffUser.status || fullUser?.status || 'active',
        requiresPasswordChange,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
