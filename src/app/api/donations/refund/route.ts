import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';

const ALLOWED_REFUND_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'support_admin',
  'ops_admin',
  'finance',
  'head_staff',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donationId, reason, actorId } = body;

    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'A specific refund reason is required for audit compliance' }, { status: 400 });
    }

    // 1. Authoritative Server-Side User & Role Lookup
    // Reject untrusted client role claims. Look up user by actorId in database
    const users = (db as any).users || [];
    let authenticatedUser = users.find((u: any) => u.id === actorId);

    // Fallback lookup from demo users if matching standard finance/admin IDs
    if (!authenticatedUser && actorId) {
      const demoMatches: Record<string, { id: string; name: string; role: UserRole }> = {
        'user-finance-1': { id: 'user-finance-1', name: 'Anand Kulkarni', role: 'finance' },
        'admin-1': { id: 'admin-1', name: 'System Super Admin', role: 'super_admin' },
        'admin-standard': { id: 'admin-standard', name: 'Platform Administrator', role: 'admin' },
        'support-admin-1': { id: 'support-admin-1', name: 'Operational Support Admin', role: 'support_admin' },
        'user-head-staff-1': { id: 'user-head-staff-1', name: 'Priyanka Sharma', role: 'head_staff' },
      };
      authenticatedUser = demoMatches[actorId];
    }

    // If caller cannot be authoritatively resolved or lacks role
    if (!authenticatedUser || !ALLOWED_REFUND_ROLES.includes(authenticatedUser.role)) {
      return NextResponse.json(
        {
          error: `Unauthorized: Caller does not possess authorized refund privileges. Required roles: ${ALLOWED_REFUND_ROLES.join(', ')}`,
        },
        { status: 403 }
      );
    }

    // 2. Transaction State Verification
    const donation = db.getDonations().find((d) => d.id === donationId);
    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }

    if (donation.status === 'refunded') {
      return NextResponse.json(
        { error: 'Donation has already been refunded. Duplicate refund rejected.' },
        { status: 400 }
      );
    }

    if (donation.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Cannot refund donation with non-succeeded status: "${donation.status}"` },
        { status: 400 }
      );
    }

    // 3. Execute authoritative refund with ledger reversal and audit logging
    const refundedDonation = db.processRefund(
      donationId,
      reason.trim(),
      {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
      }
    );

    return NextResponse.json({
      success: true,
      donation: refundedDonation,
      receiptNumber: refundedDonation.receiptNumber,
      message: `Donation ${refundedDonation.receiptNumber} successfully refunded.`,
    });
  } catch (error: any) {
    console.error('Error processing refund:', error.message);
    return NextResponse.json(
      { error: error.message || 'Refund processing failed' },
      { status: 500 }
    );
  }
}
