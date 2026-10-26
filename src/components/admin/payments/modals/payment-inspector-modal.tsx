'use client';

// =============================================================================
// components/admin/payments/modals/payment-inspector-modal.tsx — Detail Inspector
// =============================================================================

import React, { useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  Send,
  RotateCcw,
  Paperclip,
  FileText,
  User,
  Mail,
  Calendar,
} from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import type { ExtendedPaymentRecord } from '@/lib/services/admin-payment-actions';

interface PaymentInspectorModalProps {
  payment: ExtendedPaymentRecord | null;
  allBookingPayments?: ExtendedPaymentRecord[];
  isOpen: boolean;
  onClose: () => void;
  onViewProof: (payment: ExtendedPaymentRecord) => void;
  onRefund: (payment: ExtendedPaymentRecord) => void;
  onSendInvoice?: () => void;
}

export function PaymentInspectorModal({
  payment,
  allBookingPayments = [],
  isOpen,
  onClose,
  onViewProof,
  onRefund,
  onSendInvoice,
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

  // Payments for this booking (or fallback to array containing current payment)
  const timelinePayments = allBookingPayments.length > 0 ? allBookingPayments : [payment];

  // Calculate snapshot of balance for each payment in timeline order
  const agreedTotal = payment.booking?.agreed_total_centavos ?? 0;
  let runningPaid = 0;
  // Sort payments chronological ascending to compute running snapshot
  const sortedAsc = [...timelinePayments]
    .filter((p) => !p.id.startsWith('pending-') && p.status !== 'cancelled')
    .sort((a, b) => new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime());

  const balanceSnapshots = new Map<string, number>();
  for (const p of sortedAsc) {
    const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
    runningPaid += net > 0 ? net : 0;
    balanceSnapshots.set(p.id, Math.max(0, agreedTotal - runningPaid));
  }

  // Display timeline newest first
  const displayPayments = sortedAsc.slice().reverse();

  const totalPaidNet = sortedAsc.reduce((acc, p) => {
    const net = (p.amount_centavos || 0) - (p.refund_amount_centavos || 0);
    return acc + (net > 0 ? net : 0);
  }, 0);

  const remainingBalance = payment.booking?.remaining_balance_centavos !== null && payment.booking?.remaining_balance_centavos !== undefined
    ? payment.booking.remaining_balance_centavos
    : Math.max(0, agreedTotal - totalPaidNet);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-xl overflow-hidden my-3 max-h-[92vh] flex flex-col"
      >
        {/* Header (Structured without justify-between) */}
        <div className="flex items-center px-5 py-3.5 bg-[#3A4F1C] text-[#F7F3E8] shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#BC6F07] shrink-0" />
            <h3 className="font-serif font-semibold text-sm sm:text-base">Client Financial & Payment History</h3>
          </div>
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#F7F3E8]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-3.5 text-xs text-stone-700 overflow-y-auto">
          {/* 1. TOP CARD: Financial Snapshot (Flex grid with gap, no justify-between) */}
          <div className="p-3.5 bg-white rounded-xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                <span className="font-mono text-xs text-[#3A4F1C]">[{payment.booking_reference}]</span>
                <span>{payment.booking?.client_full_name}</span>
              </div>
              <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                <Calendar className="h-3 w-3 text-stone-400" />
                <span>Event: {payment.booking?.event_date || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 text-center">
              <div className="p-2 bg-stone-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Agreed Total</span>
                <span className="text-xs sm:text-sm font-bold text-[#2B3817]">
                  {formatPesos(payment.booking?.agreed_total_centavos)}
                </span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Collected</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-800">
                  {formatPesos(totalPaidNet)}
                </span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Remaining Balance</span>
                <span className="text-xs sm:text-sm font-bold text-amber-800">
                  {formatPesos(remainingBalance)}
                </span>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Status</span>
                <span className="text-[11px] font-semibold text-stone-700 capitalize">
                  {remainingBalance === 0 ? 'Fully Paid' : totalPaidNet > 0 ? 'Partially Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. PAYMENT HISTORY & TIMELINE TABLE (Height limited with scroll-y) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Payment Transactions Timeline ({displayPayments.length})
              </span>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
              <div className="max-h-56 sm:max-h-64 overflow-y-auto">
                {displayPayments.length === 0 ? (
                  <div className="p-6 text-center text-stone-400 text-xs">
                    No payment transactions recorded for this booking yet.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-stone-700 border-collapse">
                    <thead className="sticky top-0 bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      <tr>
                        <th className="py-2 px-3">Payment #</th>
                        <th className="py-2 px-2.5">Method</th>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-right">Bal Snapshot</th>
                        <th className="py-2 px-2 text-center">Files</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {displayPayments.map((p) => {
                        const snapshot = balanceSnapshots.get(p.id);
                        return (
                          <tr key={p.id} className="hover:bg-stone-50/70 transition">
                            <td className="py-2 px-3 font-mono font-semibold text-[#2B3817] text-[11px]">
                              {p.payment_number}
                            </td>
                            <td className="py-2 px-2.5 capitalize text-[11px]">
                              {p.payment_method.replace('_', ' ')}
                            </td>
                            <td className="py-2 px-2.5 text-stone-500 text-[11px] whitespace-nowrap">
                              {new Date(p.paid_at).toLocaleDateString('en-PH', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-800 whitespace-nowrap text-[11px]">
                              {formatPesos(p.amount_centavos)}
                            </td>
                            <td className="py-2 px-3 text-right text-stone-600 whitespace-nowrap text-[11px]">
                              {snapshot !== undefined ? formatPesos(snapshot) : '—'}
                            </td>
                            <td className="py-2 px-2 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                {p.proof_attachment_path ? (
                                  <button
                                    type="button"
                                    onClick={() => onViewProof(p)}
                                    className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-sm cursor-pointer"
                                    title="View Proof"
                                  >
                                    <Paperclip className="h-3 w-3" />
                                  </button>
                                ) : (
                                  <span className="text-stone-300 text-[10px]">—</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right whitespace-nowrap">
                              {!p.is_refunded && p.status === 'paid' ? (
                                <button
                                  type="button"
                                  onClick={() => onRefund(p)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-[10px] cursor-pointer"
                                >
                                  <RotateCcw className="h-2.5 w-2.5 text-rose-600" />
                                  <span>Refund</span>
                                </button>
                              ) : p.is_refunded ? (
                                <span className="text-rose-600 font-semibold text-[10px]">Refunded</span>
                              ) : (
                                <span className="text-stone-400 text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* 3. ASSOCIATED DETAILS (Directly above footer, no space-between/justify-between) */}
          <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-1.5 text-xs text-stone-600">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Associated Booking Information
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-stone-400" />
                <span>{payment.booking?.client_full_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-stone-400" />
                <span>{payment.booking?.client_email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-stone-400" />
                <span>{payment.booking?.service_title}</span>
              </div>
            </div>
            {payment.notes && (
              <div className="pt-1 text-[11px] text-stone-500 italic">
                Latest payment note: &ldquo;{payment.notes}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* 4. FOOTER (Strictly structured with gap, no justify-between) */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center gap-3 shrink-0">
          {onSendInvoice && remainingBalance > 0 && (
            <button
              type="button"
              onClick={onSendInvoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs cursor-pointer shadow-xs"
            >
              <Send className="h-3.5 w-3.5 text-[#3A4F1C]" />
              <span>Send Payment Invoice</span>
            </button>
          )}

          <div className="ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
