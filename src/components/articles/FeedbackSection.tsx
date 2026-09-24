'use client';

import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { FeedbackCard } from '@/components/articles/FeedbackCard';
import { FeedbackModal } from '@/components/articles/FeedbackModal';
import type { FeedbackSectionProps } from '@/types';

export function FeedbackSection({ feedbacks }: FeedbackSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-16 sm:py-24 bg-[#F7F3E8] border-t border-[#3A4F1C]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading — Reuses existing UI primitive */}
        <SectionHeading
          eyebrow="CLIENT EXPERIENCES"
          title="What Our Clients Say"
          description="Real stories, honest reviews, and unforgettable memories from our couples and event hosts."
          theme="light"
        />

        {/* Feedback Cards Grid */}
        {feedbacks && feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {feedbacks.map((item, index) => (
              <FeedbackCard key={item._id} feedback={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-[#EFEAD8]/50 rounded-2xl border border-[#3A4F1C]/10 max-w-xl mx-auto mb-12">
            <p className="text-base text-[#3A4F1C]/70 font-light italic">
              Be the first to share your event story with Casamento Events!
            </p>
          </div>
        )}

        {/* Action Row */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs font-semibold tracking-widest uppercase rounded-full shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#BC6F07] group-hover:scale-110 transition-transform" />
            Share Your Experience
          </button>
        </div>
      </div>

      {/* Submission Modal */}
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
