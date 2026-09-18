// =============================================================================
// portfolio.ts — Portfolio Page & CMS Types
//
// Defines Sanity CMS schema structures and Next.js frontend presentation models
// for the Portfolio section (Wedding Events, Production Designs, Streaming, etc.).
// =============================================================================

import type {
    SanityDocument,
    SanitySlug,
    SanityImageWithPriority,
    VideoSource,
} from './sanity';

// ---------------------------------------------------------------------------
// 1. Sanity CMS Raw Schema Shapes
// ---------------------------------------------------------------------------

/**
 * Sanity Category Document shape (`_type: 'portfolioCategory'`)
 */
export interface SanityPortfolioCategory extends SanityDocument {
    _type: 'portfolioCategory';
    title: string;
    slug: SanitySlug;
    description?: string;
    priority: number;
}

export type PortfolioMediaType = 'image' | 'video';

/**
 * Sanity Portfolio Item Document shape (`_type: 'portfolioItem'`)
 */
export interface SanityPortfolioItem extends SanityDocument {
    _type: 'portfolioItem';
    title: string;
    slug: SanitySlug;
    category: SanityPortfolioCategory;
    mediaType?: PortfolioMediaType;
    tags?: string[];
    /**
     * Thumbnail / Full image asset for display.
     * Enforces LCP optimization and satisfies Google schema requirements.
     */
    thumbnail: SanityImageWithPriority;
    /**
     * Discriminated video source (only present when mediaType === 'video'):
     * - `SanityVideoSource` for direct Sanity CDN video files
     * - `ExternalVideoSource` for YouTube, Vimeo, or Cloudflare Stream URLs
     */
    video?: VideoSource;
    description?: string;
    eventDate?: string;
    location?: string;
    clientName?: string;
    featured?: boolean;
    priority: number;
}

// ---------------------------------------------------------------------------
// 2. Next.js Frontend Models & UI Component Contracts
// ---------------------------------------------------------------------------

/**
 * Clean UI representation of a Portfolio Category
 */
export interface PortfolioCategory {
    id: string;
    title: string;
    slug: string;
    description?: string;
    priority: number;
}

/**
 * Active category filter state: 'all' or any dynamic Sanity category slug string
 */
export type ActiveCategoryFilter = 'all' | string;

/**
 * Clean UI representation of a Portfolio Item
 */
export interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    mediaType: PortfolioMediaType;
    category: {
        title: string;
        slug: string;
    };
    tags: string[];
    thumbnail: {
        url: string;
        alt: string;
        caption?: string;
        width?: number;
        height?: number;
        aspectRatio?: number;
    };
    video?: VideoSource;
    description?: string;
    eventDate?: string;
    location?: string;
    clientName?: string;
    featured: boolean;
    priority: number;
    createdAt?: string;
}

/**
 * State container for the interactive Video Lightbox Modal
 */
export interface PortfolioModalState {
    isOpen: boolean;
    selectedItem: PortfolioItem | null;
}

/**
 * Portfolio Page Payload
 */
export interface PortfolioPageData {
    categories: PortfolioCategory[];
    items: PortfolioItem[];
    activeCategory: ActiveCategoryFilter;
}

/**
 * Next.js 15 App Router Page Props for Portfolio routes
 */
export interface PortfolioPageProps {
    params: Promise<{ category?: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
