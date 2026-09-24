'use client';

import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function ShareExperienceTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-12">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs font-semibold tracking-widest uppercase rounded-full shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer mb-3"
        >
          <MessageSquarePlus className="w-4 h-4 text-[#BC6F07] group-hover:scale-110 transition-transform" />
          Share Your Experience
        </button>
        <p className="text-xs sm:text-sm text-[#3A4F1C]/75 font-light leading-relaxed">
          Worked with us? Share your event story to help Casamento.
        </p>
      </div>

      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
