export const dynamic = 'force-dynamic';

import React from 'react';
import { db } from '@/lib/db';
import { HelpCenterClient } from '@/components/help/HelpCenterClient';

export default function HelpCenterPage() {
  const publishedSections = db.getPublishedPageSections('help');
  const faqs = db.getFAQs();

  return (
    <HelpCenterClient
      publishedSections={publishedSections}
      allFaqs={faqs}
    />
  );
}
