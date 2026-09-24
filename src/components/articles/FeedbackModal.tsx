'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
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

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl bg-[#F7F3E8] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#3A4F1C]/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#3A4F1C]/60 hover:text-[#3A4F1C] hover:bg-[#3A4F1C]/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase block mb-1">
            CLIENT FEEDBACK
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3A4F1C]">
            Share Your Experience
          </h2>
          <p className="text-sm text-[#3A4F1C]/75 font-light mt-1">
            We value your honest review! Fill out the form below to share your story with Casamento Events.
          </p>
        </div>

        {/* Form Body */}
        <FeedbackForm onSuccess={onClose} onCancel={onClose} />
      </div>
    </div>
  );
}
