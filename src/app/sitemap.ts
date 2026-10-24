import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { CAUSES_DATA } from '@/lib/data/causes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dokind.org.in';

  const staticRoutes = [
    '',
    '/campaigns',
    '/causes',
    '/monthly-giving',
    '/product-giving',
    '/start-campaign',
    '/how-it-works',
    '/about',
    '/impact',
    '/stories',
    '/organizations',
    '/blog',
    '/help',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/donation-policy',
    '/refund-policy',
    '/campaign-guidelines',
    '/verification-policy',
    '/accessibility',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const campaignRoutes = db.getCampaigns({ status: 'active' }).map((c) => ({
    url: `${baseUrl}/campaigns/${c.slug}`,
    lastModified: new Date(c.updatedAt || c.createdAt),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  const causeRoutes = CAUSES_DATA.map((c) => ({
    url: `${baseUrl}/causes/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const orgRoutes = db.getOrganizations().map((o) => ({
    url: `${baseUrl}/organizations/${o.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const storyRoutes = db.getStories().map((s) => ({
    url: `${baseUrl}/stories/${s.slug}`,
    lastModified: new Date(s.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogRoutes = db.getBlogs().map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...campaignRoutes,
    ...causeRoutes,
    ...orgRoutes,
    ...storyRoutes,
    ...blogRoutes,
  ];
}
