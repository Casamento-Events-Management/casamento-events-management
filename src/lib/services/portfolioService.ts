// =============================================================================
// portfolioService.ts — Portfolio Data Service Layer
//
// Decoupled service layer for retrieving Portfolio Categories and Portfolio Items.
// Serves as the single data provider for Next.js App Router server components.
//
// Complies with architecture guardrails: page routes import from this service layer
// rather than directly importing mock JSON or raw CMS queries.
// =============================================================================

import { MOCK_PORTFOLIO_CATEGORIES, MOCK_PORTFOLIO_ITEMS } from '@/data/portfolioMock';
import type { PortfolioCategory, PortfolioItem } from '@/types';

/**
 * Fetches all published portfolio categories sorted by priority (highest first).
 */
export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
    // Deep clone to prevent accidental state mutations
    const categories: PortfolioCategory[] = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_CATEGORIES));
    return categories.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/**
 * Retrieves a single portfolio category by its URL slug.
 */
export async function getPortfolioCategoryBySlug(slug: string): Promise<PortfolioCategory | null> {
    const categories = await getPortfolioCategories();
    return categories.find((cat) => cat.slug === slug) ?? null;
}

/**
 * Fetches portfolio items, optionally filtered by category slug and paginated.
 * Items are ordered by `featured desc`, `priority desc`, then `createdAt desc`.
 */
export async function getPortfolioItems(
    categorySlug?: string,
    offset = 0,
    limit?: number
): Promise<PortfolioItem[]> {
    const items: PortfolioItem[] = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_ITEMS));
    
    // Filter by category if specified and not 'all'
    const filtered = categorySlug && categorySlug !== 'all'
        ? items.filter((item) => item.category.slug === categorySlug)
        : items;

    // Apply 3-tier sorting rule: order(featured desc, priority desc, createdAt desc)
    const sorted = filtered.sort((a, b) => {
        if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
        }
        if ((b.priority ?? 0) !== (a.priority ?? 0)) {
            return (b.priority ?? 0) - (a.priority ?? 0);
        }
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    if (typeof limit === 'number' && limit > 0) {
        return sorted.slice(offset, offset + limit);
    }

    return sorted.slice(offset);
}

/**
 * Retrieves a single portfolio item by its URL slug (for deep links / lightbox share).
 */
export async function getPortfolioItemBySlug(slug: string): Promise<PortfolioItem | null> {
    const items = await getPortfolioItems();
    return items.find((item) => item.slug === slug) ?? null;
}
