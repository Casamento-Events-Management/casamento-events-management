// =============================================================================
// portfolio-modal.tsx — Interactive Video Lightbox Player & Modal Dialog
//
// Pop-up video player component for displaying Sanity CDN native video streams
// or external YouTube / Vimeo embed links along with full project details.
// =============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Calendar, MapPin, User, Tag, Share2, Sparkles, Film, Image as ImageIcon } from 'lucide-react';
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

    const renderMediaContent = () => {
        // 1. Image Media Showcase
        if (item.mediaType === 'image') {
            return (
                <div className="relative w-full max-h-[60vh] sm:max-h-[70vh] flex items-center justify-center bg-[#0C1206] p-2 sm:p-4">
                    <Image
                        src={item.thumbnail.url}
                        alt={item.thumbnail.alt || item.title}
                        width={item.thumbnail.width || 1200}
                        height={item.thumbnail.height || 900}
                        className="max-h-[55vh] sm:max-h-[65vh] w-auto h-auto object-contain rounded-lg shadow-lg"
                        priority
                    />
                </div>
            );
        }

        // 2. Video Media Showcase
        const videoSource = item.video;
        if (!videoSource) {
            return (
                <div className="w-full aspect-video flex items-center justify-center bg-[#0C1206] text-[#EFEAD8]/60 text-sm">
                    <span>Video preview unavailable</span>
                </div>
            );
        }

        // Native Sanity CDN Video
        if (videoSource._type === 'sanity') {
            return (
                <div className="relative aspect-video w-full bg-[#0C1206]">
                    <video
                        controls
                        autoPlay
                        playsInline
                        poster={item.thumbnail.url}
                        className="w-full h-full object-contain bg-black"
                    >
                        <source src={videoSource.asset.url} type={videoSource.mimeType || 'video/mp4'} />
                        Your browser does not support HTML5 video streaming.
                    </video>
                </div>
            );
        }

        // External Video Embed (YouTube / Vimeo / Cloudflare Stream)
        if (videoSource._type === 'external') {
            let embedUrl = videoSource.url;
            
            // Format YouTube or Vimeo autoplay parameters
            if (videoSource.provider === 'youtube' && !embedUrl.includes('autoplay=')) {
                const separator = embedUrl.includes('?') ? '&' : '?';
                embedUrl = `${embedUrl}${separator}autoplay=1&rel=0`;
            } else if (videoSource.provider === 'vimeo' && !embedUrl.includes('autoplay=')) {
                const separator = embedUrl.includes('?') ? '&' : '?';
                embedUrl = `${embedUrl}${separator}autoplay=1`;
            }

            // Notice: YouTube/Vimeo have built-in native player controls.
            // We do NOT render external custom overlay video controls.
            return (
                <div className="relative aspect-video w-full bg-[#0C1206]">
                    <iframe
                        src={embedUrl}
                        title={item.title}
                        className="w-full h-full border-0 bg-black"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            );
        }

        return (
            <div className="w-full aspect-video flex items-center justify-center bg-[#0C1206] text-[#EFEAD8]/60 text-sm">
                <span>Unsupported media format</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-[#0C1206]/90 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop Click Handler */}
            <div
                className="absolute inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Dialog Container */}
            <div
                ref={dialogRef}
                className="relative z-10 w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-[#141C0C] border border-[#3A4F1C]/40 shadow-2xl overflow-hidden text-[#F7F3E8]"
            >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#3A4F1C]/40 bg-[#0C1206]/80 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-2 truncate pr-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A3A14] border border-[#3A4F1C]/60 text-[#BC6F07] text-xs font-semibold shrink-0">
                            {item.mediaType === 'video' ? (
                                <Film className="w-3.5 h-3.5 text-[#BC6F07]" />
                            ) : (
                                <ImageIcon className="w-3.5 h-3.5 text-[#BC6F07]" />
                            )}
                            {item.category.title}
                        </span>
                        {item.featured && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#BC6F07] font-medium shrink-0">
                                <Sparkles className="w-3.5 h-3.5 fill-current" />
                                <span>Featured Project</span>
                            </span>
                        )}
                    </div>

                    {/* Touch-Friendly Action Buttons (Minimum 44px hit area) */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#EFEAD8]/80 hover:text-[#F7F3E8] hover:bg-[#2A3A14] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07]"
                            aria-label="Share project link"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#EFEAD8]/80 hover:text-[#F7F3E8] hover:bg-[#2A3A14] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07]"
                            aria-label="Close dialog"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Media Display Container */}
                    <div className="w-full bg-black">
                        {renderMediaContent()}
                    </div>

                    {/* Project Metadata Details */}
                    <div className="p-5 sm:p-8 space-y-6">
                        <div>
                            <h2 id="modal-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F7F3E8] tracking-tight leading-tight">
                                {item.title}
                            </h2>

                            {/* Meta Badges Grid/Row */}
                            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-[#EFEAD8]/80">
                                {item.clientName && (
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-[#BC6F07] shrink-0" />
                                        <span>Client: <strong className="text-[#F7F3E8] font-semibold">{item.clientName}</strong></span>
                                    </span>
                                )}
                                {item.location && (
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#BC6F07] shrink-0" />
                                        <span>{item.location}</span>
                                    </span>
                                )}
                                {item.eventDate && (
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#BC6F07] shrink-0" />
                                        <span>{new Date(item.eventDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description Text */}
                        {item.description && (
                            <div className="pt-2 border-t border-[#3A4F1C]/30 text-sm sm:text-base text-[#EFEAD8]/90 leading-relaxed font-sans">
                                <p>{item.description}</p>
                            </div>
                        )}

                        {/* Tag Pills */}
                        {item.tags && item.tags.length > 0 && (
                            <div className="pt-4 border-t border-[#3A4F1C]/30 flex flex-wrap items-center gap-2">
                                <Tag className="w-4 h-4 text-[#BC6F07] mr-1 shrink-0" />
                                {item.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full bg-[#2A3A14]/80 border border-[#3A4F1C]/60 text-[#EFEAD8] text-xs font-medium"
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
