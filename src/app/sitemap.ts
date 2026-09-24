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
import { getPortfolioCategories } from '@/lib/services/portfolioService';
import { getApprovedFeedbacksCount } from '@/lib/services/feedbackService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
    const currentDate = new Date();

    // Fetch all published portfolio categories to generate dynamic category subpaths
    // and feedback count for paginated feedback pages
    const [categories, feedbackCount] = await Promise.all([
        getPortfolioCategories(),
        getApprovedFeedbacksCount(),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${baseUrl}/portfolio/${cat.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.75,
    }));

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
        // All dynamic portfolio category landing pages
        ...categoryRoutes,
        {
            url: `${baseUrl}/articles`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
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
