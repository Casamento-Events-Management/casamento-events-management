'use client';

// =============================================================================
// components/admin/payments/modals/record-payment-modal.tsx — Record Manual Payment
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  AlertCircle,
  Loader2,
  Search,
  UploadCloud,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  formatPesos,
  handleNumberInputKeyDown,
  sanitizeNumberInput,
} from '@/lib/utils/currencyUtils';
import {
  recordManualPaymentAction,
  searchBookingsForPaymentAction,
} from '@/lib/services/admin-payment-actions';
import { PAYMENT_METHODS } from '@/types/payment';

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
  status?: string;
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialBookingId?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  initialBookingId,
}: RecordPaymentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Booking Search & Selection
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingOption | null>(null);
  const [isSearchingBookings, setIsSearchingBookings] = useState(false);

  // Form Fields
  const [amountPesos, setAmountPesos] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [paidAt, setPaidAt] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [bankName, setBankName] = useState<string>('BDO');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sendReceiptEmail, setSendReceiptEmail] = useState<boolean>(true);

  // Proof File State
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Full form state reset (ensures zero state bleeding between sessions)
  const resetForm = () => {
    setBookingSearch('');
    setSelectedBooking(null);
    setAmountPesos('');
    setPaymentMethod('bank_transfer');
    setPaidAt(new Date().toISOString().slice(0, 10));
    setBankName('BDO');
    setReferenceNumber('');
    setSenderName('');
    setNotes('');
    setSendReceiptEmail(true);
    setProofFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 1. Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // 2. Esc Key & Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 3. Initial Booking Fetch
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchInitial = async () => {
      setIsSearchingBookings(true);
      const res = await searchBookingsForPaymentAction(bookingSearch);
      if (active && res.success && res.bookings) {
        // Only include bookings that have an agreed total declared and an outstanding balance
        const eligible = res.bookings.filter(
          (b) =>
            b.agreed_total_centavos !== null &&
            b.agreed_total_centavos > 0 &&
            b.remaining_balance_centavos !== null &&
            b.remaining_balance_centavos > 0
        );
        setBookingOptions(eligible);
        if (initialBookingId) {
          const match = eligible.find((b) => b.id === initialBookingId);
          if (match) setSelectedBooking(match);
        }
      }
      if (active) setIsSearchingBookings(false);
    };

    const timer = setTimeout(fetchInitial, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, bookingSearch, initialBookingId]);

  // Outside click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Proof attachment file size cannot exceed 10MB.');
      return;
    }

    setProofFile(file);
    setError(null);
  };

  const handleRemoveFile = () => {
    setProofFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const maxAllowedPesos = selectedBooking
    ? (selectedBooking.remaining_balance_centavos !== null
      ? selectedBooking.remaining_balance_centavos / 100
      : (selectedBooking.agreed_total_centavos || 0) / 100)
    : 0;

  const currentAmountNum = parseFloat(amountPesos) || 0;
  const isAmountExceeded = selectedBooking && maxAllowedPesos > 0 && currentAmountNum > maxAllowedPesos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBooking) {
      setError('Please select a booking to link this payment.');
      return;
    }

    const numAmount = parseFloat(amountPesos);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (maxAllowedPesos > 0 && numAmount > maxAllowedPesos) {
      setError(
        `Payment amount (${formatPesos(numAmount * 100)}) cannot exceed the outstanding balance of ${formatPesos(selectedBooking.remaining_balance_centavos)}.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedProofMetadata: {
        path: string;
        name: string;
        sizeBytes: number;
        mimeType: string;
      } | null = null;

      // Upload proof file to Supabase Storage if provided
      if (proofFile) {
        const supabase = createClient();
        const timestamp = Date.now();
        const cleanName = proofFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `proofs/${selectedBooking.booking_reference}/${timestamp}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(storagePath, proofFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload proof of payment: ${uploadError.message}`);
        }

        uploadedProofMetadata = {
          path: storagePath,
          name: proofFile.name,
          sizeBytes: proofFile.size,
          mimeType: proofFile.type,
        };
      }

      // Record payment via server action
      const res = await recordManualPaymentAction({
        bookingId: selectedBooking.id,
        amountPesos: numAmount,
        paymentMethod,
        paidAt,
        channelDetails: {
          bankName: paymentMethod === 'bank_transfer' ? bankName : undefined,
          referenceNumber: referenceNumber.trim() || undefined,
          senderName: senderName.trim() || undefined,
        },
        notes: notes.trim() || undefined,
        proofAttachment: uploadedProofMetadata,
        sendReceiptEmail,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to record payment');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[RecordPaymentModal Error]:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while recording payment.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-xl overflow-hidden my-3 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#3A4F1C] text-[#F7F3E8] shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#BC6F07]" />
            <h3 className="font-serif font-semibold text-xs sm:text-sm">Record Payment</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-[#F7F3E8]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-2.5 text-xs text-stone-700 overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Select Booking */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Target Booking <span className="text-rose-600">*</span>
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
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="text-stone-600">
                      Agreed: {formatPesos(selectedBooking.agreed_total_centavos)}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="font-semibold text-amber-700">
                      Balance: {formatPesos(selectedBooking.remaining_balance_centavos)}
                    </span>
                  </div>
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

                {!isSearchingBookings && bookingOptions.length === 0 && !selectedBooking && (
                  <div className="mt-1.5 p-3 rounded-xl border border-amber-200 bg-amber-50/60 text-center text-xs text-amber-800 space-y-1">
                    <p className="font-semibold">No bookings awaiting payment</p>
                    <p className="text-[11px] text-amber-700">
                      To record a payment, the booking must have an Agreed Total declared and an outstanding balance.
                    </p>
                  </div>
                )}

                {bookingOptions.length > 0 && !selectedBooking && (
                  <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 shadow-sm">
                    {bookingOptions.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="w-full text-left p-3 hover:bg-stone-50 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-[#2B3817]">
                            {b.client_full_name}{' '}
                            <span className="font-mono text-stone-400">[{b.booking_reference}]</span>
                          </p>
                          <p className="text-[10px] text-stone-500">{b.service_title}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block">Bal: {formatPesos(b.remaining_balance_centavos)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Amount & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                  Amount (PHP) <span className="text-rose-600">*</span>
                </label>
                {selectedBooking && maxAllowedPesos > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountPesos(maxAllowedPesos.toFixed(2))}
                    className="text-[10px] text-[#3A4F1C] hover:underline font-semibold cursor-pointer"
                  >
                    Set Full Balance ({formatPesos(selectedBooking.remaining_balance_centavos)})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-xs">
                  ₱
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={amountPesos}
                  onKeyDown={handleNumberInputKeyDown}
                  onChange={(e) => setAmountPesos(sanitizeNumberInput(e.target.value))}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-hidden ${isAmountExceeded
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-700'
                      : 'border-stone-200 focus:ring-1 focus:ring-[#3A4F1C]'
                    }`}
                />
              </div>
              {isAmountExceeded && (
                <p className="text-[10px] text-rose-600 font-semibold">
                  Amount cannot exceed remaining balance of {formatPesos(selectedBooking?.remaining_balance_centavos)}.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Payment Method <span className="text-rose-600">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden capitalize cursor-pointer"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Date Paid & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Date Received
              </label>
              <input
                type="date"
                required
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Reference # (Optional)
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. Bank slip or GCash Ref"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Channel Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-1">
                <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                  Bank Channel
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. BDO Unibank, BPI, Metrobank"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Sender / Account Name (Optional)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
              />
            </div>
          </div>

          {/* 4. Optional Proof of Payment Upload */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Proof of Payment (Optional)</span>
              <span className="text-stone-400 font-normal">JPG, PNG, PDF (Max 10MB)</span>
            </label>

            {proofFile ? (
              <div className="p-2 sm:p-2.5 bg-white border border-stone-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span className="font-medium text-xs truncate">{proofFile.name}</span>
                  <span className="text-[10px] text-stone-400">
                    ({(proofFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#3A4F1C]/40 bg-white/60 p-2.5 rounded-xl text-center cursor-pointer transition"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <UploadCloud className="h-4 w-4 text-stone-400" />
                  <p className="text-xs text-stone-600 font-medium">
                    Attach deposit slip or screenshot
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* 5. Internal Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Second installment downpayment"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#3A4F1C] focus:outline-hidden"
            />
          </div>

          {/* 6. Receipt Checkbox */}
          <div className="pt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="sendReceiptEmail"
              checked={sendReceiptEmail}
              onChange={(e) => setSendReceiptEmail(e.target.checked)}
              className="rounded-sm border-stone-300 text-[#3A4F1C] focus:ring-[#3A4F1C] cursor-pointer"
            />
            <label htmlFor="sendReceiptEmail" className="text-xs text-stone-700 select-none cursor-pointer">
              Email payment acknowledgment receipt to client registered address
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isAmountExceeded || !amountPesos || currentAmountNum <= 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#3A4F1C] hover:bg-[#2B3817] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <span>Record Payment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
