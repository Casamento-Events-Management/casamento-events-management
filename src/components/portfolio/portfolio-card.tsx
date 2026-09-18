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
import { Play, Calendar, MapPin, Tag } from 'lucide-react';
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

    return (
        <article className="group relative flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-xl hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1">
            {/* Card Thumbnail / Poster Container */}
            <button
                type="button"
                onClick={() => onSelect(item)}
                onKeyDown={handleKeyDown}
                className="relative aspect-video w-full overflow-hidden bg-slate-950 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label={`Play video and view details for ${item.title}`}
            >
                {/* Poster Thumbnail Image */}
                <Image
                    src={item.thumbnail.url}
                    alt={item.thumbnail.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={priority}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Category Badge Pill */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-amber-400 text-xs font-semibold tracking-wide">
                        {item.category.title}
                    </span>
                </div>

                {/* Play Button Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300">
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    </div>
                </div>

                {/* Location / Date Bar */}
                {(item.location || item.eventDate) && (
                    <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-slate-300">
                        {item.location && (
                            <span className="flex items-center gap-1 font-medium truncate max-w-[60%]">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="truncate">{item.location}</span>
                            </span>
                        )}
                        {item.eventDate && (
                            <span className="flex items-center gap-1 text-slate-400 ml-auto shrink-0">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </span>
                        )}
                    </div>
                )}
            </button>

            {/* Card Content Footer */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="text-left focus:outline-none"
                    >
                        {item.title}
                    </button>
                </h3>

                {item.description && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                    </p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 mt-auto">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {item.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                        {item.tags.length > 3 && (
                            <span className="text-[11px] text-slate-500 font-medium">
                                +{item.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
