import { db } from '@/lib/db';
import { AdminCampaignsClient } from './AdminCampaignsClient';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignsPage() {
  const initialCampaigns = db.getCampaigns();
  const initialTags = db.getTags();
  const initialCuration = db.getHomepageCuration();
  const initialPendingSubmissionsCount = db.getRevisionSubmissions('pending_review').length;
  const initialPendingUpdatesCount = db
    .getCampaignUpdates(undefined, true)
    .filter((u) => u.status === 'pending_review').length;

  return (
    <AdminCampaignsClient
      initialCampaigns={initialCampaigns}
      initialTags={initialTags}
      initialCuration={initialCuration}
      initialPendingSubmissionsCount={initialPendingSubmissionsCount}
      initialPendingUpdatesCount={initialPendingUpdatesCount}
    />
  );
}
