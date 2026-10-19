'use client';

// =============================================================================
// update-booking-modal.tsx — Update Booking Details Form with Diff Preview
// =============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Edit3, AlertCircle, Loader2, X, Mail, User, Phone, Building, Calendar, MapPin, FileText, Globe, Sparkles } from 'lucide-react';
import type { BookingRecord, AdminUpdateBookingPayload } from '@/types/booking';
import { getCountriesList, checkCountryHoliday } from '@/lib/utils/holidayUtils';

interface UpdateBookingModalProps {
  booking: BookingRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    updates: AdminUpdateBookingPayload;
    notifyClient: boolean;
    adminMessage?: string;
  }) => Promise<void>;
}

export function UpdateBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: UpdateBookingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<AdminUpdateBookingPayload>({
    client_full_name: booking.client_full_name,
    client_email: booking.client_email,
    client_phone: booking.client_phone || '',
    company_name: booking.company_name || '',
    event_country: booking.event_country || 'PH',
    event_country_name: booking.event_country_name || 'Philippines',
    event_date: booking.event_date,
    venue_city: booking.venue_city,
    venue_address: booking.venue_address || '',
    special_notes: booking.special_notes || '',
    admin_notes: booking.admin_notes || '',
  });

  const [notifyClient, setNotifyClient] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countriesList = useMemo(() => getCountriesList(), []);

  // Compute today's date in local YYYY-MM-DD
  const todayDateString = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Country-aware holiday check
  const holidayCheck = useMemo(() => {
    if (!formData.event_date) return { isHoliday: false, name: '' };
    return checkCountryHoliday(formData.event_date, formData.event_country || 'PH');
  }, [formData.event_date, formData.event_country]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const match = countriesList.find((c) => c.code === code);
    setFormData((prev) => ({
      ...prev,
      event_country: code,
      event_country_name: match ? match.name : code,
    }));
  };

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

  // Compute what has actually changed
  const getChangedFields = () => {
    const changes: Array<{ label: string; from: string; to: string }> = [];
    if (formData.client_full_name !== booking.client_full_name) {
      changes.push({ label: 'Client Name', from: booking.client_full_name, to: formData.client_full_name || '' });
    }
    if (formData.client_email !== booking.client_email) {
      changes.push({ label: 'Email', from: booking.client_email, to: formData.client_email || '' });
    }
    if ((formData.client_phone || null) !== (booking.client_phone || null)) {
      changes.push({ label: 'Phone', from: booking.client_phone || 'N/A', to: formData.client_phone || 'N/A' });
    }
    if ((formData.event_country || 'PH') !== (booking.event_country || 'PH')) {
      changes.push({
        label: 'Event Country',
        from: booking.event_country_name || booking.event_country || 'Philippines',
        to: formData.event_country_name || formData.event_country || '',
      });
    }
    if (formData.event_date !== booking.event_date) {
      changes.push({ label: 'Event Date', from: booking.event_date, to: formData.event_date || '' });
    }
    if (formData.venue_city !== booking.venue_city) {
      changes.push({ label: 'Target Venue Address', from: booking.venue_city, to: formData.venue_city || '' });
    }
    if ((formData.venue_address || null) !== (booking.venue_address || null)) {
      changes.push({ label: 'Venue Details', from: booking.venue_address || 'None', to: formData.venue_address || 'None' });
    }
    return changes;
  };

  const changedList = getChangedFields();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.event_date && formData.event_date < todayDateString) {
      setError('Please select today or a future date for the event.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm({
        updates: formData,
        notifyClient,
        adminMessage: notifyClient ? adminMessage.trim() || undefined : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking.');
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
        className="relative w-full max-w-xl my-8 rounded-2xl bg-white shadow-xl border border-[#3A4F1C]/20 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center px-6 py-4 border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2B3817]">
                Update Booking Details
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
            title="Close (Esc)"
            className="ml-auto rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Client Full Name">
                <User className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Full Name</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.client_full_name || ''}
                onChange={(e) => setFormData({ ...formData, client_full_name: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Client Email Address">
                <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Email</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.client_email || ''}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Client Phone Number">
                <Phone className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={formData.client_phone || ''}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Company Name">
                <Building className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Company</span>
              </label>
              <input
                type="text"
                value={formData.company_name || ''}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Target Event Country">
                <Globe className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Target Event Country</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.event_country || 'PH'}
                onChange={handleCountryChange}
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden cursor-pointer"
              >
                {countriesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Target Venue Address">
                <MapPin className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Target Venue Address</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.venue_city || ''}
                onChange={(e) => setFormData({ ...formData, venue_city: e.target.value })}
                placeholder="e.g. BGC Taguig, Metro Manila"
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Target Event Date">
                <Calendar className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Target Event Date</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={todayDateString}
                value={formData.event_date || ''}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" title="Specific Venue Hall, Unit or Landmark">
                Venue Details / Hall <span className="text-[11px] font-normal text-stone-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.venue_address || ''}
                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                placeholder="Specific hall, floor, or landmark"
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Country-Aware Holiday Notification Banner */}
          {holidayCheck.isHoliday && (
            <div className="p-2.5 bg-[#BC6F07]/10 border border-[#BC6F07]/30 rounded-lg text-xs text-[#3A4F1C] space-y-0.5 animate-in fade-in duration-150">
              <span className="font-semibold text-[#BC6F07] uppercase block tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Holiday Calendar Notice ({formData.event_country_name || formData.event_country})
              </span>
              <p className="text-stone-700 leading-relaxed">
                Selected date falls on <strong className="text-stone-900">{holidayCheck.name}</strong>. Event scheduling and venue arrangements may encounter holiday logistics or surcharges.
              </p>
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1" title="Special Notes">
              <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
              <span>Client Special Notes</span>
            </label>
            <textarea
              rows={2}
              value={formData.special_notes || ''}
              onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
              placeholder="Special requests or notes from the client"
              className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-900 max-h-28 overflow-y-auto resize-y focus:border-[#3A4F1C] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin Internal Notes <span className="text-[11px] font-normal text-stone-500">(Private to Team)</span>
            </label>
            <textarea
              rows={2}
              value={formData.admin_notes || ''}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              placeholder="Add internal notes, client coordination context, or preferences"
              className="w-full rounded-lg border border-amber-200 bg-amber-50/30 px-3 py-1.5 text-xs text-stone-900 max-h-28 overflow-y-auto resize-y focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          {/* Change Preview Diff */}
          {changedList.length > 0 && (
            <div className="rounded-xl border border-[#3A4F1C]/20 bg-[#F7F3E8]/50 p-3 text-xs space-y-1.5">
              <span className="font-semibold text-[#2B3817] block">Changes to be saved:</span>
              {changedList.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 text-stone-700">
                  <span className="font-medium text-stone-900">{c.label}:</span>
                  <span className="line-through text-stone-400">{c.from}</span>
                  <span className="text-[#3A4F1C] font-semibold">→ {c.to}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notify Client Toggle */}
          <div className="rounded-xl border border-stone-200 p-3.5 space-y-2.5 bg-white">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={(e) => setNotifyClient(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-[#3A4F1C] focus:ring-[#3A4F1C]"
              />
              <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800">
                <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Notify client via email about these changes</span>
              </div>
            </label>
            <p className="text-[11px] text-stone-500 pl-6">
              Keep unchecked for minor internal adjustments or typo corrections.
            </p>

            {notifyClient && (
              <div className="pt-2 border-t border-stone-100 pl-6">
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Optional note to include in client email:
                </label>
                <textarea
                  rows={2}
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="e.g. As discussed over the phone, we have adjusted your event date."
                  className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 max-h-28 overflow-y-auto resize-y focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>
            )}
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
