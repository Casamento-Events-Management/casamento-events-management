'use client';

// =============================================================================
// components/admin/payments/modals/send-payment-invoice-modal.tsx — Send Invoice
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  AlertCircle,
  Loader2,
  Calendar,
  Send,
} from 'lucide-react';
import { sendPaymentInvoiceAction } from '@/lib/services/admin-payment-actions';
import {
  formatPesos,
  handleNumberInputKeyDown,
  sanitizeNumberInput,
} from '@/lib/utils/currencyUtils';

export interface InvoiceBookingTarget {
  bookingId: string;
  bookingReference: string;
  clientFullName: string;
  clientEmail: string;
  serviceTitle: string;
  agreedTotalCentavos: number | null;
  remainingBalanceCentavos: number | null;
}

interface SendPaymentInvoiceModalProps {
  booking: InvoiceBookingTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendPaymentInvoiceModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: SendPaymentInvoiceModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const remainingBalancePesos = booking?.remainingBalanceCentavos
    ? (booking.remainingBalanceCentavos / 100).toFixed(2)
    : '';

  const [invoiceAmountPesos, setInvoiceAmountPesos] = useState<string>(remainingBalancePesos);
  const [recipientEmail, setRecipientEmail] = useState<string>(booking?.clientEmail || '');
  const [dueDate, setDueDate] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
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

  if (!isOpen || !booking) return null;

  const maxAllowedPesos = (booking.remainingBalanceCentavos || 0) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(invoiceAmountPesos);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please specify a valid invoice amount greater than zero.');
      return;
    }

    if (amountNum > maxAllowedPesos) {
      setError(`Invoice amount cannot exceed the remaining balance of ${formatPesos(booking.remainingBalanceCentavos)}.`);
      return;
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendPaymentInvoiceAction({
        bookingId: booking.bookingId,
        invoiceAmountPesos: amountNum,
        recipientEmail: recipientEmail.trim().toLowerCase(),
        dueDate: dueDate || undefined,
        customNotes: customNotes.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to dispatch invoice');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('[SendPaymentInvoiceModal Error]:', err);
      setError(err instanceof Error ? err.message : 'Error sending invoice.');
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
        className="relative w-full max-w-lg bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#3A4F1C] text-[#F7F3E8] shrink-0">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-[#BC6F07]" />
            <div>
              <h3 className="font-serif font-semibold text-sm sm:text-base">Send Payment Invoice</h3>
              <p className="font-mono text-[10px] text-[#F7F3E8]/80">{booking.bookingReference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#F7F3E8]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 text-xs text-stone-700 overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking Summary Card */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
            <p className="font-bold text-[#2B3817] text-xs">
              {booking.clientFullName}{' '}
              <span className="font-mono text-[11px] font-normal text-stone-500">[{booking.bookingReference}]</span>
            </p>
            <p className="text-[11px] text-stone-500">{booking.serviceTitle}</p>
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              <span className="text-stone-600">
                Agreed Total: <strong>{formatPesos(booking.agreedTotalCentavos)}</strong>
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-amber-800">
                Remaining Balance: <strong>{formatPesos(booking.remainingBalanceCentavos)}</strong>
              </span>
            </div>
          </div>

          {/* Invoice Amount Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Invoice Amount (PHP) <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setInvoiceAmountPesos(maxAllowedPesos.toFixed(2))}
                className="text-[10px] text-[#3A4F1C] hover:underline font-semibold cursor-pointer"
              >
                Set to Full Balance ({formatPesos(booking.remainingBalanceCentavos)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-xs">
                ₱
              </span>
              <input
                type="text"
                inputMode="decimal"
                required
                value={invoiceAmountPesos}
                onKeyDown={handleNumberInputKeyDown}
                onChange={(e) => setInvoiceAmountPesos(sanitizeNumberInput(e.target.value))}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-stone-400">
              Cannot exceed current outstanding balance of {formatPesos(booking.remainingBalanceCentavos)}.
            </p>
          </div>

          {/* Recipient Email */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Recipient Client Email <span className="text-rose-600">*</span>
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
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Target Due Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Custom Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Second downpayment invoice for floral styling..."
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden resize-none"
            />
          </div>

          {/* Footer Actions */}
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
                  <span>Sending Invoice...</span>
                </>
              ) : (
                <span>Dispatch Invoice</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
