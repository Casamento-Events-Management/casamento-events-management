// =============================================================================
// portfolio-card.tsx — Portfolio Item Tile Component
//
// Complies with Mandatory Video & SEO Policy:
// - Video poster thumbnail is displayed by default for optimal LCP & Core Web Vitals.
// - Videos MUST NOT autoplay on initial page load.
// - Clicking the tile triggers the interactive Media Lightbox Modal player.
// - Zero hover zoom/float (pointer cursor + subtle border/overlay feedback only).
// =============================================================================

'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Maximize2 } from 'lucide-react';
import type { PortfolioItem } from '@/types';

interface PortfolioCardProps {
    item: PortfolioItem;
    onSelect: (item: PortfolioItem) => void;
    priority?: boolean;
}

export function PortfolioCard({ item, onSelect, priority = false }: PortfolioCardProps) {
    const isVideo = item.mediaType === 'video';

    return (
        <article className="group relative inline-block w-full align-top break-inside-avoid mb-3 sm:mb-6 rounded-xl sm:rounded-2xl bg-[#FFFFFF] border border-[#3A4F1C]/15 overflow-clip shadow-xs hover:shadow-md hover:border-[#BC6F07]/40 transition-colors duration-200">
            <button
                type="button"
                onClick={() => onSelect(item)}
                className="relative block w-full text-left overflow-clip cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3E8]"
                aria-label={`Open modal and view details for ${item.title}`}
            >
                {/* Main Media Image (Natural Aspect Ratio preservation in Masonry — zero hover zoom) */}
                <div className="relative w-full overflow-clip bg-[#EFEAD8]">
                    <Image
                        src={item.thumbnail.url}
                        alt={item.thumbnail.alt || item.title}
                        width={item.thumbnail.width || 800}
                        height={item.thumbnail.height || 600}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        priority={priority}
                        className="block w-full h-auto object-cover"
                    />

                    {/* Subtle Overlay Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A3A14]/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    {/* Interactive Play or Expand Icon Badge (no scale zoom) */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#BC6F07]/90 text-[#F7F3E8] flex items-center justify-center shadow-md">
                            {isVideo ? (
                                <Play className="w-4 h-4 fill-current translate-x-0.5" strokeWidth={1.75} aria-hidden="true" />
                            ) : (
                                <Maximize2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                            )}
                        </div>
                    </div>
                </div>
            </button>
        </article>
    );
}
