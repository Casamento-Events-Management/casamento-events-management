// =============================================================================
// service.ts — Sanity CMS & Frontend Domain Types for Services
//
// Defines raw GROQ query types and transformed application interfaces for the
// Casamento Events Services catalog, including categories, service items,
// inclusions, add-ons, and booking page redirect params.
// =============================================================================

import type { SanityDocument, SanityImageWithPriority, SanitySlug } from './sanity';

// ---------------------------------------------------------------------------
// 1. Service Category Types
// ---------------------------------------------------------------------------

/**
 * Raw JSON shape of a Service Category returned by GROQ queries from Sanity.
 */
export interface SanityServiceCategory extends SanityDocument {
    _type: 'serviceCategory';
    /** Name of the category (e.g. "Full Planning & Styling", "Coordination", "Technical Production") */
    title: string;
    /** URL-friendly unique identifier slug. */
    slug: SanitySlug;
    /** Optional summary explaining what this category covers. */
    description?: string;
    /** Lucide icon identifier key or display badge icon. */
    icon?: string;
    /** Display priority order (higher value = displayed first in category selector). */
    priority: number;
}

/**
 * Application domain interface for a Service Category.
 */
export interface ServiceCategory {
    /** Unique string ID derived from Sanity document _id or slug. */
    id: string;
    /** Title of the category displayed in filter tabs/list. */
    title: string;
    /** URL-safe slug key (e.g., "full-planning"). */
    slug: string;
    /** Optional description of the category. */
    description?: string;
    /** Optional icon key for UI rendering. */
    icon?: string;
    /** Numeric priority for ordering categories. */
    priority: number;
}

// ---------------------------------------------------------------------------
// 2. Service Add-On Types
// ---------------------------------------------------------------------------

/**
 * Raw object structure for optional service add-ons defined inside Sanity.
 */
export interface SanityServiceAddOn {
    _type: 'serviceAddOn';
    /** Name of the add-on feature (e.g. "Same-Day-Edit (SDE) Video", "Drone Aerial Shot"). */
    title: string;
    /** Detailed description of what the add-on covers. */
    description?: string;
    /** Starting rate or additional price for this add-on in PHP. */
    price?: number;
    /** Optional price unit or note (e.g., "per day", "flat fee", "starting rate"). */
    priceUnit?: string;
}

/**
 * Clean application domain interface for a Service Add-On.
 */
export interface ServiceAddOn {
    /** Unique string identifier or index-based key. */
    id: string;
    /** Title of the add-on item. */
    title: string;
    /** Optional description explaining the add-on. */
    description?: string;
    /** Numeric price rate if applicable. */
    price?: number;
    /** Pre-formatted price string for direct display (e.g., "+ ₱15,000"). */
    priceFormatted?: string;
    /** Unit or pricing interval. */
    priceUnit?: string;
}

// ---------------------------------------------------------------------------
// 3. Service Item Types
// ---------------------------------------------------------------------------

/**
 * Raw JSON shape of a Service Item document returned by GROQ queries from Sanity.
 */
export interface SanityServiceItem extends SanityDocument {
    _type: 'serviceItem';
    /** Name of the service (e.g. "Bespoke Full Wedding Planning & Execution"). */
    title: string;
    /** Unique URL-friendly slug. */
    slug: SanitySlug;
    /** Reference or projected category object. */
    category: {
        _ref?: string;
        title: string;
        slug: SanitySlug | string;
    };
    /** Subtitle or service type tag (e.g., "Turnkey Event Management", "On-the-Day Management"). */
    serviceType: string;
    /** Concise summary for the 50% vertical card view. */
    shortDescription: string;
    /** Full detailed description for the 35% detail preview panel. */
    fullDescription?: string;
    /** Gallery of images for card carousel & detail modal (hotspot & priority supported). */
    images: SanityImageWithPriority[];
    /** Numeric starting price rate (e.g., 120000). */
    startingPrice: number;
    /** Human-readable starting rate string (e.g., "₱120,000" or "Starting at ₱120,000"). */
    priceFormatted?: string;
    /** Pricing interval / rate modifier (e.g., "/ event", "flat fee", "starting rate"). */
    priceUnit?: string;
    /** Default inclusions packaged in this base service tier. */
    defaultInclusions: string[];
    /** Optional add-on features that can be added to this service. */
    addOns?: SanityServiceAddOn[];
    /** Optional badge highlight (e.g. "Most Popular", "Signature Service"). */
    badge?: string;
    /** Highlighting flag for primary featured service cards. */
    isFeatured?: boolean;
    /** Optional custom booking URL slug override. */
    bookingSlug?: string;
    /** Display priority order (higher value = displayed first). */
    priority: number;
}

/**
 * Clean application domain interface for a Service Item.
 */
export interface ServiceItem {
    /** Unique ID derived from Sanity document _id. */
    id: string;
    /** Full title of the service. */
    title: string;
    /** URL slug key. */
    slug: string;
    /** Category details. */
    category: {
        title: string;
        slug: string;
    };
    /** Subtitle / Service tier indicator. */
    serviceType: string;
    /** Concise summary text. */
    shortDescription: string;
    /** Full detailed description for the detail panel. */
    fullDescription: string;
    /** Images array for the card carousel and detail display. */
    images: {
        url: string;
        alt: string;
        caption?: string;
        width?: number;
        height?: number;
        aspectRatio?: number;
    }[];
    /** Starting rate integer value. */
    startingPrice: number;
    /** Formatted starting rate text (e.g., "₱120,000"). */
    priceFormatted: string;
    /** Price unit tag (e.g., "starting rate", "/ event"). */
    priceUnit: string;
    /** Array of string inclusion bullet points. */
    defaultInclusions: string[];
    /** Array of optional add-ons available for this service. */
    addOns: ServiceAddOn[];
    /** Optional highlight badge text. */
    badge?: string;
    /** Featured status. */
    isFeatured: boolean;
    /** Custom target parameter for book now redirect. */
    bookingSlug: string;
    /** Display order priority. */
    priority: number;
    /** Creation timestamp. */
    createdAt?: string;
}

// ---------------------------------------------------------------------------
// 4. Filtering & Navigation Types
// ---------------------------------------------------------------------------

/**
 * Filter state value: 'all' or specific service category slug.
 */
export type ActiveServiceCategoryFilter = 'all' | string;

/**
 * Redirect payload contract for navigating to the Booking page.
 * Seamlessly passes context to `/book-now`.
 */
export interface ServiceBookingRedirectParams {
    /** The service slug identifier (e.g. "full-wedding-coordination"). */
    serviceSlug: string;
    /** The category slug identifier (e.g. "wedding-planning"). */
    categorySlug?: string;
    /** Optional action flag, e.g. 'book' | 'quote'. */
    action?: 'book' | 'quote';
}

// ---------------------------------------------------------------------------
// 5. Hero Section Types (Singleton CMS-controlled)
// ---------------------------------------------------------------------------

/**
 * Raw Sanity CMS document shape for the Services Page Hero singleton
 * (`_type: 'servicesHero'`, `_id: 'servicesHero'`).
 */
export interface SanityServicesHero extends SanityDocument {
    _type: 'servicesHero';
    /** Primary headline shown at the top of the /services route. */
    title: string;
    /** Introductory paragraph shown beneath the headline. */
    description: string;
}

/**
 * Next.js UI model for the Services Hero section.
 * Returned by `getServicesHeroContent()` in `serviceService.ts`.
 */
export interface ServicesHeroContent {
    title: string;
    description: string;
}
