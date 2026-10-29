import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { setServerSession } from '@/lib/auth/server';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, phone, pan, password, role = 'donor' } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email address, and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (!cleanEmail.includes('@') || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid name and email address.' },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Role safety: strictly restrict public registration to 'donor' or 'fundraiser'
    const assignedRole: UserRole = role === 'fundraiser' ? 'fundraiser' : 'donor';

    // Disallow registering super admin emails via public form
    if (db.isDesignatedSuperAdmin(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'This email is reserved for administrative governance.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(String(password));

    const newUser = db.createUser({
      id: `usr-${assignedRole}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      panNumber: pan ? String(pan).trim().toUpperCase() : undefined,
      role: assignedRole,
      passwordHash,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });

    await setServerSession(newUser);

    db.createAuditLog({
      actorId: newUser.id,
      actorName: newUser.name,
      action: 'USER_REGISTERED',
      targetType: 'user',
      targetId: newUser.id,
      details: `Registered new ${assignedRole} account (${cleanEmail})`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      redirectUrl: assignedRole === 'fundraiser' ? '/start-campaign' : '/account',
    });
  } catch (error: any) {
    console.error('[API /api/auth/register] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed due to internal error.' },
      { status: 500 }
    );
  }
}
