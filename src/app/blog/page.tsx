export const dynamic = 'force-dynamic';

import React from 'react';
import { db } from '@/lib/db';
import { BlogDirectoryClient } from '@/components/blog/BlogDirectoryClient';

export const metadata = {
  title: 'Dokind Blog & Stories | Inspiring Beneficiary Stories, Impact Reports & Giving Guides',
  description:
    'Explore inspiring recovery journeys, medical emergency lifelines, rural school updates, animal rescue stories, and comprehensive Section 80G tax saving guides on Dokind.',
};

export default function BlogDirectoryPage() {
  const blogs = db.getBlogs({ status: 'published' });

  return <BlogDirectoryClient initialBlogs={blogs} />;
}
