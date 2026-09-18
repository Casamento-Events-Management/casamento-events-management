// =============================================================================
// portfolio-card.tsx — Portfolio Item Card Component
//
// Complies with Mandatory Video & SEO Policy:
// - Video poster thumbnail is displayed by default for optimal LCP & Core Web Vitals.
// - Videos MUST NOT autoplay on initial page load.
// - Clicking the card triggers the interactive Video Lightbox Modal player.
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
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(item);
        }
    };

    const isVideo = item.mediaType === 'video';

    return (
        <article className="group relative break-inside-avoid mb-6 rounded-2xl bg-[#FFFFFF] border border-[#3A4F1C]/15 overflow-hidden shadow-xs hover:shadow-md hover:border-[#BC6F07]/40 transition-all duration-300 hover:-translate-y-1">
            <button
                type="button"
                onClick={() => onSelect(item)}
                onKeyDown={handleKeyDown}
                className="relative block w-full text-left overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3E8]"
                aria-label={`Open modal and view details for ${item.title}`}
            >
                {/* Category Badge Pill — Top Left floating position */}
                <div className="absolute top-3 left-3 z-20">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#2A3A14]/85 backdrop-blur-md border border-[#F7F3E8]/20 text-[#F7F3E8] text-xs font-medium tracking-wide shadow-xs">
                        {item.category.title}
                    </span>
                </div>

                {/* Main Media Image (Natural Aspect Ratio preservation in Masonry) */}
                <div className="relative w-full overflow-hidden bg-[#EFEAD8]">
                    <Image
                        src={item.thumbnail.url}
                        alt={item.thumbnail.alt || item.title}
                        width={item.thumbnail.width || 800}
                        height={item.thumbnail.height || 600}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={priority}
                        className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Subtle Overlay Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A3A14]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" />

                    {/* Interactive Play or Zoom Icon Badge */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-[#BC6F07]/90 text-[#F7F3E8] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            {isVideo ? (
                                <Play className="w-5 h-5 fill-current translate-x-0.5" />
                            ) : (
                                <Maximize2 className="w-5 h-5" />
                            )}
                        </div>
                    </div>
                </div>
            </button>
        </article>
    );
}
