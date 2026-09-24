'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { FeedbackFormProps } from '@/types';


export function FeedbackForm({ onSuccess, onCancel }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Luxury Wedding',
    rating: 5,
    message: '',
  });

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let recaptchaToken = '';

      // Execute Google reCAPTCHA v3 if available on window
      if (typeof window !== 'undefined' && (window as unknown as { grecaptcha?: { execute?: (key: string, options: { action: string }) => Promise<string> } }).grecaptcha?.execute) {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (siteKey) {
          recaptchaToken = await (window as unknown as { grecaptcha: { execute: (key: string, options: { action: string }) => Promise<string> } }).grecaptcha.execute(siteKey, {
            action: 'feedback_submit',
          });
        }
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'feedback_submit',
          ...formData,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback. Please try again.');
      }

      setIsSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-10 px-6 bg-[#F7F3E8] rounded-2xl border border-[#3A4F1C]/15">
        <div className="w-16 h-16 bg-[#3A4F1C]/10 text-[#3A4F1C] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-[#BC6F07]" />
        </div>
        <h3 className="text-2xl font-serif font-semibold text-[#3A4F1C] mb-2">
          Feedback Submitted!
        </h3>
        <p className="text-sm text-[#3A4F1C]/80 max-w-md mx-auto leading-relaxed">
          Thank you for sharing your experience with Casamento Events! Your feedback has been sent to our team and is pending review before appearing on our website.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>{submitError}</div>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-2">
          Your Name <span className="text-[#BC6F07]">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Maria & Juan dela Cruz"
          className="w-full px-4 py-3 bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl text-sm text-[#3A4F1C] placeholder-[#3A4F1C]/40 focus:outline-none focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] transition-all"
        />
      </div>

      {/* Email & Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-2">
            Email Address <span className="text-[#BC6F07]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full px-4 py-3 bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl text-sm text-[#3A4F1C] placeholder-[#3A4F1C]/40 focus:outline-none focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] transition-all"
          />
          <span className="text-[10px] text-[#3A4F1C]/50 mt-1 block">
            Used for approval notifications only. Never displayed publicly.
          </span>
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-2">
            Contact Number <span className="text-[#3A4F1C]/40 font-normal">(Optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+63 917 123 4567"
            className="w-full px-4 py-3 bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl text-sm text-[#3A4F1C] placeholder-[#3A4F1C]/40 focus:outline-none focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] transition-all"
          />
        </div>
      </div>

      {/* Event Type */}
      <div>
        <label htmlFor="eventType" className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-2">
          Event Type <span className="text-[#BC6F07]">*</span>
        </label>
        <input
          type="text"
          id="eventType"
          name="eventType"
          required
          value={formData.eventType}
          onChange={handleChange}
          placeholder="e.g. Luxury Wedding, 18th Debut, Corporate Event"
          className="w-full px-4 py-2.5 bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl text-xs text-[#3A4F1C] placeholder-[#3A4F1C]/40 focus:outline-none focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] transition-all"
        />
      </div>

      {/* Star Rating Picker */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-2">
          Overall Rating <span className="text-[#BC6F07]">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoveredStar !== null ? hoveredStar : formData.rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => setFormData((prev) => ({ ...prev, rating: star as 1|2|3|4|5 }))}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <Star
                  className={`w-8 h-8 ${
                    isFilled ? 'fill-[#BC6F07] text-[#BC6F07]' : 'fill-transparent text-[#3A4F1C]/30'
                  }`}
                />
              </button>
            );
          })}
          <span className="ml-2 text-xs font-semibold text-[#3A4F1C]/70">
            {formData.rating} / 5 Stars
          </span>
        </div>
      </div>

      {/* Message Textarea */}
      <div>
        <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-2">
          Your Feedback Message <span className="text-[#BC6F07]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your experience working with the Casamento Events team..."
          className="w-full px-4 py-3 bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-xl text-sm text-[#3A4F1C] placeholder-[#3A4F1C]/40 focus:outline-none focus:border-[#BC6F07] focus:ring-1 focus:ring-[#BC6F07] transition-all resize-y"
        />
      </div>

      {/* Data Privacy Disclaimer */}
      <div className="flex items-start gap-2.5 px-3.5 text-[11px] text-[#3A4F1C]/80 font-light leading-relaxed">
        <p>
          <strong className="font-semibold text-[#3A4F1C]">Data Privacy Notice:</strong> Your email and phone number are used strictly for administrative verification and will <strong className="font-semibold text-[#3A4F1C]">never</strong> be published or shared. Only your name, event type, star rating, and message are displayed publicly upon team approval.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#3A4F1C]/70 hover:text-[#3A4F1C] hover:bg-[#3A4F1C]/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-7 py-3 bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs font-semibold tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#BC6F07]" />
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </button>
      </div>
    </form>
  );
}
