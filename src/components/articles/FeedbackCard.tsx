'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { urlFor } from '@/sanity/lib/image';
import type { FeedbackCardProps } from '@/types';

/** Safe helper to resolve image URL from projected GROQ object, string, or Sanity reference */
function resolveImageUrl(imageObj?: unknown): string | null {
  if (!imageObj) return null;
  if (typeof imageObj === 'string') return imageObj;

  const obj = imageObj as { asset?: { url?: string; _ref?: string }; _ref?: string };

  // Prefer the directly-projected CDN URL (asset->url in GROQ)
  if (obj.asset?.url) return obj.asset.url;

  // Fallback: use @sanity/image-url builder with the asset reference
  if (obj.asset?._ref || obj._ref) {
    try {
      return urlFor(obj as Parameters<typeof urlFor>[0]).url();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * FeedbackCard
 *
 * Unified layout — ALL cards use the 40% image header / 60% content split.
 * - When a backgroundImage is present: renders the real photo.
 * - When no backgroundImage: renders a decorative linen-pattern placeholder so
 *   the layout remains identical across all cards.
 *
 * Read More / Show Less actually collapses/expands the message area.
 */
export function FeedbackCard({ feedback, compact = false }: FeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const photoUrl = resolveImageUrl(feedback.photo);
  const bgImageUrl = resolveImageUrl(feedback.backgroundImage);
  const initial = feedback.name ? feedback.name.charAt(0).toUpperCase() : 'C';

  const formattedDate = feedback.submittedAt
    ? new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(feedback.submittedAt))
    : null;

  // Fixed card height — same for all cards
  const fixedCardHeightClass = compact ? 'h-[380px] sm:h-[390px]' : 'h-[440px] sm:h-[450px]';

  // Profile pic size
  const photoSizeClass = compact ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
  const starSizeClass = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const paddingClass = compact ? 'px-4 pb-4 pt-3 sm:px-5 sm:pb-5' : 'px-5 pb-5 pt-4 sm:px-6 sm:pb-6';

  // Message is "long" if > 130 chars — enables the Read More toggle
  const isLongMessage = feedback.message && feedback.message.length > 130;

  const renderStars = (starClass: string) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starClass} ${
            star <= (feedback.rating || 5)
              ? 'fill-[#BC6F07] text-[#BC6F07]'
              : 'fill-[#3A4F1C]/15 text-transparent'
          }`}
        />
      ))}
    </div>
  );

  const renderProfilePic = (sizeClass: string) =>
    photoUrl ? (
      <div
        className={`relative ${sizeClass} rounded-full overflow-hidden border-2 border-[#BC6F07] shadow-sm bg-[#1A2310] shrink-0`}
      >
        <Image
          src={photoUrl}
          alt={feedback.photo?.alt || `${feedback.name}'s photo`}
          fill
          className="object-cover object-center"
          sizes={compact ? '40px' : '48px'}
        />
      </div>
    ) : (
      <div
        className={`${sizeClass} rounded-full bg-[#3A4F1C] border-2 border-[#BC6F07] text-[#F7F3E8] flex items-center justify-center font-serif font-bold shadow-sm shrink-0`}
      >
        {initial}
      </div>
    );

  return (
    <div
      className={`flex flex-col ${fixedCardHeightClass} w-full bg-[#EFEAD8]/60 hover:bg-[#EFEAD8] border border-[#3A4F1C]/10 hover:border-[#BC6F07]/30 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300`}
    >
      {/* ── Top 40%: Image Header Zone ── */}
      <div className="relative h-[40%] min-h-[140px] w-full overflow-hidden shrink-0 border-b border-[#3A4F1C]/15">
        {bgImageUrl ? (
          <>
            <Image
              src={bgImageUrl}
              alt={feedback.backgroundImage?.alt || `${feedback.name}'s background`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Legibility gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          </>
        ) : (
          /* No-image fallback — transparent, no background colour */
          null
        )}

        {/* Profile Pic + Star Rating — anchored to bottom of the top zone */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 z-10">
          {renderProfilePic(photoSizeClass)}
          <div className={`px-2.5 py-1 rounded-full border shadow-xs ${
            bgImageUrl
              ? 'bg-[#1A2310]/80 backdrop-blur-xs border-white/10'
              : 'bg-[#EFEAD8]/80 backdrop-blur-xs border-[#3A4F1C]/15'
          }`}>
            {renderStars(starSizeClass)}
          </div>
        </div>
      </div>

      {/* ── Bottom 60%: Content Zone ── */}
      <div className={`flex flex-col flex-1 min-h-0 ${paddingClass} overflow-hidden`}>
        {/* Header Metadata: Name, Date, Event Type Badge */}
        <div className="shrink-0 mb-2">
          <h3 className="text-base sm:text-lg font-serif font-semibold text-[#3A4F1C] leading-snug truncate">
            {feedback.name}
          </h3>
          {formattedDate && (
            <span className="text-[11px] text-[#3A4F1C]/50 block mt-0.5 font-light">
              {formattedDate}
            </span>
          )}
          <div className="mt-2">
            <Badge
              status="neutral"
              className="text-[10px] py-0.5 px-2.5 font-semibold text-[#3A4F1C]"
            >
              {feedback.eventType}
            </Badge>
          </div>
        </div>

        {/* Scrollable Message Box */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-1 relative">
          <blockquote
            className={`flex-1 min-h-0 pr-1 text-xs sm:text-sm font-serif italic text-[#3A4F1C]/85 leading-relaxed transition-all duration-300 ${
              isLongMessage && !isExpanded
                ? 'overflow-hidden line-clamp-4'
                : 'overflow-y-auto'
            }`}
          >
            &ldquo;{feedback.message}&rdquo;
          </blockquote>

          {/* Read More / Show Less — only shown when message is long */}
          {isLongMessage && (
            <div className="shrink-0 pt-1.5">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-[#BC6F07] hover:underline focus:underline focus:outline-none transition-colors cursor-pointer"
              >
                {isExpanded ? 'Show Less' : 'Read More...'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
