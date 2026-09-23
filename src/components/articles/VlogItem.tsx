'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { VlogItemProps } from '@/types';
import { SocialIcon } from '@/components/ui/social-icon';
import { ShareDropdown } from '@/components/ui/share-dropdown';

export function VlogItem({ item, onPlayVideo }: VlogItemProps) {
  const thumbnailUrl = item.thumbnail?.asset?.url;
  const isVideo = item.mediaType === 'video';

  const sharePayload = {
    title: item.title,
    url: `/articles/vlogs/${item.slug.current}`,
    description: item.description ?? item.summary,
    categorySlug: item.category?.slug,
  };

  const publishedDate = item.publishedAt
    ? new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(item.publishedAt)
      )
    : null;

  return (
    <article className="group flex flex-col">
      {/* ── Thumbnail ──────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-md bg-[#1A2310] aspect-video cursor-pointer"
        onClick={() => isVideo && onPlayVideo?.(item)}
        role={isVideo ? 'button' : undefined}
        tabIndex={isVideo ? 0 : undefined}
        aria-label={isVideo ? `Play ${item.title}` : undefined}
        onKeyDown={(e) => isVideo && e.key === 'Enter' && onPlayVideo?.(item)}
      >
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={item.thumbnail.alt || item.title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* Play overlay — video items only */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/30">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* ── Content Stack ──────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-1.5">
        {/* Category */}
        {item.category?.title && (
          <span className="text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
            {item.category.title}
          </span>
        )}

        {/* Title */}
        <Link
          href={`/articles/vlogs/${item.slug.current}`}
          className="group/title"
        >
          <h3 className="text-lg sm:text-xl font-serif text-[#3A4F1C] font-medium leading-snug group-hover/title:text-[#BC6F07] transition-colors duration-200">
            {item.title}
          </h3>
        </Link>

        {/* Metadata row (date + duration/readtime) */}
        <div className="flex items-center gap-3 text-xs text-[#3A4F1C]/50 font-light">
          {publishedDate && <span>{publishedDate}</span>}
          {isVideo && item.videoDuration && (
            <span className="before:content-['·'] before:mr-3">{item.videoDuration}</span>
          )}
          {!isVideo && item.readTime && (
            <span className="before:content-['·'] before:mr-3">{item.readTime}</span>
          )}
        </div>

        {/* Summary */}
        {item.summary && (
          <p className="text-sm text-[#3A4F1C]/80 font-light leading-relaxed line-clamp-2">
            {item.summary}
          </p>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-sm text-[#3A4F1C]/65 font-light leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}

        {/* ── Action Row ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3A4F1C]/10">
          {/* Social Backlinks */}
          <div className="flex items-center gap-2.5">
            {item.socialBacklinks?.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View on ${link.platform}`}
                className="text-[#3A4F1C]/50 hover:text-[#BC6F07] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] rounded"
              >
                <SocialIcon platform={link.platform} className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* Share + Read More */}
          <div className="flex items-center gap-3">
            <ShareDropdown payload={sharePayload} align="right" />
            <Link
              href={`/articles/vlogs/${item.slug.current}`}
              className="text-sm text-[#3A4F1C]/70 hover:text-[#BC6F07] underline underline-offset-4 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] rounded"
            >
              Read More →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
