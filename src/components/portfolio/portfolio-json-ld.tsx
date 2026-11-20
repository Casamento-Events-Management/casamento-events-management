// =============================================================================
// portfolio-json-ld.tsx — Structured Data Component for Video & Portfolio SEO
//
// Injects schema.org JSON-LD snippets for:
//   - ItemList  → Each portfolio item as a VideoObject or VisualArtwork
//   - BreadcrumbList → Page-level breadcrumb for Google Search navigation
//
// Complies with Google's Video Rich Snippet Guidelines:
//   https://developers.google.com/search/docs/appearance/structured-data/video
// =============================================================================

import React from 'react';
import type { PortfolioItem } from '@/types';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  getSiteUrl,
  SITE_NAME,
  toIsoDateString,
  toIsoDuration,
} from '@/lib/utils/seoUtils';
import { parseVideoSource } from '@/lib/utils/videoUtils';

interface PortfolioJsonLdProps {
  items: PortfolioItem[];
  /** Current page slug — used to generate accurate BreadcrumbList entries. */
  categorySlug?: string;
  /** Current category display title for the BreadcrumbList label. */
  categoryTitle?: string;
  /** True when rendered on /portfolio/gallery or /portfolio/gallery/page/[n]. */
  isGalleryPage?: boolean;
  /** Optional pagination number when rendered on /portfolio/gallery/page/[n]. */
  pageNum?: number;
  siteUrl?: string;
}

/**
 * Resolves the normalized `contentUrl` and `embedUrl` for a VideoObject schema.
 *
 * - External YouTube / Vimeo sources → normalized non-autoplay `embedUrl`.
 * - Sanity CDN / native MP4 hosted videos → `contentUrl` (direct file URL).
 */
function resolveVideoUrls(
  video: PortfolioItem['video']
): { contentUrl?: string; embedUrl?: string } {
  if (!video) return {};

  const parsed = parseVideoSource(video, false);
  if (parsed.sourceType === 'external' && parsed.embedUrl) {
    return { embedUrl: parsed.embedUrl };
  }
  if ((parsed.sourceType === 'sanity' || parsed.sourceType === 'native') && parsed.directUrl) {
    return { contentUrl: parsed.directUrl };
  }

  return {};
}

export function PortfolioJsonLd({
  items,
  categorySlug,
  categoryTitle,
  isGalleryPage = false,
  pageNum,
  siteUrl = getSiteUrl(),
}: PortfolioJsonLdProps) {
  if (!items || items.length === 0) return null;

  // ---------------------------------------------------------------------------
  // 1. Build ItemList schema — VideoObject or VisualArtwork per item
  // ---------------------------------------------------------------------------
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryTitle
      ? `${categoryTitle} Portfolio — ${SITE_NAME}`
      : `Event Production Portfolio — ${SITE_NAME}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => {
      const isVideo = item.mediaType === 'video' && item.video;

      const uploadDate = toIsoDateString(item.eventDate || item.createdAt);
      const isoDuration = toIsoDuration(item.duration);

      if (isVideo) {
        const { contentUrl, embedUrl } = resolveVideoUrls(item.video);

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'VideoObject',
            name: item.title,
            description: item.description || `${item.title} — ${item.category.title} by ${SITE_NAME}`,
            thumbnailUrl: [item.thumbnail.url],
            ...(uploadDate && { uploadDate }),
            ...(isoDuration && { duration: isoDuration }),
            ...(contentUrl && { contentUrl }),
            ...(embedUrl && { embedUrl }),
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: siteUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/icon.png`,
              },
            },
          },
        };
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'VisualArtwork',
          name: item.title,
          description: item.description || `${item.title} — ${item.category.title} by ${SITE_NAME}`,
          image: item.thumbnail.url,
          ...(uploadDate && { dateCreated: uploadDate }),
          ...(item.location && { locationCreated: item.location }),
          creator: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: siteUrl,
          },
        },
      };
    }),
  };

  // ---------------------------------------------------------------------------
  // 2. Build BreadcrumbList schema
  // ---------------------------------------------------------------------------
  const breadcrumbEntries: Array<{ name: string; path: string }> = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
  ];

  if (isGalleryPage) {
    breadcrumbEntries.push({ name: 'Gallery', path: '/portfolio/gallery' });
    if (pageNum && pageNum > 1) {
      breadcrumbEntries.push({
        name: `Page ${pageNum}`,
        path: `/portfolio/gallery/page/${pageNum}`,
      });
    }
  } else if (categorySlug && categoryTitle) {
    breadcrumbEntries.push({
      name: categoryTitle,
      path: `/portfolio/${categorySlug}`,
    });
  }

  const breadcrumbSchema = buildBreadcrumbJsonLd(breadcrumbEntries);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
