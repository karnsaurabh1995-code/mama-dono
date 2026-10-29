import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApiAccess } from '@/lib/auth/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAdminApiAccess();
    if (auth.errorResponse) return auth.errorResponse;

    const approvals = db
      .getCampaigns()
      .filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
    const ngos = db
      .getOrganizations()
      .filter((o) => o.verificationStatus === 'pending').length;
    const wires = db.getManualDonations({ status: 'pending' }).length;

    return NextResponse.json({
      approvals,
      ngos,
      wires,
    });
  } catch (error: any) {
    console.error('[API /api/admin/pending-counts GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
