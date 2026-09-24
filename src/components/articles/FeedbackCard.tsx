'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FeedbackCardProps } from '@/types';

export function FeedbackCard({ feedback, compact = false }: FeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const photoUrl = feedback.photo?.asset?.url;
  const initial = feedback.name ? feedback.name.charAt(0).toUpperCase() : 'C';

  const formattedDate = feedback.submittedAt
    ? new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(feedback.submittedAt))
    : null;

  const photoSizeClass = compact ? 'w-14 h-14 text-xl' : 'w-20 h-20 text-2xl';
  const starSizeClass = compact ? 'w-4 h-4' : 'w-5 h-5';
  const paddingClass = compact ? 'p-4 sm:p-5' : 'p-6 sm:p-7';

  return (
    <div
      className={`flex flex-col h-full bg-[#EFEAD8]/60 hover:bg-[#EFEAD8] border border-[#3A4F1C]/10 hover:border-[#BC6F07]/30 rounded-2xl ${paddingClass} shadow-xs hover:shadow-md transition-all duration-300`}
    >
      {/* 1. Photo Slot (Admin-uploaded photo or initials avatar) */}
      <div className="flex items-center justify-center mb-3 sm:mb-4">
        {photoUrl ? (
          <div
            className={`relative ${photoSizeClass} rounded-full overflow-hidden border-2 border-[#BC6F07] shadow-sm bg-[#1A2310]`}
          >
            <Image
              src={photoUrl}
              alt={feedback.photo?.alt || `${feedback.name}'s photo`}
              fill
              className="object-cover object-center"
              sizes={compact ? '56px' : '80px'}
            />
          </div>
        ) : (
          <div
            className={`${photoSizeClass} rounded-full bg-[#3A4F1C] border-2 border-[#BC6F07] text-[#F7F3E8] flex items-center justify-center font-serif font-bold shadow-sm`}
          >
            {initial}
          </div>
        )}
      </div>

      {/* 2. Rating Slot */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizeClass} ${
              star <= (feedback.rating || 5)
                ? 'fill-[#BC6F07] text-[#BC6F07]'
                : 'fill-[#3A4F1C]/15 text-transparent'
            }`}
          />
        ))}
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
            className="mt-3 text-xs font-semibold text-[#BC6F07] hover:underline focus:outline-none transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Read Full Feedback'}
          </button>
        )}
      </div>
    </div>
  );
}
