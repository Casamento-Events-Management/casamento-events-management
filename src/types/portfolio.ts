// =============================================================================
// portfolio.ts — Portfolio Page & CMS Types
//
// Defines Sanity CMS schema structures and Next.js frontend presentation models
// for the Portfolio section (Wedding Events, Production Designs, Streaming, etc.).
// =============================================================================

import type {
  SanityDocument,
  SanitySlug,
  SanityImage,
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
  /**
   * ISO 8601 duration of the video (e.g. "PT3M45S").
   * Required by Google Video Rich Snippet guidelines for VideoObject schema.
   * Only applicable when mediaType === 'video'.
   */
  duration?: string;
  description?: string;
  eventDate?: string;
  location?: string;
  clientName?: string;
  featured?: boolean;
  priority: number;
}

// ---------------------------------------------------------------------------
// 2. Upcoming Event Card Contract
// ---------------------------------------------------------------------------

/**
 * A single upcoming event displayed as a card in the "Upcoming Events" section.
 */
export interface UpcomingEvent {
  /** Public-facing event title shown on the card heading. */
  title: string;

  /**
   * URL slug for the future event detail page.
   * Example: `{ _type: 'slug', current: 'grand-debut-2027' }`.
   */
  slug: SanitySlug;

  /**
   * ISO-8601 date-time string of the event start time.
   * Example: `"2027-02-14T18:00:00+08:00"`.
   */
  date: string;

  /** Optional venue name or city displayed beneath the date on the card. */
  location?: string;

  /** Hero image used as the card cover. */
  coverImage: SanityImage;

  /**
   * Availability / lifecycle status of the event.
   * - `'upcoming'`  — tickets available (default).
   * - `'sold-out'`  — event full; show waitlist CTA if applicable.
   * - `'completed'` — past event; card may link to a recap.
   */
  status?: 'upcoming' | 'sold-out' | 'completed';

  /** Editorial display order. Higher value = shown first in the section. */
  priority: number;
}

/**
 * Raw Sanity document shape for Portfolio Upcoming Events singleton (`_type: 'portfolioUpcomingEvents'`).
 */
export interface PortfolioUpcomingEventsContent extends SanityDocument {
  _type: 'portfolioUpcomingEvents';
  eyebrow?: string;
  title?: string;
  description?: string;
  upcomingEvents: UpcomingEvent[];
}

// ---------------------------------------------------------------------------
// 3. Next.js Frontend Models & UI Component Contracts
// ---------------------------------------------------------------------------

import type { PortfolioCategory, ActiveCategoryFilter } from './category';
export type { PortfolioCategory, ActiveCategoryFilter };

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
  duration?: string;
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

// ---------------------------------------------------------------------------
// Hero Section Types (Singleton CMS-controlled)
// ---------------------------------------------------------------------------

/**
 * Raw Sanity CMS document shape for the Portfolio Page Hero singleton
 * (`_type: 'portfolioHero'`, `_id: 'portfolioHero'`).
 */
export interface SanityPortfolioHero extends SanityDocument {
  _type: 'portfolioHero';
  title: string;
  description: string;
  galleryEyebrow?: string;
  galleryTitle?: string;
  galleryDescription?: string;
  upcomingEventsEyebrow?: string;
  upcomingEventsTitle?: string;
  upcomingEventsDescription?: string;
}

/**
 * Next.js UI model for the Portfolio Hero section.
 * Returned by `getPortfolioHeroContent()` in `portfolioService.ts`.
 */
export interface PortfolioHeroContent {
  title: string;
  description: string;
  galleryEyebrow?: string;
  galleryTitle?: string;
  galleryDescription?: string;
  upcomingEventsEyebrow?: string;
  upcomingEventsTitle?: string;
  upcomingEventsDescription?: string;
}
