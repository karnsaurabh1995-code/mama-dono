import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

/**
 * ADMIN TEAM & STAFF MANAGEMENT API
 *
 * GET: Lists all employee records
 * POST: Provisions new employee with cryptographically secure single-use temporary password
 * PUT: Updates employee details / reassigned roles (max 2 roles enforced)
 * PATCH: Toggles employee status (active/suspended) or initiates credential reset
 * DELETE: Permanently deletes an employee with constraint validation
 */

const ALLOWED_ADMIN_ROLES = ['super_admin', 'admin', 'support_admin'];

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Administrator authority required' }, { status: 401 });
    }

    const employees = db.getEmployees(session);
    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error: any) {
    console.error('[API /api/admin/team GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only platform Administrators can provision staff accounts' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, employeeId, role, secondaryRole, roles, department, jobTitle, status, assignedCampaigns, internalNotes } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, official email, and role are required' }, { status: 400 });
    }

    const result = db.createEmployee(
      {
        name,
        email,
        employeeId,
        role,
        secondaryRole,
        roles,
        department,
        jobTitle,
        status,
        assignedCampaigns: Array.isArray(assignedCampaigns)
          ? assignedCampaigns
          : typeof assignedCampaigns === 'string'
          ? assignedCampaigns.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        internalNotes,
      },
      session
    );

    try {
      revalidatePath('/about');
      revalidatePath('/admin/team');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Staff account successfully created for ${result.user.name}`,
      employee: result.user,
      temporaryCredential: result.temporaryCredential,
      resetToken: result.resetToken,
    });
  } catch (error: any) {
    console.error('[API /api/admin/team POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create employee' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only platform Administrators can modify staff accounts' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Employee ID and updates payload are required' }, { status: 400 });
    }

    const updated = db.updateEmployee(id, updates, session);

    try {
      revalidatePath('/about');
      revalidatePath('/admin/team');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Staff account for ${updated.name} updated successfully`,
      employee: updated,
    });
  } catch (error: any) {
    console.error('[API /api/admin/team PUT] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update employee' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only platform Administrators can alter employee state' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, action, status, roles, reason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Employee ID and action are required' }, { status: 400 });
    }

    if (action === 'toggle_status') {
      if (!status || !['active', 'suspended', 'pending_setup'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      const updated = db.setEmployeeStatus(id, status, session);
      try {
        revalidatePath('/about');
        revalidatePath('/admin/team');
      } catch (e) {
        console.warn('Revalidation notice:', e);
      }
      return NextResponse.json({
        success: true,
        message: `Account status for ${updated.name} set to ${status}`,
        employee: updated,
      });
    }

    if (action === 'reset_credential') {
      const reset = db.initiateCredentialReset(id, session);
      return NextResponse.json({
        success: true,
        message: 'Single-use credential generated; previous sessions revoked.',
        ...reset,
      });
    }

    if (action === 'revoke_sessions') {
      const user = db.revokeEmployeeSessions(id, session);
      return NextResponse.json({
        success: true,
        message: `All active sessions revoked for ${user.name}`,
        employee: user,
      });
    }

    if (action === 'change_roles') {
      if (!Array.isArray(roles)) {
        return NextResponse.json({ error: 'Roles must be an array' }, { status: 400 });
      }
      const user = db.setEmployeeRoles(id, roles, session, reason);
      try {
        revalidatePath('/about');
        revalidatePath('/admin/team');
      } catch (e) {
        console.warn('Revalidation notice:', e);
      }
      return NextResponse.json({
        success: true,
        message: `Roles updated for ${user.name}`,
        employee: user,
      });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/admin/team PATCH] Error:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only platform Administrators can delete employee accounts' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const success = db.deleteEmployee(id, session);

    try {
      revalidatePath('/about');
      revalidatePath('/admin/team');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({
      success,
      message: 'Staff account successfully removed from platform records',
    });
  } catch (error: any) {
    console.error('[API /api/admin/team DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete employee' }, { status: 400 });
  }
}
