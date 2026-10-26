'use client';

// =============================================================================
// components/admin/payments/modals/payment-inspector-modal.tsx — Detail Inspector
// =============================================================================

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  CreditCard,
  Send,
  RotateCcw,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import type { ExtendedPaymentRecord } from '@/lib/services/admin-payment-actions';

interface PaymentInspectorModalProps {
  payment: ExtendedPaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProof: (payment: ExtendedPaymentRecord) => void;
  onRefund: (payment: ExtendedPaymentRecord) => void;
  onResendReceipt: (payment: ExtendedPaymentRecord) => void;
}

export function PaymentInspectorModal({
  payment,
  isOpen,
  onClose,
  onViewProof,
  onRefund,
  onResendReceipt,
}: PaymentInspectorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const channel = (payment.channel_details || {}) as Record<string, string>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#3A4F1C] text-[#F7F3E8]">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#BC6F07]" />
            <div>
              <h3 className="font-serif font-semibold text-sm sm:text-base">Payment Details</h3>
              <p className="font-mono text-[11px] text-[#F7F3E8]/80">{payment.payment_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#F7F3E8]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-stone-700">
          {/* Amount Hero Card */}
          <div className="p-4 bg-white rounded-xl border border-stone-200 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Payment Amount
            </span>
            <p className="text-2xl font-serif font-bold text-emerald-800">
              {formatPesos(payment.amount_centavos)}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs pt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {payment.status}
              </span>
              {payment.is_refunded && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Refunded ({formatPesos(payment.refund_amount_centavos)})
                </span>
              )}
            </div>
          </div>

          {/* Booking Context */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-500">Associated Booking</span>
              <Link
                href={`/admin/bookings?search=${payment.booking_reference}`}
                className="text-[#3A4F1C] hover:underline flex items-center gap-1 font-mono font-semibold"
              >
                <span>{payment.booking_reference}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Client Name</span>
                <span className="font-semibold text-stone-800">{payment.booking?.client_full_name || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Event Service</span>
                <span className="font-medium text-stone-800">{payment.booking?.service_title || '—'}</span>
              </div>
            </div>
          </div>

          {/* Payment Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-stone-200">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Payment Method</span>
              <span className="font-semibold text-stone-800 capitalize">
                {payment.payment_method.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Date Received</span>
              <span className="font-medium text-stone-800">
                {new Date(payment.paid_at).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {channel.bankName && (
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Bank Name</span>
                <span className="font-medium text-stone-800">{channel.bankName}</span>
              </div>
            )}

            {channel.referenceNumber && (
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Reference #</span>
                <span className="font-mono text-stone-800">{channel.referenceNumber}</span>
              </div>
            )}

            {payment.receipt_number && (
              <div className="col-span-2">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Receipt Reference</span>
                <span className="font-mono font-semibold text-[#BC6F07]">{payment.receipt_number}</span>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          {payment.notes && (
            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Notes</span>
              <p className="text-stone-800 text-xs italic">&ldquo;{payment.notes}&rdquo;</p>
            </div>
          )}

          {/* Refund Details */}
          {payment.is_refunded && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Refund Details</span>
              <p className="text-xs">
                Amount Refunded: <span className="font-bold">{formatPesos(payment.refund_amount_centavos)}</span>
              </p>
              {payment.refund_reason && (
                <p className="text-[11px] text-rose-800 italic mt-0.5">
                  Reason: &ldquo;{payment.refund_reason}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {payment.proof_attachment_path && (
                <button
                  type="button"
                  onClick={() => onViewProof(payment)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs cursor-pointer"
                >
                  <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                  <span>View Proof</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onResendReceipt(payment)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-blue-600" />
                <span>Resend Receipt</span>
              </button>
            </div>

            {!payment.is_refunded && payment.status === 'paid' && (
              <button
                type="button"
                onClick={() => onRefund(payment)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-rose-700 hover:bg-rose-50 font-semibold text-xs cursor-pointer border border-rose-200"
              >
                <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
                <span>Refund</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
