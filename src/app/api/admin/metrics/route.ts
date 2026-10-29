import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminApiAccess } from '@/lib/auth/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminApiAccess();
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const periodDaysParam = searchParams.get('periodDays');
    const periodDays = periodDaysParam ? Math.max(1, Math.min(3650, parseInt(periodDaysParam, 10) || 30)) : 30;

    const metrics = db.getAdminMetrics(periodDays);
    const campaigns = db.getCampaigns();
    const pendingApprovals = campaigns.filter(
      (c) => c.status === 'submitted' || c.status === 'under_review'
    );
    const pendingWires = db.getManualDonations({ status: 'pending' });

    return NextResponse.json({
      success: true,
      periodDays,
      metrics,
      pendingCounts: {
        approvals: pendingApprovals.length,
        wires: pendingWires.length,
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/metrics GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
