import { db } from '@/lib/db';
import { AdminOverviewClient, type AdminOverviewSnapshot } from './AdminOverviewClient';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const periodDays = 30;
  const metrics = db.getAdminMetrics(periodDays);
  const auditLogs = db.getAuditLogs().slice(0, 6);
  const totalAuditLogs = db.getAuditLogs().length;
  const campaigns = db.getCampaigns();
  const pendingApprovals = campaigns.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review'
  );
  const pendingWires = db.getManualDonations({ status: 'pending' });

  const initialSnapshot: AdminOverviewSnapshot = {
    metrics,
    auditLogs,
    totalAuditLogs,
    campaignsCount: campaigns.length,
    pendingApprovalsCount: pendingApprovals.length,
    pendingWiresCount: pendingWires.length,
  };

  return <AdminOverviewClient initialSnapshot={initialSnapshot} />;
}
