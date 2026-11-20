// =============================================================================
// sitemap.ts — Dynamic XML Sitemap
//
// Generates an accurate XML sitemap using real Sanity CMS timestamps for:
//   - Core public routes (/, /services, /portfolio, /articles, /about, /book-now)
//   - Published portfolio category routes (/portfolio/[category])
//   - Portfolio gallery, vlogs, and client feedback hub pages
//   - Individual article & vlog detail pages (/articles/vlogs/[slug])
// =============================================================================

import type { MetadataRoute } from 'next';
import {
  getLatestPortfolioUpdateDate,
  getPortfolioCategorySitemapEntries,
} from '@/lib/services/portfolioService';
import { getArticleVlogSitemapEntries } from '@/lib/services/articleVlogService';
import { buildCanonicalUrl, getSiteUrl } from '@/lib/utils/seoUtils';

function parseDateOrUndefined(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const [categoryEntries, latestPortfolioUpdate, vlogEntries] = await Promise.all([
    getPortfolioCategorySitemapEntries(),
    getLatestPortfolioUpdateDate(),
    getArticleVlogSitemapEntries(),
  ]);

  const latestPortfolioDate = parseDateOrUndefined(latestPortfolioUpdate);
  const latestVlogDate = parseDateOrUndefined(vlogEntries[0]?.lastModified);

  const categoryRoutes: MetadataRoute.Sitemap = categoryEntries.map((cat) => ({
    url: buildCanonicalUrl(`/portfolio/${cat.slug}`),
    ...(parseDateOrUndefined(cat.lastModified)
      ? { lastModified: parseDateOrUndefined(cat.lastModified) }
      : latestPortfolioDate
        ? { lastModified: latestPortfolioDate }
        : {}),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  const articleSlugRoutes: MetadataRoute.Sitemap = vlogEntries.map((entry) => ({
    url: buildCanonicalUrl(`/articles/vlogs/${entry.slug}`),
    ...(parseDateOrUndefined(entry.lastModified)
      ? { lastModified: parseDateOrUndefined(entry.lastModified) }
      : {}),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      ...(latestPortfolioDate || latestVlogDate
        ? { lastModified: latestPortfolioDate || latestVlogDate }
        : {}),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: buildCanonicalUrl('/services'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/portfolio'),
      ...(latestPortfolioDate ? { lastModified: latestPortfolioDate } : {}),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: buildCanonicalUrl('/portfolio/gallery'),
      ...(latestPortfolioDate ? { lastModified: latestPortfolioDate } : {}),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...categoryRoutes,
    {
      url: buildCanonicalUrl('/articles'),
      ...(latestVlogDate ? { lastModified: latestVlogDate } : {}),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/articles/vlogs'),
      ...(latestVlogDate ? { lastModified: latestVlogDate } : {}),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    ...articleSlugRoutes,
    {
      url: buildCanonicalUrl('/articles/feedback'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: buildCanonicalUrl('/about'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: buildCanonicalUrl('/book-now'),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: buildCanonicalUrl('/privacy'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: buildCanonicalUrl('/terms'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: buildCanonicalUrl('/cookies'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
