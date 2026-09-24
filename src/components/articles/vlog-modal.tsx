'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Calendar, Clock, Film, Sparkles, ArrowRight } from 'lucide-react';
import type { ArticleVlogItem } from '@/types';
import { ShareDropdown } from '@/components/ui/share-dropdown';
import { SocialIcon } from '@/components/ui/social-icon';
import { parseVideoSource } from '@/lib/utils/videoUtils';

interface VlogModalProps {
  item: ArticleVlogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VlogModal({ item, isOpen, onClose }: VlogModalProps) {
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

  const sharePayload = {
    title: item.title,
    url: `/articles/vlogs/${item.slug.current}`,
    description: item.description ?? item.summary,
    categorySlug: item.category?.slug,
  };

  const publishedDate = item.publishedAt
    ? new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(item.publishedAt))
    : null;

  const renderMediaContent = () => {
    const thumbnailUrl = item.thumbnail?.asset?.url;

    // Video Media Showcase
    if (item.mediaType === 'video' && item.videoSource) {
      const parsed = parseVideoSource(item.videoSource);

      if (parsed.sourceType === 'sanity' || parsed.sourceType === 'native') {
        const videoUrl = parsed.directUrl || '';
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
              poster={thumbnailUrl}
              className="w-full h-full object-contain bg-black"
            >
              <source src={videoUrl} type="video/mp4" />
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
    }

    // Image Fallback / Thumbnail Showcase
    if (thumbnailUrl) {
      return (
        <div className="relative w-full aspect-video flex items-center justify-center bg-[#0C1206]">
          <Image
            src={thumbnailUrl}
            alt={item.thumbnail.alt || item.title}
            fill
            className="object-contain bg-black"
            priority
          />
        </div>
      );
    }

    return (
      <div className="w-full aspect-video flex items-center justify-center bg-[#0C1206] text-[#EFEAD8]/60 text-sm">
        <span>Media preview unavailable</span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-[#0C1206]/90 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vlog-modal-title"
    >
      {/* Backdrop Click Handler */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Container */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-[#141C0C] border border-[#3A4F1C]/40 shadow-2xl text-[#F7F3E8]"
      >
        {/* Header Bar */}
        <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#3A4F1C]/40 bg-[#0C1206]/90 backdrop-blur-md rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2 truncate pr-2">
            {item.category?.title && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A3A14] border border-[#3A4F1C]/60 text-[#BC6F07] text-xs font-semibold shrink-0 uppercase tracking-wider">
                <Film className="w-3.5 h-3.5 text-[#BC6F07]" />
                {item.category.title}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#BC6F07] font-medium shrink-0">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Editorial Journal</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto rounded-b-2xl">
          {/* Media Player Container */}
          <div className="w-full bg-black">{renderMediaContent()}</div>

          {/* Metadata Stack */}
          <div className="p-5 sm:p-8 space-y-6">
            <div>
              <h2
                id="vlog-modal-title"
                className="text-xl sm:text-2xl md:text-3xl font-serif text-[#F7F3E8] font-medium tracking-tight leading-tight"
              >
                {item.title}
              </h2>

              {/* Date & Duration Row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#EFEAD8]/80">
                {publishedDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#BC6F07] shrink-0" />
                    <span>{publishedDate}</span>
                  </span>
                )}
                {item.mediaType === 'video' && item.videoDuration && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#BC6F07] shrink-0" />
                    <span>{item.videoDuration} duration</span>
                  </span>
                )}
                {item.mediaType === 'image' && item.readTime && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#BC6F07] shrink-0" />
                    <span>{item.readTime} read</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="pt-2 border-t border-[#3A4F1C]/30 text-sm text-[#EFEAD8]/80 leading-relaxed font-sans">
                <p>{item.description}</p>
              </div>
            )}

            {/* Bottom Row: Social Backlinks + Read More CTA */}
            <div className="pt-4 border-t border-[#3A4F1C]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Social Backlinks */}
              {item.socialBacklinks && item.socialBacklinks.length > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#EFEAD8]/60 font-light">Also on:</span>
                  {item.socialBacklinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#EFEAD8]/70 hover:text-[#BC6F07] transition-colors p-1"
                      aria-label={`View on ${link.platform}`}
                    >
                      <SocialIcon platform={link.platform} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              ) : (
                <div />
              )}

              {/* Read More Redirect Button */}
              <Link
                href={`/articles/vlogs/${item.slug.current}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC6F07] text-[#141C0C] font-semibold text-xs uppercase tracking-wider hover:bg-[#d8830f] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] cursor-pointer"
              >
                <span>Read More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
