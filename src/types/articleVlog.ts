// =============================================================================
// articleVlog.ts — Article Vlog Gallery & Detail Page Types
//
// Covers: gallery listing items, individual vlog detail, articles hero section,
// and associated component props.
// =============================================================================

import type { SanityDocument, SanityImageWithPriority, VideoSource } from './sanity';
import type { PortfolioCategory } from './portfolio';

// ---------------------------------------------------------------------------
// 1. Media Type
// ---------------------------------------------------------------------------

export type ArticleVlogMediaType = 'video' | 'image';

// ---------------------------------------------------------------------------
// 2. Social Backlink
// ---------------------------------------------------------------------------

/**
 * A single social media backlink entry on a vlog item.
 * Renders as a clickable SocialIcon deep-linking to the original post.
 */
export interface VlogSocialBacklink {
    platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'twitter' | string;
    url: string;
}

// ---------------------------------------------------------------------------
// 3. Article Vlog Item (Gallery + Detail)
// ---------------------------------------------------------------------------

/**
 * Full document type for a Casamento Article Vlog.
 * Used by the gallery listing (lean GROQ projection) and the detail page
 * at /articles/vlogs/[slug] (full projection including `content`).
 */
export interface ArticleVlogItem extends SanityDocument {
    title: string;
    slug: { current: string };
    /** References the shared portfolioCategory taxonomy. */
    category: PortfolioCategory;
    mediaType: ArticleVlogMediaType;
    /** Required LCP priority thumbnail image. */
    thumbnail: SanityImageWithPriority;
    /** Only present when mediaType === 'video'. */
    videoSource?: VideoSource;
    /** Display duration e.g. "06:45". Only for video items. */
    videoDuration?: string;
    /** Display read time e.g. "4 min read". Only for image items. */
    readTime?: string;
    /** Short 2-line excerpt for gallery grid. */
    summary: string;
    /** Longer editorial description for gallery action row and detail page. */
    description?: string;
    /** Links to original social media posts. Renders as SocialIcon buttons. */
    socialBacklinks?: VlogSocialBacklink[];
    /** Full portable text body. Only projected on /articles/vlogs/[slug]. */
    content?: unknown[];
    publishedAt: string;
    /** Higher = shown first. Tie-break: newer publishedAt wins. */
    priority: number;
}

// ---------------------------------------------------------------------------
// 4. Articles Hero (Singleton — Gallery Section Header)
// ---------------------------------------------------------------------------

/**
 * CMS-controlled header content rendered above the vlog gallery filter bar.
 * Sourced from the `articlesHero` singleton document.
 */
export interface ArticlesHeroContent extends SanityDocument {
    /** Small kicker tag above the title. e.g. "EVENT JOURNAL" */
    eyebrow: string;
    /** Main section headline. e.g. "Explore Our Vlogs & Guides" */
    title: string;
    /** Short subheading paragraph below the title. */
    description: string;
}

// ---------------------------------------------------------------------------
// 5. Component Props
// ---------------------------------------------------------------------------

export interface ArticlesHeroProps {
    content?: ArticlesHeroContent | null;
}

export interface VlogGalleryProps {
    items: ArticleVlogItem[];
    categories: PortfolioCategory[];
    totalCount: number;
    onSelectVideo?: (item: ArticleVlogItem) => void;
}

export interface VlogItemProps {
    item: ArticleVlogItem;
    onPlayVideo?: (item: ArticleVlogItem) => void;
}

export interface VlogCategoryFilterProps {
    categories: PortfolioCategory[];
    activeSlug: string;
    onSelect: (slug: string) => void;
}
