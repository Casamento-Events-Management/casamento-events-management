// =============================================================================
// shared.ts — Cross-Page Reusable Types
//
// Types here are page-agnostic building blocks that can be composed into
// any page-level document type (Home, Events, Gallery, etc.).
// Do NOT import from page-specific files (e.g. home.ts) — this file must
// remain a leaf in the import tree to avoid circular dependencies.
// =============================================================================

import type {
    SanityImage,
    SanityImageWithPriority,
    VideoSource,
} from './sanity';

// ---------------------------------------------------------------------------
// 1. Social
// ---------------------------------------------------------------------------

/**
 * The set of social platforms the studio supports.
 * Add new platforms here when the brand expands its social presence.
 */
export type SocialPlatform = 'instagram' | 'facebook' | 'youtube' | 'tiktok';

/**
 * A single social media link entry.
 * Rendered in the "Connect with us" section of the Home page and in the
 * site footer. Kept minimal so any component can render it without extra deps.
 */
export interface SocialLink {
    platform: SocialPlatform;
    /** Absolute URL to the brand's profile on this platform. */
    url: string;
}

// ---------------------------------------------------------------------------
// 2. Partners
// ---------------------------------------------------------------------------

/**
 * A business partner or sponsor displayed in the Partners section.
 *
 * `priority` controls display order (higher = shown first) following the
 * same `order(priority desc, _createdAt asc)` tie-breaking convention used
 * across all Sanity ordered assets.
 *
 * Example: a Platinum sponsor at priority 100 always appears before a
 * Silver sponsor at priority 10, regardless of when they were added.
 */
export interface Partner {
    name: string;
    /** Partner's logo image, sourced from Sanity. */
    logo: SanityImage;
    /** Optional link to the partner's website. Rendered as an `<a>` tag. */
    url?: string;
    /**
     * Display order. Higher value = shown first.
     * Tie-break: earlier `_createdAt` wins.
     */
    priority: number;
}

// ---------------------------------------------------------------------------
// 3. CTA Button
// ---------------------------------------------------------------------------

/**
 * A call-to-action button configuration.
 * Used in the Hero landing section and any future marketing section
 * that needs a pair of primary/secondary actions.
 *
 * `variant` maps to the design system's button variants:
 * - `'primary'`   — filled / high-emphasis (e.g. "Book Now")
 * - `'secondary'` — outlined / low-emphasis (e.g. "Learn More")
 */
export interface CTAButton {
    /** Button label text displayed to the user. */
    label: string;
    /** Destination URL — may be internal (`/events`) or external. */
    href: string;
    variant?: 'primary' | 'secondary';
}

// ---------------------------------------------------------------------------
// 4. Teaser Video
// ---------------------------------------------------------------------------

/**
 * A single teaser / highlight video displayed in the "3 Videos for teaser"
 * section on the Home page.
 *
 * **Video / SEO policy enforcement:**
 * - `thumbnail` is **required** — the image is shown as the clickable poster
 *   before the user initiates playback, improving LCP and SEO.
 * - `video` uses `VideoSource` (discriminated union) so the renderer knows
 *   at compile time whether to build a Sanity CDN `<video>` or an external
 *   platform `<iframe>`.
 *
 * `priority` follows the standard `order(priority desc, _createdAt asc)` rule.
 * The three teaser slots are filled with the three highest-priority items.
 */
export interface TeaserVideo {
    /** Short display title shown beneath the video thumbnail. */
    title: string;
    /**
     * The video source. Discriminate on `_type`:
     * - `'sanity'`   → Sanity CDN hosted file.
     * - `'external'` → External embed (YouTube, Vimeo, Cloudflare Stream).
     */
    video: VideoSource;
    /**
     * Click-to-play poster image. Required.
     * Carry `priority` so future gallery views can sort multiple thumbnails.
     */
    thumbnail: SanityImageWithPriority;
    /** Optional short description displayed below the title. */
    description?: string;
    /**
     * Display order within the teaser row.
     * Higher value = leftmost position. Tie-break: earlier `_createdAt` wins.
     */
    priority: number;
}
