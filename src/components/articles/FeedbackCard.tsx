'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FeedbackCardProps } from '@/types';

export function FeedbackCard({ feedback }: FeedbackCardProps) {
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

  return (
    <div className="flex flex-col h-full bg-[#EFEAD8]/60 hover:bg-[#EFEAD8] border border-[#3A4F1C]/10 hover:border-[#BC6F07]/30 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300">
      {/* 1. Photo Slot (Admin-uploaded photo or initials avatar) */}
      <div className="flex items-center justify-center mb-5">
        {photoUrl ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#BC6F07] shadow-sm bg-[#1A2310]">
            <Image
              src={photoUrl}
              alt={feedback.photo?.alt || `${feedback.name}'s photo`}
              fill
              className="object-cover object-center"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#3A4F1C] border-2 border-[#BC6F07] text-[#F7F3E8] flex items-center justify-center text-2xl font-serif font-bold shadow-sm">
            {initial}
          </div>
        )}
      </div>

      {/* 2. Rating Slot */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= (feedback.rating || 5)
                ? 'fill-[#BC6F07] text-[#BC6F07]'
                : 'fill-[#3A4F1C]/15 text-transparent'
            }`}
          />
        ))}
      </div>

      {/* 3. Name & Date Slot */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-serif font-semibold text-[#3A4F1C] leading-snug">
          {feedback.name}
        </h3>
        {formattedDate && (
          <span className="text-xs text-[#3A4F1C]/50 block mt-0.5 font-light">
            {formattedDate}
          </span>
        )}
      </div>

      {/* 4. Event Type Badge Slot */}
      <div className="flex justify-center mb-4">
        <Badge
          status="neutral"
          className="text-[10px] py-0.5 px-2.5 font-semibold text-[#3A4F1C]"
        >
          {feedback.eventType}
        </Badge>
      </div>

      {/* 5. Message Slot */}
      <div className="mt-auto pt-2 text-center">
        <blockquote
          className={`text-sm sm:text-base font-serif italic text-[#3A4F1C]/85 leading-relaxed ${
            !isExpanded ? 'line-clamp-4' : ''
          }`}
        >
          &ldquo;{feedback.message}&rdquo;
        </blockquote>

        {feedback.message && feedback.message.length > 180 && (
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
