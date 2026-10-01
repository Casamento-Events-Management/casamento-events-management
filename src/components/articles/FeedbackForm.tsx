'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, AlertCircle, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import type { FeedbackFormProps, FeedbackUploadResult } from '@/types';
import { FILE_CONSTRAINTS } from '@/lib/schemas/feedback';

export function FeedbackForm({ onSuccess, onCancel }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    rating: 5,
    message: '',
  });

  // Profile Photo Upload State
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoAssetRef, setPhotoAssetRef] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Card Background Image Upload State
  const [bgPreviewUrl, setBgPreviewUrl] = useState<string | null>(null);
  const [bgAssetRef, setBgAssetRef] = useState<string | null>(null);
  const [bgUploading, setBgUploading] = useState(false);
  const [bgError, setBgError] = useState<string | null>(null);

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

  /** Helper to trigger Google reCAPTCHA v3 if available */
  const getRecaptchaToken = async (): Promise<string> => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { grecaptcha?: { execute?: (key: string, options: { action: string }) => Promise<string> } }).grecaptcha?.execute
    ) {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey) {
        return await (window as unknown as { grecaptcha: { execute: (key: string, options: { action: string }) => Promise<string> } }).grecaptcha.execute(siteKey, {
          action: 'feedback_submit',
        });
      }
    }
    return '';
  };

  /** Upload an asset eagerly to POST /api/feedback/upload */
  const handleFileUpload = async (
    file: File,
    uploadType: 'photo' | 'backgroundImage'
  ) => {
    const isPhoto = uploadType === 'photo';
    const setError = isPhoto ? setPhotoError : setBgError;
    const setUploading = isPhoto ? setPhotoUploading : setBgUploading;
    const setAssetRef = isPhoto ? setPhotoAssetRef : setBgAssetRef;
    const setPreviewUrl = isPhoto ? setPhotoPreviewUrl : setBgPreviewUrl;

    setError(null);
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const recaptchaToken = await getRecaptchaToken();
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('uploadType', uploadType);
      if (recaptchaToken) uploadFormData.append('recaptchaToken', recaptchaToken);

      const response = await fetch('/api/feedback/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = (await response.json()) as FeedbackUploadResult & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image.');
      }

      setAssetRef(result.assetRef);
      if (result.url) setPreviewUrl(result.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading image.';
      setError(msg);
      setAssetRef(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreviewUrl(null);
    setPhotoAssetRef(null);
    setPhotoError(null);
  };

  const handleRemoveBg = () => {
    setBgPreviewUrl(null);
    setBgAssetRef(null);
    setBgError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'feedback_submit',
          ...formData,
          photoRef: photoAssetRef || undefined,
          backgroundImageRef: bgAssetRef || undefined,
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

  const isUploadingAny = photoUploading || bgUploading;

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

      {/* Optional Media Upload Grid: Profile Photo & Card Background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Field 1: Profile Photo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-1.5">
            Profile Photo <span className="text-[#3A4F1C]/40 font-normal">(Optional)</span>
          </label>
          <div className="relative bg-[#F7F3E8] border border-dashed border-[#3A4F1C]/30 rounded-xl p-3.5 text-center transition-all hover:border-[#BC6F07]/60">
            {photoPreviewUrl ? (
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#BC6F07] shrink-0 bg-[#1A2310]">
                  <Image
                    src={photoPreviewUrl}
                    alt="Profile photo preview"
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  {photoUploading ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#BC6F07]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </div>
                  ) : photoAssetRef ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#3A4F1C]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#BC6F07]" /> Ready
                    </div>
                  ) : (
                    <span className="text-xs text-[#3A4F1C]/60">Photo attached</span>
                  )}
                  <span className="text-[10px] text-[#3A4F1C]/50 block truncate">Max 5MB (JPG, PNG, WebP)</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1 text-[#3A4F1C]/60 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Remove profile photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                <Upload className="w-5 h-5 text-[#BC6F07] mb-1" />
                <span className="text-xs font-semibold text-[#3A4F1C]">Upload Photo</span>
                <span className="text-[10px] text-[#3A4F1C]/50 mt-0.5">JPG, PNG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept={FILE_CONSTRAINTS.photo.accept.join(',')}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, 'photo');
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {photoError && <p className="text-[11px] text-red-600 mt-1">{photoError}</p>}
        </div>

        {/* Field 2: Card Background Image */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] mb-1.5">
            Card Header Image <span className="text-[#3A4F1C]/40 font-normal">(Optional)</span>
          </label>
          <div className="relative bg-[#F7F3E8] border border-dashed border-[#3A4F1C]/30 rounded-xl p-3.5 text-center transition-all hover:border-[#BC6F07]/60">
            {bgPreviewUrl ? (
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-10 rounded-md overflow-hidden border border-[#BC6F07] shrink-0 bg-[#1A2310]">
                  <Image
                    src={bgPreviewUrl}
                    alt="Background preview"
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  {bgUploading ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#BC6F07]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </div>
                  ) : bgAssetRef ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#3A4F1C]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#BC6F07]" /> Ready
                    </div>
                  ) : (
                    <span className="text-xs text-[#3A4F1C]/60">Image attached</span>
                  )}
                  <span className="text-[10px] text-[#3A4F1C]/50 block truncate">Top 40% header card image</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBg}
                  className="p-1 text-[#3A4F1C]/60 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Remove card header image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                <ImageIcon className="w-5 h-5 text-[#BC6F07] mb-1" />
                <span className="text-xs font-semibold text-[#3A4F1C]">Upload Header Image</span>
                <span className="text-[10px] text-[#3A4F1C]/50 mt-0.5">JPG, PNG, WebP up to 10MB</span>
                <input
                  type="file"
                  accept={FILE_CONSTRAINTS.backgroundImage.accept.join(',')}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, 'backgroundImage');
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {bgError && <p className="text-[11px] text-red-600 mt-1">{bgError}</p>}
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
          placeholder="e.g. Wedding, 18th Debut, Corporate Event"
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
                className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
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

      {/* Data Privacy Disclaimer — Unchanged per user directive */}
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
            disabled={isSubmitting || isUploadingAny}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#3A4F1C]/70 hover:text-[#3A4F1C] hover:bg-[#3A4F1C]/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isUploadingAny}
          className="px-7 py-3 bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs font-semibold tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting || isUploadingAny ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#BC6F07]" />
              {isUploadingAny ? 'Uploading Media...' : 'Submitting...'}
            </>
          ) : (
            'Submit Feedback'
          )}
        </button>
      </div>
    </form>
  );
}

