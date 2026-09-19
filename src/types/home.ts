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

import type { SanityDocument, SanityImage, SanityImageWithPriority, SanityFile, SanitySlug, VideoSource } from './sanity';
import type { SocialLink, Partner, CTAButton, TeaserVideo } from './shared';

// ---------------------------------------------------------------------------
// 1. Hero / Landing Section
// ---------------------------------------------------------------------------

/**
 * Data contract for the full-screen hero / landing section.
 *
 * Layout spec:
 * - Large brand-line headline (copy from `brandline`).
 * - Full-screen background showreel video — click-to-play (NOT autoplay).
 * - Optional background music track (audio-only, separate from video).
 * - One or more CTA buttons.
 *
 * **SEO / Video policy:**
 * `showreelThumbnail` is **required** and must be a high-quality still frame
 * or branded poster image. It is rendered as the LCP candidate via `next/image`
 * with `priority` prop, improving Core Web Vitals. The video only loads after
 * the user clicks the thumbnail.
 */
export interface HeroSection {
    /**
     * The primary brand headline displayed over the video background.
     * Example: "Crafting unforgettable celebrations."
     */
    brandline: string;

    /**
     * The showreel video source. Discriminate on `_type` in the component:
     * - `'sanity'`   → build a CDN URL via `@sanity/asset-utils` and render `<video>`.
     * - `'external'` → render a Cloudflare Stream / YouTube `<iframe>`.
     *
     * Per video policy: this video MUST NOT autoplay. Display `showreelThumbnail`
     * first; user interaction triggers playback.
     */
    showreelVideo: VideoSource;

    /**
     * Optional vertical (9:16 portrait) mobile showreel video source.
     * When provided, mobile devices can stream this vertical video version
     * to eliminate horizontal cropping on mobile viewports.
     */
    showreelMobileVideo?: VideoSource;

    /**
     * Poster / thumbnail image displayed over the hero before the user plays
     * the showreel. Required.
     *
     * Recommendations:
     * - Minimum 1920 × 1080 px.
     * - Served via `next/image` with `priority` prop for LCP optimisation.
     * - `priority` on the type itself supports future multi-thumbnail selection
     *   (highest-priority image auto-selected as the hero poster).
     */
    showreelThumbnail: SanityImageWithPriority;

    /**
     * Optional background music track (audio-only) that plays when the
     * showreel video is active. Stored as a Sanity file asset (MP3 / AAC).
     * Null when no music track is configured.
     */
    backgroundMusic?: SanityFile;

    /**
     * Optional call-to-action buttons (hardcoded on frontend per optimization spec).
     */
    ctaButtons?: CTAButton[];
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
