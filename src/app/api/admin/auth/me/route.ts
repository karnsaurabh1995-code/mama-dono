import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sessionUser = await getServerSession();

    if (!sessionUser || !sessionUser.id) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const fullUser = db.getUserById(sessionUser.id);
    const requiresPasswordChange = fullUser ? !!fullUser.requiresPasswordChange : false;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        username: (sessionUser as any).username || fullUser?.username,
        role: sessionUser.role,
        requiresPasswordChange,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
