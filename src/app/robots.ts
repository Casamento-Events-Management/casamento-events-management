import type { MetadataRoute } from 'next';
import { getSiteUrl, isIndexingAllowed } from '@/lib/utils/seoUtils';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  const allowIndexing = isIndexingAllowed();

  return {
    rules: [
      {
        userAgent: '*',
        allow: allowIndexing ? '/' : undefined,
        disallow: allowIndexing
          ? ['/api/', '/_next/', '/studio/', '/admin/']
          : ['/'],
      },
    ],
    sitemap: allowIndexing ? `${baseUrl}/sitemap.xml` : undefined,
  };
}
