// =============================================================================
// home.ts — Home Page Document Types
//
// Types the shape of the `homePage` Sanity document returned by GROQ queries.
// Each interface matches one section visible on the Home page per the
// confirmed design spec:
//
//   Landing section     → HeroSection
//   Upcoming events     → UpcomingEvent[]
//   Partners section    → Partner[]          (in shared.ts)
//   Connect with us     → SocialLink[]       (in shared.ts)
//   3 Teaser videos     → TeaserVideo[]      (in shared.ts)
//
// Import from '@/types' (barrel) rather than this file directly so that
// re-exports stay centralised.
// =============================================================================

import type { SanityDocument, SanityImage, SanityImageWithPriority, SanitySlug, VideoSource } from './sanity';
import type { SocialLink, Partner, TeaserVideo } from './shared';

// ---------------------------------------------------------------------------
// 1. Hero / Service Carousel Section
// ---------------------------------------------------------------------------

/**
 * Interface representing an individual service highlight slide within the Hero carousel.
 */
export interface HeroSlide {
    _key?: string;
    /** Heading displayed on the left 30% pane (e.g. "Full Planning & Styling"). */
    heading: string;
    /** Short service overview text displayed on the left pane. */
    description: string;
    /** Text label for the CTA button (defaults to "Explore Service"). */
    ctaText?: string;
    /** Explicit URL link destination for CTA (e.g., "/services?category=full-planning-styling"). */
    ctaLink?: string;
    /** Media discriminator: 'image' or 'video'. */
    mediaType: 'image' | 'video';
    /** Image object when mediaType === 'image'. */
    image?: SanityImageWithPriority;
    /** Video source when mediaType === 'video'. */
    video?: VideoSource;
    /** Required poster thumbnail image for video slides (for LCP optimization & video policy). */
    videoPoster?: SanityImageWithPriority;
    /** Optional resolved category slug from Sanity reference */
    serviceCategorySlug?: string;
}

/**
 * Data contract for the full-width Hero Service Carousel section.
 */
export interface HeroSection {
    /** Auto-play rotation interval in seconds (default: 3 seconds). */
    autoPlayInterval?: number;
    /** Array of service highlight slides. */
    slides: HeroSlide[];
}


// ---------------------------------------------------------------------------
// 2. Upcoming Event Card
// ---------------------------------------------------------------------------

/**
 * A single upcoming event displayed as a card in the "Upcoming Events" section.
 *
 * `priority` and `_createdAt` tie-breaking govern display order independently
 * of the event `date`, allowing the editorial team to pin a featured event at
 * the top even if it is chronologically later.
 *
 * `slug` is included now (even though the events detail page is future scope)
 * so that GROQ projections are consistent from the start and card links can be
 * enabled without a type migration.
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
     * Format for display with `Intl.DateTimeFormat` — do NOT hardcode locale.
     */
    date: string;

    /** Optional venue name or city displayed beneath the date on the card. */
    location?: string;

    /**
     * Hero image used as the card cover.
     * Render via `next/image` with `sizes` for responsive optimisation.
     */
    coverImage: SanityImage;

    /**
     * Availability / lifecycle status of the event.
     * - `'upcoming'`  — tickets available (default).
     * - `'sold-out'`  — event full; show waitlist CTA if applicable.
     * - `'completed'` — past event; card may link to a recap.
     */
    status?: 'upcoming' | 'sold-out' | 'completed';

    /**
     * Editorial display order. Higher value = shown first in the section.
     * Tie-break: earlier `_createdAt` wins (older entry surfaces first).
     * This is independent of `date` so a far-future headline event can be
     * pinned at the top of the list.
     */
    priority: number;
}

// ---------------------------------------------------------------------------
// 3. Home Page Document
// ---------------------------------------------------------------------------

/**
 * The root type for the `homePage` singleton document in Sanity.
 *
 * This is what a GROQ query targeting the homePage document returns after
 * projection. All sections that are arrays (`teaserVideos`, `upcomingEvents`,
 * `partners`) should be sorted in the GROQ query itself:
 *   `order(priority desc, _createdAt asc)`
 *
 * Extends `SanityDocument` to carry system fields (_id, _rev, _createdAt,
 * _updatedAt) needed for cache revalidation tags.
 */
export interface HomePageContent extends SanityDocument {
    /** Fixed type discriminator matching the Sanity schema name. */
    _type: 'homePage';

    /** Full-screen landing / hero section data. */
    hero: HeroSection;

    /**
     * Teaser videos displayed in the teaser row.
     * Sort in GROQ: `order(priority desc, _createdAt asc)` then `.slice(0, N)`.
     */
    teaserVideos: TeaserVideo[];

    /**
     * Upcoming event cards.
     * Sort in GROQ: `order(priority desc, _createdAt asc)`.
     */
    upcomingEvents: UpcomingEvent[];

    /**
     * Partner / sponsor logos.
     * Sort in GROQ: `order(priority desc, _createdAt asc)`.
     */
    partners: Partner[];

    /** Social media links for the "Connect with us" section. */
    socialLinks: SocialLink[];
}
