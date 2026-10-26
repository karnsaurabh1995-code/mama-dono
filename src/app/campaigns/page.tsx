export const dynamic = 'force-dynamic';

import React from 'react';
import { db } from '@/lib/db';
import { CampaignsClient } from '@/components/campaign/CampaignsClient';

export default function CampaignsPage() {
  const allCampaigns = db.getCampaigns({ status: 'active' });
  const publishedSections = db.getPublishedPageSections('campaigns');

  return (
    <CampaignsClient
      initialCampaigns={allCampaigns}
      publishedSections={publishedSections}
    />
  );
}
