// =============================================================================
// serviceService.ts — Services Data Service Layer
//
// Decoupled service layer for retrieving Service Categories and Service Items.
// Serves as the single data provider for Next.js App Router server components.
//
// Complies with architecture guardrails: page routes import from this service layer
// rather than directly importing mock JSON or raw CMS queries.
// =============================================================================

import { client } from '@/sanity/lib/client';
import { MOCK_SERVICE_CATEGORIES, MOCK_SERVICE_ITEMS } from '@/data/servicesMock';
import type { ServiceCategory, ServiceItem, ServicesHeroContent, SanityServiceItem } from '@/types';

// =============================================================================
// 1. Sanity GROQ Query Templates
// =============================================================================

/**
 * GROQ Query for retrieving published Service Categories sorted by priority
 */
export const GROQ_SERVICE_CATEGORIES = `
  *[_type == "serviceCategory"] | order(priority desc) {
    "id": _id,
    title,
    "slug": slug.current,
    description,
    icon,
    priority
  }
`;

/**
 * GROQ Query for retrieving Service Items filtered by category slug and ordered by priority
 */
export const GROQ_SERVICE_ITEMS = `
  *[_type == "serviceItem" && ($category == "all" || category->slug.current == $category)]
  | order(isFeatured desc, priority desc, _createdAt desc) {
    "id": _id,
    title,
    "slug": slug.current,
    category->{
      title,
      "slug": slug.current
    },
    serviceType,
    shortDescription,
    fullDescription,
    images[] {
      "url": asset->url,
      "alt": coalesce(alt, title),
      caption,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    },
    startingPrice,
    priceFormatted,
    priceUnit,
    defaultInclusions,
    addOns[] {
      "title": title,
      "description": description,
      "price": price,
      "priceUnit": priceUnit
    },
    badge,
    isFeatured,
    bookingSlug,
    priority,
    "createdAt": _createdAt
  }
`;

/**
 * Helper mapper to convert raw Sanity documents into clean frontend ServiceItem objects.
 */
export function mapSanityItemToServiceItem(raw: SanityServiceItem): ServiceItem {
    const categorySlug = typeof raw.category?.slug === 'string'
        ? raw.category.slug
        : (raw.category?.slug as unknown as { current?: string })?.current || 'general';

    const rawId = (raw as unknown as { id?: string }).id || raw._id || raw.slug?.current || '';
    const rawSlug = typeof raw.slug === 'string' ? raw.slug : raw.slug?.current || '';

    const formattedPrice = raw.priceFormatted || (typeof raw.startingPrice === 'number' ? `₱${raw.startingPrice.toLocaleString()}` : 'Price on request');

    return {
        id: rawId,
        title: raw.title,
        slug: rawSlug,
        category: {
            title: raw.category?.title || 'General',
            slug: categorySlug,
        },
        serviceType: raw.serviceType || 'Event Service',
        shortDescription: raw.shortDescription || '',
        fullDescription: raw.fullDescription || raw.shortDescription || '',
        images: Array.isArray(raw.images) ? raw.images.map((img: { url?: string; asset?: { url?: string }; alt?: string; caption?: string; width?: number; height?: number; aspectRatio?: number }) => ({
            url: img.url || img.asset?.url || '',
            alt: img.alt || raw.title,
            caption: img.caption,
            width: img.width,
            height: img.height,
            aspectRatio: img.aspectRatio,
        })) : [],
        startingPrice: raw.startingPrice || 0,
        priceFormatted: formattedPrice,
        priceUnit: raw.priceUnit || 'starting rate',
        defaultInclusions: raw.defaultInclusions || [],
        addOns: Array.isArray(raw.addOns) ? raw.addOns.map((addon: { title: string; description?: string; price?: number; priceUnit?: string }, idx: number) => ({
            id: `addon-${idx}`,
            title: addon.title,
            description: addon.description,
            price: addon.price,
            priceFormatted: typeof addon.price === 'number' ? `+ ₱${addon.price.toLocaleString()}` : undefined,
            priceUnit: addon.priceUnit || 'add-on',
        })) : [],
        badge: raw.badge,
        isFeatured: Boolean(raw.isFeatured),
        bookingSlug: raw.bookingSlug || rawSlug,
        priority: raw.priority ?? 0,
        createdAt: raw._createdAt,
    };
}

