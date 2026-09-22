import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

  return {
    rules: [
      {
        userAgent: '*',
        allow: allowIndexing ? '/' : '',
        disallow: allowIndexing ? ['/api/', '/_next/', '/admin/'] : ['/'],
      },
    ],
    sitemap: allowIndexing ? `${baseUrl}/sitemap.xml` : undefined,
  };
}
