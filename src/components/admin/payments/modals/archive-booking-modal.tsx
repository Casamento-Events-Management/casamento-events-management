'use client';

// =============================================================================
// components/admin/payments/modals/archive-booking-modal.tsx — Archive Booking
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Archive,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { archiveBookingAction } from '@/lib/services/admin-payment-actions';
import { formatPesos } from '@/lib/utils/currencyUtils';

export interface ArchiveBookingTarget {
  bookingId: string;
  bookingReference: string;
  clientFullName: string;
  serviceTitle?: string;
  agreedTotalCentavos?: number | null;
  remainingBalanceCentavos?: number | null;
}

interface ArchiveBookingModalProps {
  booking: ArchiveBookingTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ArchiveBookingModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: ArchiveBookingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reason.trim().length < 3) {
      setError('Please provide an archive reason (minimum 3 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await archiveBookingAction({
        bookingId: booking.bookingId,
        reason: reason.trim(),
      });

      if (!res.success) {
        setError(res.error || 'Failed to archive booking.');
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('[ArchiveBookingModal Error]:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#F7F3E8] border border-rose-200 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center px-6 py-4 bg-rose-900 text-rose-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <Archive className="h-5 w-5 text-rose-300 shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-base text-white">Archive Booking</h3>
              <p className="text-xs text-rose-200/80 font-mono">
                {booking.bookingReference} · {booking.clientFullName}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Notice:</span> Archiving this reservation removes it from active Billing & Payments tracking and the active calendar. The booking record and audit trail remain preserved.
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {/* Booking Context Card */}
          <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Event Information
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#2B3817]">
                {booking.bookingReference}
              </span>
            </div>
            <div className="space-y-1 pt-1 border-t border-stone-100">
              <p className="font-semibold text-stone-900">{booking.clientFullName}</p>
              {booking.serviceTitle && (
                <p className="text-stone-500 text-[11px]">{booking.serviceTitle}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
              <div>
                <span className="text-[10px] text-stone-500 block">Agreed Total</span>
                <span className="font-bold text-stone-900">
                  {formatPesos(booking.agreedTotalCentavos)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">Balance</span>
                <span className="font-bold text-amber-800">
                  {formatPesos(booking.remainingBalanceCentavos)}
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Reason for Archiving <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client requested cancellation, event concluded and archived, or duplicate reservation entry..."
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
            <p className="text-[11px] text-stone-500">
              This explanation is permanently archived in the system audit log.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirm Archive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
