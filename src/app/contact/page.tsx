export const dynamic = 'force-dynamic';

import React from 'react';
import { db } from '@/lib/db';
import { ContactClient } from '@/components/contact/ContactClient';

export default function ContactPage() {
  const publishedSections = db.getPublishedPageSections('contact');

  return <ContactClient publishedSections={publishedSections} />;
}