// =============================================================================
// 2. Data Access Functions (Server Components & API Routes)
// =============================================================================

/**
 * Fetches all published service categories sorted by priority (highest first).
 */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
    try {
        const categories = await client.fetch<ServiceCategory[]>(
            GROQ_SERVICE_CATEGORIES,
            {},
            { next: { revalidate: 3600, tags: ['serviceCategory'] } }
        );
        if (Array.isArray(categories) && categories.length > 0) {
            return categories;
        }
    } catch (err) {
        console.warn('[serviceService] Failed to fetch serviceCategories from Sanity, using mock data fallback:', err);
    }

    const mockCategories: ServiceCategory[] = JSON.parse(JSON.stringify(MOCK_SERVICE_CATEGORIES));
    return mockCategories.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/**
 * Fetches service items, optionally filtered by category slug.
 * Items are ordered by `isFeatured desc`, `priority desc`, then `createdAt desc`.
 */
export async function getServiceItems(categorySlug?: string): Promise<ServiceItem[]> {
    try {
        const params = { category: categorySlug || 'all' };
        const rawItems = await client.fetch<SanityServiceItem[]>(
            GROQ_SERVICE_ITEMS,
            params,
            { next: { revalidate: 3600, tags: ['serviceItem'] } }
        );
        if (Array.isArray(rawItems) && rawItems.length > 0) {
            return rawItems.map(mapSanityItemToServiceItem);
        }
    } catch (err) {
        console.warn('[serviceService] Failed to fetch serviceItems from Sanity, using mock data fallback:', err);
    }

    // Fallback to local mock data
    const items: ServiceItem[] = JSON.parse(JSON.stringify(MOCK_SERVICE_ITEMS));
    
    // Filter by category if specified and not 'all'
    const filtered = categorySlug && categorySlug !== 'all'
        ? items.filter((item) => item.category.slug === categorySlug)
        : items;

    // Apply 3-tier sorting rule: order(isFeatured desc, priority desc, createdAt desc)
    return filtered.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1;
        }
        if ((b.priority ?? 0) !== (a.priority ?? 0)) {
            return (b.priority ?? 0) - (a.priority ?? 0);
        }
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });
}

/**
 * Retrieves a single service item by its URL slug.
 */
export async function getServiceItemBySlug(slug: string): Promise<ServiceItem | null> {
    const items = await getServiceItems();
    return items.find((item) => item.slug === slug) ?? null;
}

// =============================================================================
// Services Hero Content
// =============================================================================

/** GROQ query targeting the `servicesHero` singleton document. */
export const GROQ_SERVICES_HERO = `
  *[_type == "servicesHero" && _id == "servicesHero"][0] {
    title,
    description
  }
`;

/** Hardcoded fallback used when Sanity is unreachable or document is unpublished. */
const SERVICES_HERO_FALLBACK: ServicesHeroContent = {
    title: 'Crafted Experiences, Unforgettable Moments',
    description:
        'Discover our bespoke wedding planning, turnkey coordination, and broadcast-grade technical production services tailored for luxury celebrations across the Philippines.',
};

/**
 * Returns the Services Hero `title` and `description` from Sanity CMS.
 * Falls back to hardcoded defaults when the singleton is not yet published or
 * when the Sanity fetch fails (e.g. during local development without credentials).
 *
 * Cached with ISR at 3600-second revalidation (tagged `servicesHero`).
 */
export async function getServicesHeroContent(): Promise<ServicesHeroContent> {
    try {
        const data = await client.fetch<ServicesHeroContent | null>(
            GROQ_SERVICES_HERO,
            {},
            { next: { revalidate: 3600, tags: ['servicesHero'] } }
        );

        if (data?.title && data?.description) {
            return data;
        }
    } catch (err) {
        console.warn(
            '[serviceService] Failed to fetch servicesHero from Sanity, using fallback:',
            err
        );
    }

    return SERVICES_HERO_FALLBACK;
}
