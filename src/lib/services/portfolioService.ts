// =============================================================================
// portfolioService.ts — Portfolio Data Service Layer
//
// Decoupled service layer for retrieving Portfolio Categories and Portfolio Items.
// Serves as the single data provider for Next.js App Router server components.
//
// Complies with architecture guardrails: page routes import from this service layer
// rather than directly importing mock JSON or raw CMS queries.
// =============================================================================

import { client } from '@/sanity/lib/client';
import { MOCK_PORTFOLIO_CATEGORIES, MOCK_PORTFOLIO_ITEMS } from '@/data/portfolioMock';
import type { PortfolioCategory, PortfolioHeroContent, PortfolioItem, SanityPortfolioItem } from '@/types';

// =============================================================================
// 1. Sanity GROQ Query Templates
// =============================================================================

/**
 * GROQ Query for retrieving published Portfolio Categories
 */
export const GROQ_PORTFOLIO_CATEGORIES = `
  *[_type == "portfolioCategory"] | order(priority desc) {
    "id": _id,
    title,
    "slug": slug.current,
    description,
    priority
  }
`;

/**
 * GROQ Query for retrieving Portfolio Items with 3-tier ordering & projection
 */
export const GROQ_PORTFOLIO_ITEMS = `
  *[_type == "portfolioItem" && ($category == "all" || category->slug.current == $category)]
  | order(featured desc, priority desc, _createdAt desc) [$offset...$limit] {
    "id": _id,
    title,
    "slug": slug.current,
    "mediaType": select(defined(mediaType) => mediaType, defined(video) => "video", "image"),
    category->{
      title,
      "slug": slug.current
    },
    tags,
    thumbnail {
      "url": asset->url,
      "alt": coalesce(alt, title),
      caption,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    },
    video {
      "sourceType": select(
        defined(sourceType) => sourceType,
        defined(asset) => "sanity",
        "external"
      ),
      provider,
      url,
      mimeType,
      "asset": {
        "_ref": coalesce(asset.asset._ref, asset._ref),
        "_type": "reference",
        "url": coalesce(asset.asset->url, asset->url)
      }
    },
    description,
    eventDate,
    duration,
    location,
    clientName,
    featured,
    priority,
    "createdAt": _createdAt
  }
`;

/**
 * Helper mapper to convert raw Sanity documents into clean frontend PortfolioItem objects.
 */
export function mapSanityItemToPortfolioItem(raw: SanityPortfolioItem): PortfolioItem {
    const isVideo = raw.mediaType === 'video' || Boolean(raw.video);
    const categorySlug = typeof raw.category?.slug === 'string'
        ? raw.category.slug
        : (raw.category?.slug as unknown as { current?: string })?.current || 'general';

    const rawId = (raw as unknown as { id?: string }).id || raw._id || (typeof raw.slug === 'string' ? raw.slug : raw.slug?.current) || '';
    const rawSlug = typeof raw.slug === 'string' ? raw.slug : raw.slug?.current || '';

    const rawThumb = raw.thumbnail as unknown as {
        url?: string;
        alt?: string;
        caption?: string;
        width?: number;
        height?: number;
        aspectRatio?: number;
        asset?: { url?: string };
    } | undefined;

    return {
        id: rawId,
        title: raw.title,
        slug: rawSlug,
        mediaType: isVideo ? 'video' : 'image',
        category: {
            title: raw.category?.title || 'General',
            slug: categorySlug,
        },
        tags: raw.tags || [],
        thumbnail: {
            url: rawThumb?.url || rawThumb?.asset?.url || '',
            alt: rawThumb?.alt || raw.title,
            caption: rawThumb?.caption,
            width: rawThumb?.width,
            height: rawThumb?.height,
            aspectRatio: rawThumb?.aspectRatio,
        },
        video: raw.video,
        duration: raw.duration,
        description: raw.description,
        eventDate: raw.eventDate,
        location: raw.location,
        clientName: raw.clientName,
        featured: Boolean(raw.featured),
        priority: raw.priority ?? 0,
        createdAt: raw._createdAt,
    };
}

