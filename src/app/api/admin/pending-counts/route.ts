import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export async function GET() {
  try {
    const session = await getServerSession();

    // Verify authorized staff or allow preview
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve pending counts' },
      { status: 500 }
    );
  }
}
