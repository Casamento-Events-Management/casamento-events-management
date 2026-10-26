'use client';

// =============================================================================
// components/admin/payments/modals/set-agreed-total-modal.tsx — Set Contract Total
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileText,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { formatPesos } from '@/lib/utils/currencyUtils';
import {
  setAgreedTotalAction,
  searchBookingsForPaymentAction,
} from '@/lib/services/admin-payment-actions';

interface BookingOption {
  id: string;
  booking_reference: string;
  client_full_name: string;
  client_email: string;
  service_title: string;
  event_date: string;
  agreed_total_centavos: number | null;
  total_paid_centavos: number;
  remaining_balance_centavos: number | null;
  payment_status: string;
}

interface SetAgreedTotalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialBookingId?: string;
}

export function SetAgreedTotalModal({
  isOpen,
  onClose,
  onSuccess,
  initialBookingId,
}: SetAgreedTotalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Booking selection
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingOption | null>(null);
  const [isSearchingBookings, setIsSearchingBookings] = useState(false);

  // Form inputs
  const [agreedTotalPesos, setAgreedTotalPesos] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sendEmailToClient, setSendEmailToClient] = useState<boolean>(true);

  // Status
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

  // Initial booking fetch
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchBookings = async () => {
      setIsSearchingBookings(true);
      const res = await searchBookingsForPaymentAction(bookingSearch);
      if (active && res.success && res.bookings) {
        setBookingOptions(res.bookings);
        if (initialBookingId) {
          const match = res.bookings.find((b) => b.id === initialBookingId);
          if (match) {
            setSelectedBooking(match);
            if (match.agreed_total_centavos) {
              setAgreedTotalPesos((match.agreed_total_centavos / 100).toString());
            }
          }
        }
      }
      if (active) setIsSearchingBookings(false);
    };

    const timer = setTimeout(fetchBookings, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, bookingSearch, initialBookingId]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const currentTotalPaid = selectedBooking?.total_paid_centavos || 0;
  const newAgreedAmountPesos = parseFloat(agreedTotalPesos) || 0;
  const newAgreedCentavos = Math.round(newAgreedAmountPesos * 100);
  const projectedBalanceCentavos = Math.max(0, newAgreedCentavos - currentTotalPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBooking) {
      setError('Please select a booking to declare the agreed total.');
      return;
    }

    if (isNaN(newAgreedAmountPesos) || newAgreedAmountPesos <= 0) {
      setError('Please enter a valid contract amount greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await setAgreedTotalAction({
        bookingId: selectedBooking.id,
        agreedTotalPesos: newAgreedAmountPesos,
        notes: notes.trim() || undefined,
        sendEmailToClient,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to update agreed total');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('[SetAgreedTotalModal Error]:', err);
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            <FileText className="h-4 w-4 text-[#BC6F07]" />
            <h3 className="font-serif font-semibold text-sm sm:text-base">Declare Agreed Total</h3>
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

          {/* 1. Target Booking */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Booking <span className="text-rose-600">*</span>
            </label>

            {selectedBooking ? (
              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2B3817] text-xs">
                    {selectedBooking.client_full_name}{' '}
                    <span className="font-mono text-[11px] font-normal text-stone-500">
                      [{selectedBooking.booking_reference}]
                    </span>
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {selectedBooking.service_title} · Event: {selectedBooking.event_date}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-600">
                    Current Paid to Date: <span className="font-bold text-emerald-800">{formatPesos(selectedBooking.total_paid_centavos)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="text-stone-400 hover:text-stone-700 p-1 text-xs underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search client name or booking reference..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
                />

                {isSearchingBookings && (
                  <div className="p-2 text-center text-stone-400 text-[11px]">Searching bookings...</div>
                )}

                {bookingOptions.length > 0 && !selectedBooking && (
                  <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 shadow-sm">
                    {bookingOptions.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => {
                          setSelectedBooking(b);
                          if (b.agreed_total_centavos) {
                            setAgreedTotalPesos((b.agreed_total_centavos / 100).toString());
                          }
                        }}
                        className="w-full text-left p-2.5 hover:bg-stone-50 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-[#2B3817]">
                            {b.client_full_name}{' '}
                            <span className="font-mono text-stone-400">[{b.booking_reference}]</span>
                          </p>
                          <p className="text-[10px] text-stone-500">{b.service_title}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block">
                            Paid: {formatPesos(b.total_paid_centavos)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Agreed Total Input */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Agreed Contract Total (PHP) <span className="text-rose-600">*</span>
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
                value={agreedTotalPesos}
                onChange={(e) => setAgreedTotalPesos(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Live Balance Preview Box */}
          {selectedBooking && newAgreedAmountPesos > 0 && (
            <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Agreed Total:</span>
                <span className="font-semibold text-stone-900">{formatPesos(newAgreedCentavos)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Total Paid So Far:</span>
                <span className="text-emerald-700 font-semibold">{formatPesos(currentTotalPaid)}</span>
              </div>
              <div className="pt-1 border-t border-stone-200/80 flex justify-between font-bold text-amber-800">
                <span>New Outstanding Balance:</span>
                <span>{formatPesos(projectedBalanceCentavos)}</span>
              </div>
            </div>
          )}

          {/* 4. Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Contract Scope / Billing Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes full day coordination and photo booth add-on"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
            />
          </div>

          {/* 5. Notification Checkbox */}
          <div className="pt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="sendEmailToClient"
              checked={sendEmailToClient}
              onChange={(e) => setSendEmailToClient(e.target.checked)}
              className="rounded-sm border-stone-300 text-[#3A4F1C] focus:ring-[#3A4F1C] cursor-pointer"
            />
            <label htmlFor="sendEmailToClient" className="text-xs text-stone-700 select-none cursor-pointer">
              Send updated pricing quotation email to client
            </label>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Agreed Total</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
