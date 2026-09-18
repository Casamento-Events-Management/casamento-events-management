// =============================================================================
// portfolio-json-ld.tsx — Structured Data Component for Video SEO
//
// Injects schema.org/ItemList and schema.org/VideoObject JSON-LD snippets into the page.
// Enables Google Video Rich Snippets in search results for all portfolio films.
// =============================================================================

import React from 'react';
import type { PortfolioItem } from '@/types';

interface PortfolioJsonLdProps {
    items: PortfolioItem[];
    siteUrl?: string;
}

export function PortfolioJsonLd({
    items,
    siteUrl = 'https://casamentoevents.com',
}: PortfolioJsonLdProps) {
    if (!items || items.length === 0) return null;

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => {
            if (item.mediaType === 'video' && item.video) {
                const videoUrl = item.video._type === 'external'
                    ? item.video.url
                    : item.video.asset.url;

                return {
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@type': 'VideoObject',
                        name: item.title,
                        description: item.description || item.title,
                        thumbnailUrl: [item.thumbnail.url],
                        uploadDate: item.eventDate || item.createdAt || '2025-01-01',
                        contentUrl: videoUrl,
                        embedUrl: videoUrl,
                        publisher: {
                            '@type': 'Organization',
                            name: 'Casamento Events Management',
                            url: siteUrl,
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
                    description: item.description || item.title,
                    image: item.thumbnail.url,
                    dateCreated: item.eventDate || item.createdAt || '2025-01-01',
                    creator: {
                        '@type': 'Organization',
                        name: 'Casamento Events Management',
                        url: siteUrl,
                    },
                },
            };
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
    );
}
