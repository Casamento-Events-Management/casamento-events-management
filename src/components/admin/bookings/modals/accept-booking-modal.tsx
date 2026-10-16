'use client';

// =============================================================================
// accept-booking-modal.tsx — Accept Booking Confirmation Modal
// =============================================================================

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, X, Mail } from 'lucide-react';
import type { BookingRecord } from '@/types/booking';

interface AcceptBookingModalProps {
  booking: BookingRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: { notifyClient: boolean; adminMessage?: string }) => Promise<void>;
}

export function AcceptBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: AcceptBookingModalProps) {
  const [notifyClient, setNotifyClient] = useState(true);
  const [adminMessage, setAdminMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm({
        notifyClient,
        adminMessage: adminMessage.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-[#3A4F1C]/20 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2B3817]">
                Accept Booking Request
              </h3>
              <p className="text-xs text-[#2B3817]/70">
                Ref: {booking.booking_reference}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-[#3A4F1C]/15 bg-[#F7F3E8]/40 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Client:</span>
              <span className="font-semibold text-[#2B3817]">{booking.client_full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Service:</span>
              <span className="font-medium text-[#2B3817]">{booking.service_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Confirmed Date:</span>
              <span className="font-semibold text-[#3A4F1C]">{booking.event_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Venue:</span>
              <span className="text-[#2B3817]">{booking.venue_city}</span>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Accepting this request will mark the booking as <strong>confirmed</strong> and add it to the upcoming events calendar.
          </p>

          {/* Email Notification Toggle */}
          <div className="rounded-xl border border-[#3A4F1C]/15 p-3.5 space-y-3 bg-white">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={(e) => setNotifyClient(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-[#3A4F1C] focus:ring-[#3A4F1C]"
              />
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#2B3817]">
                <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Send confirmation email to client ({booking.client_email})</span>
              </div>
            </label>

            {notifyClient && (
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Optional note to client (included in email):
                </label>
                <textarea
                  rows={2}
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="e.g. We look forward to meeting you for our concept briefing."
                  className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-stone-200 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
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
                  <span>Accepting...</span>
                </>
              ) : (
                <span>Accept Booking</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