// =============================================================================
// 2. Data Access Functions (Server Components & API Routes)
// =============================================================================

/**
 * Fetches all published portfolio categories sorted by priority (highest first).
 */
export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
    try {
        const categories = await client.fetch<PortfolioCategory[]>(
            GROQ_PORTFOLIO_CATEGORIES,
            {},
            { next: { revalidate: 3600, tags: ['portfolioCategory'] } }
        );
        if (Array.isArray(categories) && categories.length > 0) {
            return categories;
        }
    } catch (err) {
        console.warn('[portfolioService] Failed to fetch portfolioCategories from Sanity, using mock data fallback:', err);
    }

    const mockCategories: PortfolioCategory[] = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_CATEGORIES));
    return mockCategories.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
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
    try {
        const params = {
            category: categorySlug || 'all',
            offset,
            limit: limit ? offset + limit : 100,
        };
        const rawItems = await client.fetch<SanityPortfolioItem[]>(
            GROQ_PORTFOLIO_ITEMS,
            params,
            { next: { revalidate: 3600, tags: ['portfolioItem'] } }
        );
        if (Array.isArray(rawItems) && rawItems.length > 0) {
            return rawItems.map(mapSanityItemToPortfolioItem);
        }
    } catch (err) {
        console.warn('[portfolioService] Failed to fetch portfolioItems from Sanity, using mock data fallback:', err);
    }

    // Fallback to local mock data
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

// =============================================================================
// Portfolio Hero Content
// =============================================================================

/** GROQ query targeting the `portfolioHero` singleton document. */
export const GROQ_PORTFOLIO_HERO = `
  *[_type == "portfolioHero" && _id == "portfolioHero"][0] {
    title,
    description,
    galleryEyebrow,
    galleryTitle,
    galleryDescription
  }
`;

/** Hardcoded fallback used when Sanity is unreachable or document is unpublished. */
const PORTFOLIO_HERO_FALLBACK: PortfolioHeroContent = {
    title: 'Masterpieces in Motion',
    description:
        'Explore our curated showcase of high-end wedding films, immersive stage productions, and broadcast-grade live streams crafted with technical precision and artistic passion.',
    galleryEyebrow: 'Portfolio Gallery',
    galleryTitle: 'Explore Our Showcase',
    galleryDescription:
        'Browse through our curated collection of wedding films, stage production designs, and broadcast live streams.',
};

/**
 * Returns the Portfolio Hero `title` and `description` from Sanity CMS.
 * Falls back to hardcoded defaults when the singleton is not yet published or
 * when the Sanity fetch fails (e.g. during local development without credentials).
 *
 * Cached with ISR at 3600-second revalidation (tagged `portfolioHero`).
 */
export async function getPortfolioHeroContent(): Promise<PortfolioHeroContent> {
    try {
        const data = await client.fetch<PortfolioHeroContent | null>(
            GROQ_PORTFOLIO_HERO,
            {},
            { next: { revalidate: 3600, tags: ['portfolioHero'] } }
        );

        if (data?.title && data?.description) {
            return {
                title: data.title,
                description: data.description,
                galleryEyebrow: data.galleryEyebrow || PORTFOLIO_HERO_FALLBACK.galleryEyebrow,
                galleryTitle: data.galleryTitle || PORTFOLIO_HERO_FALLBACK.galleryTitle,
                galleryDescription: data.galleryDescription || PORTFOLIO_HERO_FALLBACK.galleryDescription,
            };
        }
    } catch (err) {
        console.warn(
            '[portfolioService] Failed to fetch portfolioHero from Sanity, using fallback:',
            err
        );
    }

    return PORTFOLIO_HERO_FALLBACK;
}
