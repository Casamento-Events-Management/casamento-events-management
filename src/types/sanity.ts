// =============================================================================
// sanity.ts — Sanity CMS Primitive Types
//
// These types mirror the raw JSON shapes returned by GROQ queries.
// They are the lowest-level building blocks — all other types build on top of
// these. Do NOT add business-logic or page-specific fields here.
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Core Document
// ---------------------------------------------------------------------------

/**
 * Every document stored in Sanity inherits these five system fields.
 * Extend this when typing a specific CMS document (e.g. homePage, event).
 */
export interface SanityDocument {
    /** Unique document ID (e.g. "drafts.abc123" in draft state). */
    _id: string;
    /** The schema type name registered in Sanity Studio (e.g. "homePage"). */
    _type: string;
    /** ISO-8601 timestamp of initial document creation. */
    _createdAt: string;
    /** ISO-8601 timestamp of last document write. */
    _updatedAt: string;
    /** Revision hash — changes on every save. Useful for cache invalidation. */
    _rev: string;
}

// ---------------------------------------------------------------------------
// 2. Shared Asset Reference
// ---------------------------------------------------------------------------

/**
 * The thin pointer Sanity stores for any uploaded asset (image or file).
 * The actual CDN URL is resolved at query time via `asset->url` or the
 * `@sanity/image-url` builder.
 */
export interface SanityAssetRef {
    /** The `asset` reference string, e.g. "image-abc123-1920x1080-jpg". */
    _ref: string;
    _type: 'reference';
    /** The resolved CDN URL, projected via GROQ (e.g., `asset->url`) */
    url?: string;
}

// ---------------------------------------------------------------------------
// 3. Image
// ---------------------------------------------------------------------------

/**
 * Hotspot / crop data set by the editor in the Sanity Studio image tool.
 * Tells `next/image` (or the URL builder) which focal region to keep visible
 * when the image is cropped to a non-native aspect ratio.
 */
export interface SanityHotspot {
    /** Horizontal focal point (0–1, left → right). */
    x: number;
    /** Vertical focal point (0–1, top → bottom). */
    y: number;
    /** Height of the hotspot region as a fraction of the image height. */
    height: number;
    /** Width of the hotspot region as a fraction of the image width. */
    width: number;
}

/**
 * A Sanity image field as returned by a GROQ projection.
 * Use `SanityImageWithPriority` when the image participates in an
 * ordered gallery or thumbnail sequence.
 */
export interface SanityImage {
    _type: 'image';
    asset: SanityAssetRef;
    /** Accessibility label. Always required in the CMS schema. */
    alt?: string;
    /** Focal-point crop data from the Sanity Studio image editor. */
    hotspot?: SanityHotspot;
}

// ---------------------------------------------------------------------------
// 4. File
// ---------------------------------------------------------------------------

/**
 * A generic Sanity file field (audio, PDF, etc.).
 * For video files specifically, prefer `SanityVideoSource` which carries
 * the click-to-play contract and optional MIME type.
 */
export interface SanityFile {
    _type: 'file';
    asset: SanityAssetRef;
}

// ---------------------------------------------------------------------------
// 5. Slug
// ---------------------------------------------------------------------------

/**
 * Sanity slug field — the URL-safe identifier for a document.
 * Example: `{ _type: 'slug', current: 'our-first-event' }`.
 */
export interface SanitySlug {
    _type: 'slug';
    current: string;
}

// ---------------------------------------------------------------------------
// 6. Priority System
// ---------------------------------------------------------------------------

/**
 * Stamps any Sanity object or document with an ordinal `priority` field.
 *
 * **Display rule**: higher `priority` values appear first.
 * **Tie-breaking rule**: when two items share the same `priority`, the one
 * with the earlier `_createdAt` timestamp takes precedence (oldest content
 * first). GROQ queries should use:
 *   `order(priority desc, _createdAt asc)`
 *
 * Use this utility any time a CMS editor needs explicit ordering control
 * independent of publication date.
 */
export type WithPriority<T> = T & {
    /**
     * Editor-assigned display order. Higher number = shown first.
     * Recommended convention: use steps of 10 (10, 20, 30 …) so new items
     * can be inserted between existing ones without renumbering.
     */
    priority: number;
};

/**
 * A `SanityImage` that participates in an ordered asset sequence.
 *
 * Example use-cases:
 * - Gallery where the CMS editor controls display order.
 * - Video thumbnail when multiple candidate thumbnails exist.
 * - Partner logo when partners must be ordered by tier.
 *
 * Optional `caption` surfaces text that can be rendered as a `<figcaption>`
 * or used as a more descriptive alt when the short `alt` isn't enough.
 */
export type SanityImageWithPriority = WithPriority<SanityImage> & {
    /** Longer description displayed beneath the image (e.g. gallery caption). */
    caption?: string;
};

/**
 * A `SanityFile` that participates in an ordered asset sequence.
 * Inherits the same priority + tie-breaking rules as `WithPriority<T>`.
 */
export type SanityFileWithPriority = WithPriority<SanityFile>;

// ---------------------------------------------------------------------------
// 7. Video Source — Discriminated Union
// ---------------------------------------------------------------------------

/**
 * A video file hosted directly on the Sanity CDN.
 *
 * Use for short clips (showreel, teaser) where the production team
 * uploads an optimised WebM / MP4 and wants Sanity as the single source
 * of truth. The `mimeType` hint lets the `<video>` element serve the
 * correct `<source type>` without an extra HEAD request.
 */
export interface SanityVideoSource {
    _type: 'sanity';
    asset: SanityAssetRef;
    /** Optional MIME hint, e.g. "video/mp4" or "video/webm". */
    mimeType?: string;
}

/**
 * External video streaming platforms supported by the site.
 */
export type ExternalVideoProvider = 'cloudflare' | 'youtube' | 'vimeo';

/**
 * Centralized union of all supported video providers, including native Sanity CDN uploads.
 */
export type VideoProvider = 'sanity' | ExternalVideoProvider;

/**
 * A video hosted on an external CDN or platform.
 *
 * Supported providers:
 * - `'cloudflare'` — Cloudflare Stream (iframe embed or HLS URL)
 * - `'youtube'`   — YouTube embed URL (use `/embed/<id>` form)
 * - `'vimeo'`     — Vimeo embed URL
 *
 * The `provider` discriminator is deliberately narrow so the video
 * renderer component can switch on it and apply provider-specific
 * iframe attributes or player configs without string-matching the URL.
 */
export interface ExternalVideoSource {
    _type: 'external';
    /** Full URL to the video stream or embed endpoint. */
    url: string;
    provider?: ExternalVideoProvider;
}

/**
 * Union of the two supported video source strategies.
 *
 * **Video / SEO policy (mandatory):**
 * - Videos MUST NOT autoplay.
 * - A `thumbnail` (`SanityImageWithPriority`) MUST be displayed before
 *   playback begins so the LCP candidate is an optimised image, not a
 *   blank video frame.
 * - The user must click/tap to initiate playback.
 *
 * Components should switch on `_type` to pick the correct renderer:
 * ```ts
 * if (source._type === 'sanity')   // render <video> with Sanity CDN URL
 * if (source._type === 'external') // render <iframe> or external player
 * ```
 */
export type VideoSource = SanityVideoSource | ExternalVideoSource;

