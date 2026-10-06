// =============================================================================
// sitemap.ts — Dynamic Sitemap
//
// Generates a fully dynamic XML sitemap including:
//   - Core static routes (/, /services, /portfolio, /articles, /about, /book-now)
//   - All published portfolio category subpaths (/portfolio/[category])
//
// Portfolio category routes are resolved dynamically via the service layer
// so newly published Sanity CMS categories are auto-indexed without code changes.
// =============================================================================

import type { MetadataRoute } from 'next';
import { getPortfolioCategories, getPortfolioItemTotalCount } from '@/lib/services/portfolioService';
import { getApprovedFeedbacksCount } from '@/lib/services/feedbackService';
import { getArticleVlogTotalCount, getAllArticleVlogSlugs } from '@/lib/services/articleVlogService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
    const currentDate = new Date();

    // Fetch dynamic content data for full URL indexation
    const [categories, feedbackCount, portfolioTotal, vlogTotal, vlogSlugs] = await Promise.all([
        getPortfolioCategories(),
        getApprovedFeedbacksCount(),
        getPortfolioItemTotalCount('all'),
        getArticleVlogTotalCount(),
        getAllArticleVlogSlugs(),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${baseUrl}/portfolio/${cat.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.75,
    }));

    // Portfolio Gallery Paginated Routes
    const portfolioPagesCount = Math.ceil(portfolioTotal / 20);
    const portfolioGalleryRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/portfolio/gallery`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];
    for (let page = 2; page <= portfolioPagesCount; page++) {
        portfolioGalleryRoutes.push({
            url: `${baseUrl}/portfolio/gallery/page/${page}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.6,
        });
    }

    // Article Vlogs Paginated Routes
    const vlogPagesCount = Math.ceil(vlogTotal / 12);
    const vlogRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/articles/vlogs`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];
    for (let page = 2; page <= vlogPagesCount; page++) {
        vlogRoutes.push({
            url: `${baseUrl}/articles/vlogs/page/${page}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.6,
        });
    }

    // Individual Article / Vlog Slugs
    const articleSlugRoutes: MetadataRoute.Sitemap = (vlogSlugs || []).map((slug) => ({
        url: `${baseUrl}/articles/vlogs/${slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // Feedback Paginated Routes
    const feedbackPagesCount = Math.ceil(feedbackCount / 12);
    const feedbackRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/articles/feedback`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];

    for (let page = 2; page <= feedbackPagesCount; page++) {
        feedbackRoutes.push({
            url: `${baseUrl}/articles/feedback/page/${page}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.6,
        });
    }

    return [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/services`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...portfolioGalleryRoutes,
        ...categoryRoutes,
        {
            url: `${baseUrl}/articles`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...vlogRoutes,
        ...articleSlugRoutes,
        ...feedbackRoutes,
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/book-now`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];
}
