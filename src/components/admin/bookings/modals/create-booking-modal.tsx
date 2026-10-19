'use client';

// =============================================================================
// create-booking-modal.tsx — Create New Event / Booking Modal
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, AlertCircle, Loader2, X, Calendar, MapPin, User, Mail, Phone, Building, Sparkles, FileText } from 'lucide-react';
import type { BookingRecord, AdminCreateBookingInput } from '@/types/booking';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: AdminCreateBookingInput) => Promise<BookingRecord | void>;
}

export function CreateBookingModal({
  isOpen,
  onClose,
  onCreate,
}: CreateBookingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<AdminCreateBookingInput>({
    client_full_name: '',
    client_email: '',
    client_phone: '',
    company_name: '',
    service_title: '',
    category_title: '',
    add_ons_text: '',
    event_date: '',
    venue_city: '',
    venue_address: '',
    special_notes: '',
    admin_notes: '',
    status: 'pending',
  });

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

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event.');
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
        {/* Header */}
        <div className="flex items-center px-4 py-3 sm:px-6 sm:py-4 border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/60">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C]">
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#2B3817]">
                Create New Event
              </h3>
              <p className="text-[10px] sm:text-xs text-[#2B3817]/70">
                Direct entry for private bookings and negotiated events
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            title="Close modal (Esc)"
            className="ml-auto rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 sm:p-3 text-[11px] sm:text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Client Details Section */}
          <div>
            <h4 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70 mb-2 sm:mb-2.5">
              Client Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Client Full Name">
                  <User className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  <span>Full Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={formData.client_full_name}
                  onChange={(e) => setFormData({ ...formData, client_full_name: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Client Email Address">
                  <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  <span>Email</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="client@example.com"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Client Phone Number">
                  <Phone className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  placeholder="+63 9XX XXX XXXX"
                  value={formData.client_phone || ''}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Company or Organization Name">
                  <Building className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  <span>Company / Organization</span>
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Service Details Section */}
          <div className="pt-2 border-t border-stone-200">
            <h4 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70 mb-2 sm:mb-2.5">
              Service & Event Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Service or Event Title">
                  <Sparkles className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  <span>Event Title / Service</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Santos-Reyes Nuptials"
                  value={formData.service_title}
                  onChange={(e) => setFormData({ ...formData, service_title: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-semibold text-stone-700 mb-1 block" title="Category of Event">
                  <span>Category</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Social Events, Digital Advertising, etc."
                  value={formData.category_title}
                  onChange={(e) => setFormData({ ...formData, category_title: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Target Event Date">
                  <Calendar className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  <span>Event Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Venue City or Municipality">
                  <MapPin className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  <span>Venue City</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Makati City, Tagaytay"
                  value={formData.venue_city}
                  onChange={(e) => setFormData({ ...formData, venue_city: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <label className="block text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Venue Full Address">
                Venue Address
              </label>
              <input
                type="text"
                placeholder="Specific venue hall, building, or address"
                value={formData.venue_address || ''}
                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>

            <div className="mt-2.5 sm:mt-3">
              <label className="block text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Add-on services (separated by commas)">
                Add-ons (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Bridal Car, Same-Day-Edit Video, Drone Coverage"
                value={formData.add_ons_text || ''}
                onChange={(e) => setFormData({ ...formData, add_ons_text: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="pt-2 border-t border-stone-200 space-y-2.5 sm:space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Client Notes">
                <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Client Notes & Requests</span>
              </label>
              <textarea
                rows={2}
                placeholder="Client-provided preferences or initial remarks"
                value={formData.special_notes || ''}
                onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-[#3A4F1C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-stone-700 mb-1" title="Internal Admin Team Notes">
                Admin Internal Notes <span className="text-[10px] sm:text-[11px] font-normal text-stone-500">(Private to Team)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Operational notes, negotiated terms, or team coordination status"
                value={formData.admin_notes || ''}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                className="w-full rounded-lg border border-amber-200 bg-amber-50/30 px-2.5 py-1.5 text-[11px] sm:text-xs text-stone-900 focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            {/* Initial Booking Status */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-stone-700 mb-1">
                Initial Status
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] sm:text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="initial_status"
                    value="pending"
                    checked={formData.status === 'pending'}
                    onChange={() => setFormData({ ...formData, status: 'pending' })}
                    className="text-[#3A4F1C] focus:ring-[#3A4F1C]"
                  />
                  <span>Pending (Awaiting decision)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="initial_status"
                    value="confirmed"
                    checked={formData.status === 'confirmed'}
                    onChange={() => setFormData({ ...formData, status: 'confirmed' })}
                    className="text-[#3A4F1C] focus:ring-[#3A4F1C]"
                  />
                  <span>Confirmed (Immediately scheduled)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="ml-auto rounded-lg border border-stone-200 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A4F1C] px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-white shadow-xs hover:bg-[#2B3817] transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Create Event</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
