// =============================================================================
// articleBanner.ts — Article Vlog Hero Banner Types
// =============================================================================

import type { SanityDocument, SanityImageWithPriority } from './sanity';

/**
 * Call-to-action button payload for Article Vlog Banner overlay.
 */
export interface ArticleBannerCTA {
  label?: string;
  href?: string;
}

/**
 * Article Vlog Banner Document model from Sanity CMS.
 */
export interface ArticleVlogBanner extends SanityDocument {
  /** Full-width background banner image (LCP priority asset). Required. */
  backgroundImage: SanityImageWithPriority;
  /** Optional headline text overlay. If omitted, banner renders as image-only. */
  title?: string;
  /** Optional summary description text overlay. */
  description?: string;
  /** Optional CTA button overlay. */
  ctaButton?: ArticleBannerCTA;
}

/**
 * Props for the ArticleVlogBanner component.
 */
export interface ArticleVlogBannerProps {
  banner?: ArticleVlogBanner | null;
}
