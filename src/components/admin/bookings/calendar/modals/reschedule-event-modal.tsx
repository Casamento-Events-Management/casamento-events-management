'use client';

// =============================================================================
// reschedule-event-modal.tsx — Reschedule Event Date with Country-Aware Holiday Check
// =============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, AlertCircle, Loader2, X, Mail, Sparkles } from 'lucide-react';
import type { BookingRecord } from '@/types/booking';
import { checkCountryHoliday } from '@/lib/utils/holidayUtils';
import { rescheduleEventAction } from '@/lib/services/admin-calendar-actions';

interface RescheduleEventModalProps {
  booking: BookingRecord;
  isOpen: boolean;
  onClose: () => void;
  onRescheduled: (updated: BookingRecord) => void;
}

export function RescheduleEventModal({
  booking,
  isOpen,
  onClose,
  onRescheduled,
}: RescheduleEventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [newDate, setNewDate] = useState(booking.event_date);
  const [reason, setReason] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute today's local date string
  const todayDateString = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Country-aware holiday check on the selected date
  const holidayCheck = useMemo(() => {
    if (!newDate) return { isHoliday: false, name: '' };
    return checkCountryHoliday(newDate, booking.event_country || 'PH');
  }, [newDate, booking.event_country]);

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

    if (!newDate) {
      setError('Please select a new date for this event.');
      return;
    }

    if (newDate < todayDateString) {
      setError('Past dates are not permitted. Please select today or a future date.');
      return;
    }

    if (newDate === booking.event_date) {
      setError('The selected date is identical to the current event date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await rescheduleEventAction({
        bookingId: booking.id,
        newDate,
        reason: reason.trim() || undefined,
        notifyClient,
      });

      if (!res.success || !res.booking) {
        throw new Error(res.error || 'Failed to reschedule event.');
      }

      onRescheduled(res.booking);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule event.');
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
        className="relative w-full max-w-lg my-8 rounded-2xl bg-white shadow-xl border border-[#3A4F1C]/20 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center px-6 py-4 border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2B3817]">
                Reschedule Event
              </h3>
              <p className="text-xs text-[#2B3817]/70">
                Ref: <span className="font-mono font-semibold text-stone-900">{booking.booking_reference}</span> • {booking.service_title}
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
              <span className="font-medium text-stone-500">Current Date:</span>
              <span className="font-semibold text-stone-800 line-through">{booking.event_date}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <span className="font-medium text-stone-500">Venue:</span>
              <span className="text-stone-800">
                {booking.venue_city}{booking.event_country_name ? `, ${booking.event_country_name}` : ''}
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Select New Event Date">
              <Calendar className="h-3.5 w-3.5 text-[#3A4F1C]" />
              <span>Target New Event Date</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={todayDateString}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* Country-Aware Holiday Notification Banner */}
          {holidayCheck.isHoliday && (
            <div className="p-2.5 bg-[#BC6F07]/10 border border-[#BC6F07]/30 rounded-lg text-xs text-[#3A4F1C] space-y-0.5 animate-in fade-in duration-150">
              <span className="font-semibold text-[#BC6F07] uppercase block tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Holiday Calendar Notice ({booking.event_country_name || booking.event_country})
              </span>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                The new date coincides with <strong className="text-stone-900">{holidayCheck.name}</strong>. Please ensure venue booking and staff availability accounts for holiday logistics.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reason / Note for Rescheduling <span className="text-[11px] font-normal text-stone-500">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Adjusted based on client request over phone consultation."
              className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 max-h-28 overflow-y-auto resize-y focus:border-[#3A4F1C] focus:outline-hidden"
            />
          </div>

          {/* Email Notification Toggle */}
          <div className="rounded-xl border border-stone-200 p-3.5 bg-white">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={(e) => setNotifyClient(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-[#3A4F1C] focus:ring-[#3A4F1C]"
              />
              <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800">
                <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Notify client via email ({booking.client_email})</span>
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A4F1C] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2B3817] transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <span>Confirm Reschedule</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
