import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    const staffRoles = [
      'super_admin',
      'admin',
      'support_admin',
      'ops_admin',
      'marketer',
      'content_writer',
      'content_editor',
      'lead_generator',
      'campaign_manager',
      'head_staff',
      'reviewer',
      'finance',
      'support_staff',
    ];

    const hasAccess =
      !session ||
      staffRoles.includes(session.role) ||
      (session.secondaryRole && staffRoles.includes(session.secondaryRole));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
      metrics,
      campaignsCount: campaigns.length,
      pendingApprovalsCount: pendingApprovals.length,
      pendingWiresCount: pendingWires.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/admin/metrics GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message },
      { status: 500 }
    );
  }
}
