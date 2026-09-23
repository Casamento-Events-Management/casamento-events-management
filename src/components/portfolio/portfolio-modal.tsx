// =============================================================================
// portfolio-modal.tsx — Interactive Video Lightbox Player & Modal Dialog
//
// Pop-up video player component for displaying Sanity CDN native video streams
// or external YouTube / Vimeo embed links along with full project details.
// =============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Calendar, MapPin, User, Tag, Sparkles, Film, Image as ImageIcon } from 'lucide-react';
import type { PortfolioItem } from '@/types';
import { ShareDropdown } from '@/components/ui/share-dropdown';
import type { SharePayload } from '@/lib/utils/shareUtils';
import { parseVideoSource } from '@/lib/utils/videoUtils';

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

    const sharePayload: SharePayload = {
        title: item.title,
        description: item.description,
        url: `/portfolio/${item.category.slug}?item=${item.slug}`,
        categorySlug: item.category.slug,
        location: item.location,
        clientName: item.clientName,
        hashtags: item.tags,
    };

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
        const parsed = parseVideoSource(item.video);

        if (parsed.sourceType === 'sanity' || parsed.sourceType === 'native') {
            const videoUrl = parsed.directUrl || (item.video?._type === 'sanity' ? item.video.asset?.url : undefined) || '';
            if (!videoUrl) {
                return (
                    <div className="w-full aspect-video flex items-center justify-center bg-[#0C1206] text-[#EFEAD8]/60 text-sm">
                        <span>Video preview unavailable</span>
                    </div>
                );
            }

            return (
                <div className="relative aspect-video w-full bg-[#0C1206]">
                    <video
                        controls
                        autoPlay
                        playsInline
                        poster={item.thumbnail.url}
                        className="w-full h-full object-contain bg-black"
                    >
                        <source src={videoUrl} type={(item.video?._type === 'sanity' ? (item.video as import('@/types').SanityVideoSource).mimeType : undefined) || 'video/mp4'} />
                        Your browser does not support HTML5 video streaming.
                    </video>
                </div>
            );
        }

        if (parsed.sourceType === 'external' && parsed.embedUrl) {
            return (
                <div className="relative aspect-video w-full bg-[#0C1206]">
                    <iframe
                        src={parsed.embedUrl}
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
                <span>Video preview unavailable</span>
            </div>
        );
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
                className="relative z-10 w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-[#141C0C] border border-[#3A4F1C]/40 shadow-2xl text-[#F7F3E8]"
            >
                {/* Header Bar */}
                <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#3A4F1C]/40 bg-[#0C1206]/90 backdrop-blur-md rounded-t-2xl shrink-0">
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

                    {/* Touch-Friendly Action Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Reusable Share Dropdown Component */}
                        <ShareDropdown payload={sharePayload} direction="down" theme="dark" />

                        <button
                            type="button"
                            onClick={onClose}
                            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#EFEAD8]/80 hover:text-[#F7F3E8] hover:bg-[#2A3A14] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] cursor-pointer"
                            aria-label="Close dialog"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Body */}
                <div className="flex-1 overflow-y-auto rounded-b-2xl">
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
                                        <span><strong className="text-[#F7F3E8] font-semibold">{item.clientName}</strong></span>
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
                                        <span>{new Date(item.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
