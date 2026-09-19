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

interface PortfolioJsonLdProps {
    items: PortfolioItem[];
    /** Current page slug — used to generate accurate BreadcrumbList entries. */
    categorySlug?: string;
    /** Current category display title for the BreadcrumbList label. */
    categoryTitle?: string;
    siteUrl?: string;
}

/**
 * Resolves the correct `contentUrl` and `embedUrl` for a VideoObject schema.
 *
 * - External YouTube / Vimeo sources → only `embedUrl` (not `contentUrl`,
 *   which Google expects to be a direct downloadable file URL).
 * - Sanity CDN / Supabase hosted videos → `contentUrl` (direct file URL).
 */
function resolveVideoUrls(
    video: PortfolioItem['video'],
): { contentUrl?: string; embedUrl?: string } {
    if (!video) return {};

    if (video._type === 'external') {
        // YouTube / Vimeo: use embedUrl only — these are not direct download URLs
        return { embedUrl: video.url };
    }

    if (video._type === 'sanity' && video.asset?.url) {
        // Direct CDN-hosted video: use contentUrl (downloadable source)
        return { contentUrl: video.asset.url };
    }

    return {};
}

export function PortfolioJsonLd({
    items,
    categorySlug,
    categoryTitle,
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
}: PortfolioJsonLdProps) {
    if (!items || items.length === 0) return null;

    // -------------------------------------------------------------------------
    // 1. Build ItemList schema — VideoObject or Visual Artwork per item
    // -------------------------------------------------------------------------
    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => {
            const isVideo = item.mediaType === 'video' && item.video;

            // uploadDate: use real event date or createdAt; omit entirely if unknown
            // (Google tolerates an absent uploadDate better than a false fallback)
            const uploadDate: string | undefined =
                item.eventDate || item.createdAt || undefined;

            if (isVideo) {
                const { contentUrl, embedUrl } = resolveVideoUrls(item.video);

                return {
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@type': 'VideoObject',
                        name: item.title,
                        description: item.description || item.title,
                        // thumbnailUrl must be an array per Google guidelines
                        thumbnailUrl: [item.thumbnail.url],
                        ...(uploadDate && { uploadDate }),
                        ...(item.duration && { duration: item.duration }),
                        ...(contentUrl && { contentUrl }),
                        ...(embedUrl && { embedUrl }),
                        publisher: {
                            '@type': 'Organization',
                            name: 'Casamento Events Management',
                            url: siteUrl,
                            logo: {
                                '@type': 'ImageObject',
                                url: `${siteUrl}/icon.jpg`,
                            },
                        },
                    },
                };
            }

            // VisualArtwork — images
            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'VisualArtwork',
                    name: item.title,
                    description: item.description || item.title,
                    image: item.thumbnail.url,
                    ...(item.eventDate && { dateCreated: item.eventDate }),
                    ...(item.location && { locationCreated: item.location }),
                    creator: {
                        '@type': 'Organization',
                        name: 'Casamento Events Management',
                        url: siteUrl,
                    },
                },
            };
        }),
    };

    // -------------------------------------------------------------------------
    // 2. Build BreadcrumbList schema
    //    /portfolio                  → [Home > Portfolio]
    //    /portfolio/[category]       → [Home > Portfolio > Category]
    // -------------------------------------------------------------------------
    const breadcrumbItems: Array<{
        '@type': string;
        position: number;
        name: string;
        item: string;
    }> = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Portfolio',
            item: `${siteUrl}/portfolio`,
        },
    ];

    if (categorySlug && categoryTitle) {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 3,
            name: categoryTitle,
            item: `${siteUrl}/portfolio/${categorySlug}`,
        });
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
