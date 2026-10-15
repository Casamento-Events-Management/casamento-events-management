'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Loader2, CheckCircle2, AlertCircle, RefreshCw, Edit3, X, HelpCircle } from 'lucide-react';
import type { BookingFormData } from '@/types/bookingForm';

interface EmailValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: BookingFormData;
  onConfirmSuccess: (bookingReference: string) => void;
  onEmailUpdated: (newEmail: string) => void;
}

type ModalStep = 'sending' | 'prompt' | 'editing_email' | 'finalizing' | 'error';

export function EmailValidationModal({
  isOpen,
  onClose,
  formData,
  onConfirmSuccess,
  onEmailUpdated,
}: EmailValidationModalProps) {
  const [step, setStep] = useState<ModalStep>('sending');
  const [currentEmail, setCurrentEmail] = useState<string>(formData.clientEmail);
  const [editEmailInput, setEditEmailInput] = useState<string>(formData.clientEmail);
  const [activeReference, setActiveReference] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerSendPreview = useCallback(async (emailToSend: string) => {
    setStep('sending');
    setErrorMessage(null);
    setCurrentEmail(emailToSend);
    setEditEmailInput(emailToSend);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_preview_email',
          formData: {
            ...formData,
            clientEmail: emailToSend,
          },
          verifiedEmail: emailToSend,
          bookingReference: activeReference || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStep('error');
        setErrorMessage(data.error || 'Failed to dispatch verification email. Please try again.');
        return;
      }

      if (data.bookingReference) {
        setActiveReference(data.bookingReference);
      }

      // Transition directly to prompt as soon as the email is dispatched
      setStep('prompt');
    } catch (err) {
      console.error('[EmailValidationModal] send_preview_email error:', err);
      setStep('error');
      setErrorMessage('Network connection error. Please check your internet connection and retry.');
    }
  }, [formData, activeReference]);

  // Sync email when modal opens or formData changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        void triggerSendPreview(formData.clientEmail);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, formData.clientEmail, triggerSendPreview]);

  const handleConfirmFinal = async () => {
    setStep('finalizing');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_booking',
          formData: {
            ...formData,
            clientEmail: currentEmail,
          },
          verifiedEmail: currentEmail,
          bookingReference: activeReference || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStep('error');
        setErrorMessage(data.error || 'Failed to save booking. Please try again.');
        return;
      }

      const finalRef = data.bookingReference || activeReference || 'CAS-CONFIRMED';
      onConfirmSuccess(finalRef);
    } catch (err) {
      console.error('[EmailValidationModal] confirm_booking error:', err);
      setStep('error');
      setErrorMessage('Unable to finalize reservation. Please try again.');
    }
  };

  const handleSaveEditedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = editEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setCurrentEmail(clean);
    onEmailUpdated(clean);
    triggerSendPreview(clean);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#F7F3E8] border border-[#3A4F1C]/20 p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (disabled while finalizing) */}
        {step !== 'finalizing' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#3A4F1C]/60 hover:text-[#3A4F1C] hover:bg-[#3A4F1C]/10 transition cursor-pointer"
            aria-label="Close verification modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 1. Sending State (Natural Loader) */}
        {step === 'sending' && (
          <div className="py-8 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <Loader2 className="w-8 h-8 animate-spin text-[#BC6F07]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-serif font-bold text-[#3A4F1C]">
                Sending Verification Email
              </h3>
              <p className="text-xs sm:text-sm text-[#3A4F1C]/75 font-light">
                Sending booking details to{' '}
                <span className="font-semibold text-[#3A4F1C]">{currentEmail}</span>...
              </p>
            </div>
          </div>
        )}

        {/* 2. Prompt State (Did you receive our email?) */}
        {step === 'prompt' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-[#3A4F1C]/15 pb-4">
              <div className="w-10 h-10 rounded-full bg-[#3A4F1C]/10 flex items-center justify-center text-[#3A4F1C] shrink-0">
                <Mail className="w-5 h-5 text-[#BC6F07]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#3A4F1C]">
                  Check Your Email Inbox
                </h3>
                <p className="text-xs text-[#3A4F1C]/70">
                  We send an email to{' '}
                  <span className="font-semibold text-[#3A4F1C]">{currentEmail}</span>
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-[#3A4F1C]/85 space-y-2">
              <p className="font-medium text-[#3A4F1C]">
                Did you receive our confirmation email at this address?
              </p>
              <p className="text-xs text-[#3A4F1C]/70 font-light leading-relaxed">
                Confirming receipt guarantees that our event coordination team has your correct contact information to send your itinerary and quotation.
              </p>
            </div>

            {/* Spam Folder Alert Notice */}
            <div className="p-3.5 bg-[#BC6F07]/10 border border-[#BC6F07]/30 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#BC6F07] text-[11px] uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Can&apos;t find it in your inbox?</span>
              </div>
              <p className="text-[11px] text-[#3A4F1C]/80 leading-relaxed font-light pl-5">
                Please check your <strong>Spam, Junk, or Promotions</strong> folder. If found there, please mark it as <em>&ldquo;Not Spam&rdquo;</em> so our team&apos;s upcoming updates arrive smoothly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* Yes */}
              <button
                type="button"
                onClick={handleConfirmFinal}
                className="w-full py-3.5 px-6 rounded-xl bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#BC6F07]" />
                Yes
              </button>

              <div className="flex items-center justify-between gap-3 pt-1">
                {/* Resend Email */}
                <button
                  type="button"
                  onClick={() => triggerSendPreview(currentEmail)}
                  className="text-xs font-medium text-[#3A4F1C] hover:text-[#BC6F07] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend Email
                </button>

                {/* Change Email */}
                <button
                  type="button"
                  onClick={() => {
                    setEditEmailInput(currentEmail);
                    setStep('editing_email');
                  }}
                  className="text-xs font-medium text-[#BC6F07] hover:underline transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Change Email Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Editing Email State (Inline Correction) */}
        {step === 'editing_email' && (
          <form onSubmit={handleSaveEditedEmail} className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#3A4F1C]/15 pb-3">
              <Edit3 className="w-5 h-5 text-[#BC6F07]" />
              <div>
                <h3 className="text-base font-serif font-bold text-[#3A4F1C]">
                  Update Email Address
                </h3>
                <p className="text-xs text-[#3A4F1C]/70">
                  Correct any typos to verify your event booking receipt.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#3A4F1C] uppercase tracking-wider">
                New Email Address
              </label>
              <input
                type="email"
                required
                value={editEmailInput}
                onChange={(e) => setEditEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-[#3A4F1C]/20 bg-white focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                autoFocus
              />
              {errorMessage && (
                <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep('prompt')}
                className="px-4 py-2 text-xs font-medium text-[#3A4F1C]/70 hover:text-[#3A4F1C] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#3A4F1C] hover:bg-[#2C3C15] text-[#F7F3E8] rounded-lg shadow-sm transition cursor-pointer"
              >
                Save &amp; Resend Verification
              </button>
            </div>
          </form>
        )}

        {/* 4. Finalizing State (Saving to DB & sending official emails) */}
        {step === 'finalizing' && (
          <div className="py-8 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <Loader2 className="w-8 h-8 animate-spin text-[#BC6F07]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#3A4F1C]">
                Finalizing Your Reservation
              </h3>
              <p className="text-xs sm:text-sm text-[#3A4F1C]/75 font-light">
                Securing your date in our calendar...
              </p>
            </div>
          </div>
        )}

        {/* 5. Error State */}
        {step === 'error' && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-[#3A4F1C]">
                Verification Notice
              </h3>
              <p className="text-xs text-red-600 font-medium">
                {errorMessage || 'An error occurred while verifying email.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => triggerSendPreview(currentEmail)}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#3A4F1C] text-[#F7F3E8] rounded-lg shadow-sm hover:bg-[#2C3C15] transition cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#3A4F1C]/70 hover:text-[#3A4F1C] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
