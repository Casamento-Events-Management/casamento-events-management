'use client';

// =============================================================================
// components/admin/payments/modals/refund-payment-modal.tsx — Refund Payment
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import { refundPaymentAction } from '@/lib/services/admin-payment-actions';
import type { ExtendedPaymentRecord } from '@/lib/services/admin-payment-actions';

interface RefundPaymentModalProps {
  payment: ExtendedPaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundPaymentModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: RefundPaymentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const defaultAmount = payment ? (payment.amount_centavos / 100).toString() : '';
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmountPesos, setRefundAmountPesos] = useState<string>(defaultAmount);
  const [refundReason, setRefundReason] = useState<string>('');
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

  const originalAmountPesos = payment.amount_centavos / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = refundType === 'full' ? originalAmountPesos : parseFloat(refundAmountPesos);
    if (isNaN(amount) || amount <= 0) {
      setError('Please specify a valid refund amount greater than zero.');
      return;
    }

    if (amount > originalAmountPesos) {
      setError(`Refund amount cannot exceed original payment of ${formatPesos(payment.amount_centavos)}.`);
      return;
    }

    if (!refundReason.trim() || refundReason.trim().length < 5) {
      setError('Please provide an explanatory reason for this refund (minimum 5 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await refundPaymentAction({
        paymentId: payment.id,
        refundAmountPesos: amount,
        refundReason: refundReason.trim(),
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to record refund');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('[RefundPaymentModal Error]:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while executing refund.');
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
        className="relative w-full max-w-md bg-[#F7F3E8] border border-rose-300 rounded-2xl shadow-xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-rose-700 text-white">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-rose-200" />
            <h3 className="font-serif font-semibold text-sm sm:text-base">Record Payment Refund</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
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

          {/* Context Card */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">Payment:</span>
              <span className="font-mono font-bold text-stone-800">{payment.payment_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Client:</span>
              <span className="font-medium text-stone-800">{payment.booking?.client_full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Original Amount:</span>
              <span className="font-bold text-emerald-800">{formatPesos(payment.amount_centavos)}</span>
            </div>
          </div>

          {/* Refund Type */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Refund Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRefundType('full');
                  setRefundAmountPesos(originalAmountPesos.toString());
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                  refundType === 'full'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-500'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                Full ({formatPesos(payment.amount_centavos)})
              </button>
              <button
                type="button"
                onClick={() => setRefundType('partial')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                  refundType === 'partial'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-500'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                Partial Refund
              </button>
            </div>
          </div>

          {/* Partial Amount Input */}
          {refundType === 'partial' && (
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Refund Amount (PHP) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-xs">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  max={originalAmountPesos}
                  value={refundAmountPesos}
                  onChange={(e) => setRefundAmountPesos(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Mandatory Refund Reason */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Reason for Refund <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Client cancelled event; deposit partially refunded per contract clause 4."
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Audit Notice */}
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px]">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>This action will be permanently recorded in the system audit trail.</span>
          </div>

          {/* Actions */}
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Refund</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
