'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquarePlus, ArrowRight, Star } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { FeedbackSlider } from '@/components/articles/FeedbackSlider';
import { FeedbackModal } from '@/components/articles/FeedbackModal';
import type { FeedbackSectionProps } from '@/types';

export function FeedbackSection({ feedbacks, totalCount }: FeedbackSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const countDisplay = totalCount || feedbacks?.length || 0;

  return (
    <section className="py-16 sm:py-24 bg-[#F7F3E8] border-t border-[#3A4F1C]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Section Heading */}
        <SectionHeading
          eyebrow="CLIENT EXPERIENCES"
          title="What Our Clients Say"
          description="Real stories, honest reviews, and unforgettable memories from yours."
          theme="light"
        />

        {/* 2. Sub-Hero Rating Display (Centered below section heading) */}
        <div className="flex items-center justify-center gap-2 mb-10 text-center -mt-4 sm:-mt-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 sm:w-5 h-4 sm:h-5 fill-[#BC6F07] text-[#BC6F07]" />
            ))}
          </div>
          <span className="text-sm sm:text-base font-serif font-semibold text-[#3A4F1C]">
            5.0 Rating out of {countDisplay} feedbacks
          </span>
        </div>

        {/* 3. Feedback Slider (Full-size feedback cards, 3 per row on desktop) */}
        <div className="mb-12">
          <FeedbackSlider feedbacks={feedbacks} compact={false} />
        </div>

        {/* 4. Bottom Center Actions Block */}
        <div className="mt-12 text-center flex flex-col items-center gap-3.5 max-w-xl mx-auto">
          {/* Share Your Experience Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs font-semibold tracking-widest uppercase rounded-full shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#BC6F07] group-hover:scale-110 transition-transform" />
            Share Your Experience
          </button>

          {/* Feedback Prompt (placed directly below Share Your Experience button) */}
          <p className="text-xs sm:text-sm text-[#3A4F1C]/75 font-light leading-relaxed">
            Worked with us? Share your event story to help Casamento.
          </p>

          {/* Read More Client Stories Link (strictly no count) */}
          <Link
            href="/articles/feedback"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#3A4F1C] hover:text-[#BC6F07] transition-colors group mt-1"
          >
            Read More Client Stories
            <ArrowRight className="w-3.5 h-3.5 text-[#BC6F07] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Submission Modal */}
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
