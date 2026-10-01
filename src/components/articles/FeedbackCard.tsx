'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FeedbackCardProps } from '@/types';

export function FeedbackCard({ feedback, compact = false }: FeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const photoUrl = feedback.photo?.asset?.url;
  const bgImageUrl = feedback.backgroundImage?.asset?.url;
  const initial = feedback.name ? feedback.name.charAt(0).toUpperCase() : 'C';

  const formattedDate = feedback.submittedAt
    ? new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(feedback.submittedAt))
    : null;

  // Reduced profile pic size
  const photoSizeClass = compact ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
  const starSizeClass = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const paddingClass = compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6';

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

  // --- CARD VARIANT 1: Background Image Header (Top 40% / Bottom 60%) ---
  if (bgImageUrl) {
    return (
      <div
        className="flex flex-col h-full bg-[#EFEAD8]/60 hover:bg-[#EFEAD8] border border-[#3A4F1C]/10 hover:border-[#BC6F07]/30 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
      >
        {/* Top 40%: Background Image Header Zone */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-[#1A2310] shrink-0">
          <Image
            src={bgImageUrl}
            alt={feedback.backgroundImage?.alt || `${feedback.name}'s background`}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Legibility Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Overlaid Profile Pic & Star Rating */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 z-10">
            {renderProfilePic(photoSizeClass)}
            <div className="bg-[#1A2310]/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 shadow-xs">
              {renderStars(starSizeClass)}
            </div>
          </div>
        </div>

        {/* Bottom 60%: Content Zone */}
        <div className={`flex flex-col flex-1 ${paddingClass}`}>
          {/* Name & Date */}
          <div className="mb-2">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-[#3A4F1C] leading-snug">
              {feedback.name}
            </h3>
            {formattedDate && (
              <span className="text-[11px] text-[#3A4F1C]/50 block mt-0.5 font-light">
                {formattedDate}
              </span>
            )}
          </div>

          {/* Event Type Badge */}
          <div className="flex justify-start mb-3">
            <Badge
              status="neutral"
              className="text-[10px] py-0.5 px-2.5 font-semibold text-[#3A4F1C]"
            >
              {feedback.eventType}
            </Badge>
          </div>

          {/* Message Block */}
          <div className="mt-auto pt-1">
            <blockquote
              className={`text-xs sm:text-sm font-serif italic text-[#3A4F1C]/85 leading-relaxed ${
                compact ? 'line-clamp-3' : !isExpanded ? 'line-clamp-4' : ''
              }`}
            >
              &ldquo;{feedback.message}&rdquo;
            </blockquote>

            {!compact && feedback.message && feedback.message.length > 180 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-xs font-semibold text-[#BC6F07] hover:underline focus:outline-none transition-colors"
              >
                {isExpanded ? 'Show Less' : 'Read Full Feedback'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- CARD VARIANT 2: Standard Card Layout (No Background Image) ---
  return (
    <div
      className={`flex flex-col h-full bg-[#EFEAD8]/60 hover:bg-[#EFEAD8] border border-[#3A4F1C]/10 hover:border-[#BC6F07]/30 rounded-2xl ${paddingClass} shadow-xs hover:shadow-md transition-all duration-300`}
    >
      {/* 1. Reduced Profile Pic */}
      <div className="flex items-center justify-center mb-3 sm:mb-4">
        {renderProfilePic(photoSizeClass)}
      </div>

      {/* 2. Rating Slot */}
      <div className="flex items-center justify-center mb-3">
        {renderStars(starSizeClass)}
      </div>

      {/* 3. Name & Date Slot */}
      <div className="text-center mb-2.5">
        <h3 className="text-base sm:text-lg font-serif font-semibold text-[#3A4F1C] leading-snug">
          {feedback.name}
        </h3>
        {formattedDate && (
          <span className="text-[11px] text-[#3A4F1C]/50 block mt-0.5 font-light">
            {formattedDate}
          </span>
        )}
      </div>

      {/* 4. Event Type Badge Slot */}
      <div className="flex justify-center mb-3">
        <Badge
          status="neutral"
          className="text-[10px] py-0.5 px-2.5 font-semibold text-[#3A4F1C]"
        >
          {feedback.eventType}
        </Badge>
      </div>

      {/* 5. Message Slot */}
      <div className="mt-auto pt-1 text-center">
        <blockquote
          className={`text-xs sm:text-sm font-serif italic text-[#3A4F1C]/85 leading-relaxed ${
            compact ? 'line-clamp-3' : !isExpanded ? 'line-clamp-4' : ''
          }`}
        >
          &ldquo;{feedback.message}&rdquo;
        </blockquote>

        {!compact && feedback.message && feedback.message.length > 180 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-xs font-semibold text-[#BC6F07] hover:underline focus:underline focus:outline-none transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Read Full Feedback'}
          </button>
        )}
      </div>
    </div>
  );
}

