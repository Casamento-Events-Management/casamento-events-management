'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import type { ServiceItem } from '@/types';
import { Button } from '@/components/ui/button';

interface ServiceInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
}

export function ServiceInquiryModal({
  isOpen,
  onClose,
  service,
}: ServiceInquiryModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [, startTransition] = React.useTransition();

  // Reset form when modal opens with a new service
  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setClientName('');
        setClientEmail('');
        setClientPhone('');
        setClientAddress('');
        setMessage('');
        setSubmitError(null);
        setIsSuccess(false);
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, service?.id, onClose]);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!clientName.trim() || !clientEmail.trim() || !message.trim()) {
      setSubmitError('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    if (message.trim().length < 10) {
      setSubmitError('Message must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload with client inputs + service specifications
      const payload = {
        action: 'service_inquiry',
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        message: message.trim(),

        // Attached service item details for email notification
        serviceId: service.id,
        serviceTitle: service.title,
        serviceSlug: service.slug,
        categoryTitle: service.category.title,
        serviceType: service.serviceType,
        shortDescription: service.shortDescription,
        defaultInclusions: service.defaultInclusions,
        availableAddOns: service.addOns?.map((addon) => addon.title) || [],
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-2xl overflow-y-auto flex flex-col text-[#3A4F1C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#F7F3E8]/95 backdrop-blur border-b border-[#3A4F1C]/15 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#BC6F07] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Inquire About Service
            </span>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#3A4F1C] line-clamp-1">
              {service.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#3A4F1C]/70 hover:text-[#3A4F1C] hover:bg-[#3A4F1C]/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          /* SUCCESS MODAL VIEW */
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C] flex items-center justify-center mx-auto border border-[#3A4F1C]/20">
              <CheckCircle2 className="w-8 h-8 text-[#BC6F07]" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-serif font-bold text-[#3A4F1C]">
                Inquiry Received!
              </h4>
              <p className="text-xs sm:text-sm text-[#3A4F1C]/85 font-light leading-relaxed max-w-sm mx-auto">
                Thanks for your inquiry! Our event team has received your message regarding <span className="font-semibold">{service.title}</span>. We will reply back to you shortly via email.
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={onClose}
                variant="primary"
                size="md"
                className="w-full sm:w-auto px-8"
              >
                Close & Continue Browsing
              </Button>
            </div>
          </div>
        ) : (
          /* INQUIRY FORM VIEW */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 flex-1">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 leading-snug">
                {submitError}
              </div>
            )}

            <div className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#3A4F1C]">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#3A4F1C]">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="maria@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                />
              </div>

              {/* 2-Grid: Contact Number & Address (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#3A4F1C]">
                    Contact Number <span className="text-[#3A4F1C]/50 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#3A4F1C]">
                    Complete Address <span className="text-[#3A4F1C]/50 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BGC Taguig, Cebu"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#3A4F1C]">
                  Message & Inquiry Notes <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about your upcoming event, preferred date range, guest count, or custom requests..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#3A4F1C]/20 bg-[#EFEAD8]/40 focus:bg-[#F7F3E8] focus:border-[#BC6F07] focus:outline-none text-[#3A4F1C]"
                />
              </div>
            </div>

            {/* Form Action Controls */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#3A4F1C]/80 hover:text-[#3A4F1C] transition-colors"
              >
                Cancel
              </button>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                size="sm"
                className="px-5 py-2 text-xs gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </Button>
            </div>

            {/* Form Footer Data Privacy Disclaimer */}
            <div className="pt-3 border-t border-[#3A4F1C]/15 text-[10px] text-[#3A4F1C]/70 leading-relaxed flex items-start space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#BC6F07] shrink-0 mt-0.5" />
              <span>
                <strong>Data Privacy Notice:</strong> Casamento Events respects your privacy. The information provided is kept strictly confidential and used solely to respond to your inquiry and plan your celebration.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
