// =============================================================================
// portfolio-modal.tsx — Interactive Video Lightbox Player & Modal Dialog
//
// Pop-up video player component for displaying Sanity CDN native video streams
// or external YouTube / Vimeo embed links along with full project details.
// =============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { X, Calendar, MapPin, User, Tag, Share2, Sparkles } from 'lucide-react';
import type { PortfolioItem } from '@/types';

interface PortfolioModalProps {
    item: PortfolioItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PortfolioModal({ item, isOpen, onClose }: PortfolioModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // ESC key listener & body scroll lock
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    // Resolve Video Embed URL or Source
    const videoSource = item.video;

    const renderVideoPlayer = () => {
        if (videoSource._type === 'sanity') {
            return (
                <video
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                >
                    <source src={videoSource.asset.url} type={videoSource.mimeType || 'video/mp4'} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (videoSource._type === 'external') {
            let embedUrl = videoSource.url;
            
            // Format YouTube or Vimeo embed parameters if missing
            if (videoSource.provider === 'youtube' && !embedUrl.includes('autoplay=')) {
                const separator = embedUrl.includes('?') ? '&' : '?';
                embedUrl = `${embedUrl}${separator}autoplay=1&rel=0`;
            } else if (videoSource.provider === 'vimeo' && !embedUrl.includes('autoplay=')) {
                const separator = embedUrl.includes('?') ? '&' : '?';
                embedUrl = `${embedUrl}${separator}autoplay=1`;
            }

            return (
                <iframe
                    src={embedUrl}
                    title={item.title}
                    className="w-full h-full border-0 bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            );
        }

        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400">
                <span>Video unavailable</span>
            </div>
        );
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: item.title,
                text: item.description,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Portfolio link copied to clipboard!');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/90 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop Overlay Click Handler */}
            <div
                className="absolute inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={dialogRef}
                className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100"
            >
                {/* Header Close Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                            {item.category.title}
                        </span>
                        {item.featured && (
                            <span className="flex items-center gap-1 text-xs text-amber-400">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Featured Project</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            aria-label="Share project link"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            aria-label="Close dialog"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Video Player Container (Aspect 16:9) */}
                    <div className="relative aspect-video w-full bg-black shadow-inner">
                        {renderVideoPlayer()}
                    </div>

                    {/* Project Metadata & Description */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {item.title}
                            </h2>

                            {/* Meta Badges Row */}
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                {item.clientName && (
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-amber-400" />
                                        <span>Client: <strong className="text-slate-200">{item.clientName}</strong></span>
                                    </span>
                                )}
                                {item.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-amber-400" />
                                        <span>{item.location}</span>
                                    </span>
                                )}
                                {item.eventDate && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-amber-400" />
                                        <span>{new Date(item.eventDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description Text */}
                        {item.description && (
                            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                                <p>{item.description}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
                                <Tag className="w-4 h-4 text-slate-400 mr-1" />
                                {item.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
