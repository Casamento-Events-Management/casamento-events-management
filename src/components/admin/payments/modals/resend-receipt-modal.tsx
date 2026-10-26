'use client';

// =============================================================================
// components/admin/payments/modals/resend-receipt-modal.tsx — Resend Receipt Modal
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  AlertCircle,
  Loader2,
  Mail,
} from 'lucide-react';
import { resendReceiptAction } from '@/lib/services/admin-payment-actions';
import type { ExtendedPaymentRecord } from '@/lib/services/admin-payment-actions';

interface ResendReceiptModalProps {
  payment: ExtendedPaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResendReceiptModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: ResendReceiptModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [recipientEmail, setRecipientEmail] = useState<string>(payment?.booking?.client_email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esc key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipientEmail || !recipientEmail.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resendReceiptAction({
        paymentId: payment.id,
        recipientEmail: recipientEmail.trim().toLowerCase(),
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to dispatch receipt email');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('[ResendReceiptModal Error]:', err);
      setError(err instanceof Error ? err.message : 'Error resending receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#3A4F1C] text-[#F7F3E8]">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-[#BC6F07]" />
            <h3 className="font-serif font-semibold text-sm sm:text-base">Resend Payment Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#F7F3E8]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs text-stone-700">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
            <p className="font-semibold text-stone-800">
              Receipt: <span className="font-mono text-[#BC6F07]">{payment.receipt_number || payment.payment_number}</span>
            </p>
            <p className="text-[11px] text-stone-500">
              Client: {payment.booking?.client_full_name} · Booking: {payment.booking_reference}
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Recipient Email <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Casamento operations will be CC&apos;d on this email dispatch.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#3A4F1C] hover:bg-[#2B3817] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Dispatch Email</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
