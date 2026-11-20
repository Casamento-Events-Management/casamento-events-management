// =============================================================================
// article-vlog-json-ld.tsx — Structured Data for Individual Article / Vlog Pages
//
// Injects schema.org JSON-LD for:
//   - BlogPosting (Article rich result metadata + publisher E-E-A-T)
//   - VideoObject (when mediaType === 'video' and a valid video URL resolves)
//   - BreadcrumbList (Home > Articles > Vlogs > Article Title)
// =============================================================================

import React from 'react';
import type { ArticleVlogItem } from '@/types';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  DEFAULT_OG_IMAGE_PATH,
  getSiteUrl,
  SITE_NAME,
  toIsoDateString,
  toIsoDuration,
} from '@/lib/utils/seoUtils';
import { parseVideoSource } from '@/lib/utils/videoUtils';

interface ArticleVlogJsonLdProps {
  item: ArticleVlogItem;
  slug: string;
}

export function ArticleVlogJsonLd({ item, slug }: ArticleVlogJsonLdProps) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl(`/articles/vlogs/${slug}`);
  const thumbnailUrl = item.thumbnail?.asset?.url || buildCanonicalUrl(DEFAULT_OG_IMAGE_PATH);
  const datePublished = toIsoDateString(item.publishedAt || item._createdAt);
  const dateModified = toIsoDateString(item._updatedAt || item.publishedAt || item._createdAt);
  const description = item.description || item.summary || item.title;

  const publisher = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon.png`,
      width: 512,
      height: 512,
    },
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: item.title,
    description,
    image: [thumbnailUrl],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    inLanguage: 'en-PH',
    ...(item.category?.title && { articleSection: item.category.title }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher,
  };

  let videoSchema: Record<string, unknown> | null = null;
  if (item.mediaType === 'video' && item.videoSource) {
    const parsed = parseVideoSource(item.videoSource, false);
    const isoDuration = toIsoDuration(item.videoDuration);
    if (parsed.embedUrl || parsed.directUrl) {
      videoSchema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: item.title,
        description,
        thumbnailUrl: [thumbnailUrl],
        ...(datePublished && { uploadDate: datePublished }),
        ...(isoDuration && { duration: isoDuration }),
        ...(parsed.sourceType === 'external' && parsed.embedUrl
          ? { embedUrl: parsed.embedUrl }
          : parsed.directUrl
            ? { contentUrl: parsed.directUrl }
            : {}),
        publisher,
      };
    }
  }

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Articles & Vlogs', path: '/articles' },
    { name: 'Vlogs & Guides', path: '/articles/vlogs' },
    { name: item.title, path: `/articles/vlogs/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(videoSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
