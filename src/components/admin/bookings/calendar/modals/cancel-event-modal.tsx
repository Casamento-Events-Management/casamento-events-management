'use client';

// =============================================================================
// cancel-event-modal.tsx — Soft Delete / Cancel Event Modal Dialog
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, AlertCircle, Loader2, X, Mail } from 'lucide-react';
import type { BookingRecord } from '@/types/booking';
import { cancelEventAction } from '@/lib/services/admin-calendar-actions';

interface CancelEventModalProps {
  booking: BookingRecord;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: (updated: BookingRecord) => void;
}

export function CancelEventModal({
  booking,
  isOpen,
  onClose,
  onCancelled,
}: CancelEventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esc key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a reason for cancelling this event reservation.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await cancelEventAction({
        bookingId: booking.id,
        cancellationReason: reason.trim(),
        notifyClient,
      });

      if (!res.success || !res.booking) {
        throw new Error(res.error || 'Failed to cancel event.');
      }

      onCancelled(res.booking);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg my-8 rounded-2xl bg-white shadow-xl border border-red-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center px-6 py-4 border-b border-red-100 bg-red-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-red-950">
                Remove Event
              </h3>
              <p className="text-xs text-red-700/80">
                Ref: <span className="font-mono font-semibold text-red-900">{booking.booking_reference}</span> • {booking.service_title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            title="Close (Esc)"
            className="ml-auto rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <span className="font-medium text-stone-500">Client:</span>
              <span className="font-semibold text-stone-900">{booking.client_full_name}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <span className="font-medium text-stone-500">Scheduled Date:</span>
              <span className="font-semibold text-stone-800">{booking.event_date}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <span className="font-medium text-stone-500">Venue:</span>
              <span className="text-stone-800">
                {booking.venue_city}{booking.event_country_name ? `, ${booking.event_country_name}` : ''}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            This action will remove the event from the active calendar and mark it as <strong>cancelled</strong>. The reservation will be preserved in the <strong>Archived</strong> tab with full audit history.
          </p>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Removal Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client requested cancellation due to family scheduling conflict."
              className="w-full rounded-xl border border-stone-300 p-3 text-xs text-stone-900 placeholder-stone-400 max-h-28 overflow-y-auto resize-y focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
            />
          </div>

          {/* Email Notification Toggle */}
          <div className="rounded-xl border border-stone-200 p-3.5 bg-white">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={(e) => setNotifyClient(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
              />
              <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800">
                <Mail className="h-3.5 w-3.5 text-stone-600" />
                <span>Send cancellation notice to client ({booking.client_email})</span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="ml-auto rounded-lg border border-stone-200 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <span>Confirm Removal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
