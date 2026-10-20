'use client';

// =============================================================================
// booking-detail-inspector.tsx — Booking Inspection Card & Mobile Modal Panel
// =============================================================================

import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Building,
  FileText,
  CheckCircle2,
  XCircle,
  Edit3,
  Copy,
  Check,
  ShieldAlert,
  Calendar,
  User,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { BookingRecord, AdminUpdateBookingPayload } from '@/types/booking';
import { BookingPaymentPlaceholder } from './booking-payment-placeholder';
import { AcceptBookingModal } from './modals/accept-booking-modal';
import { RejectBookingModal } from './modals/reject-booking-modal';
import { UpdateBookingModal } from './modals/update-booking-modal';
import { appendBookingNoteAction } from '@/lib/services/admin-booking-actions';

interface BookingDetailInspectorProps {
  booking: BookingRecord | null;
  onAccept: (params: { notifyClient: boolean; adminMessage?: string }) => Promise<void>;
  onReject: (params: { reason: string; notifyClient: boolean }) => Promise<void>;
  onUpdate: (params: {
    updates: AdminUpdateBookingPayload;
    notifyClient: boolean;
    adminMessage?: string;
  }) => Promise<void>;
  onClose?: () => void;
  isStaff?: boolean;
  onNoteAppended?: (updatedNotes: string) => void;
}

export function BookingDetailInspector({
  booking,
  onAccept,
  onReject,
  onUpdate,
  onClose,
  isStaff = false,
  onNoteAppended,
}: BookingDetailInspectorProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [localNotes, setLocalNotes] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[420px] rounded-2xl border border-dashed border-[#3A4F1C]/20 bg-white/70 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C] mb-3">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-serif font-bold text-[#2B3817]">No Booking Selected</h3>
        <p className="mt-1 max-w-xs text-xs text-[#2B3817]/70 leading-relaxed">
          Select a booking from the list to inspect client information, review event requests, and make decisions.
        </p>
      </div>
    );
  }

  // Format event date for display (e.g., "Friday, October 24, 2026")
  const formatEventDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-140px)]">
      {/* Top Header Card */}
      <div className="border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/40 p-3.5 sm:p-5">
        <div className="flex items-start gap-3">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70 block">
              Target Event Date
            </span>
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#2B3817] mt-0.5">
              {formatEventDate(booking.event_date)}
            </h2>
          </div>

          {/* Event code in the status badge's current position (NO badge) */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-stone-800" title="Event Code">
              {booking.booking_reference}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(booking.booking_reference, 'ref')}
              title="Copy event code"
              className="rounded p-1 text-stone-400 hover:text-[#3A4F1C] hover:bg-stone-100 transition"
            >
              {copiedKey === 'ref' ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close panel"
                className="ml-1 rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {booking.is_holiday_date && booking.holiday_name && (
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs text-amber-800 border border-amber-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>
              Target date coincides with holiday{booking.event_country_name ? ` (${booking.event_country_name})` : ''}: <strong>{booking.holiday_name}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Inspection Body */}
      <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-5 overflow-y-auto flex-1">
        {/* Client Details Block */}
        <div>
          <h4 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70 mb-2 sm:mb-2.5">
            Client Details
          </h4>
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
            {/* Full Name */}
            <div className="flex items-center gap-2">
              <span title="Full Name" className="shrink-0 inline-flex">
                <User className="h-3.5 w-3.5 text-[#3A4F1C]" />
              </span>
              <span className="font-semibold text-stone-900">{booking.client_full_name || 'N/A'}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-stone-700">
              <span title="Email Address" className="shrink-0 inline-flex">
                <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
              </span>
              <span className="font-medium text-stone-900">{booking.client_email || 'N/A'}</span>
              {booking.client_email && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(booking.client_email, 'email')}
                  title="Copy email"
                  className="text-stone-400 hover:text-[#3A4F1C]"
                >
                  {copiedKey === 'email' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-stone-700">
              <span title="Phone Number" className="shrink-0 inline-flex">
                <Phone className="h-3.5 w-3.5 text-[#3A4F1C]" />
              </span>
              <span className="font-medium text-stone-900">
                {booking.client_phone && booking.client_phone.trim() ? booking.client_phone : 'N/A'}
              </span>
              {booking.client_phone && booking.client_phone.trim() && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(booking.client_phone || '', 'phone')}
                  title="Copy phone"
                  className="text-stone-400 hover:text-[#3A4F1C]"
                >
                  {copiedKey === 'phone' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>

            {/* Company */}
            <div className="flex items-center gap-2 text-stone-700">
              <span title="Company / Organization" className="shrink-0 inline-flex">
                <Building className="h-3.5 w-3.5 text-[#3A4F1C]" />
              </span>
              <span className="text-stone-900">
                {booking.company_name && booking.company_name.trim() ? booking.company_name : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Event Specification Block */}
        <div>
          <h4 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70 mb-2 sm:mb-2.5">
            Event & Service Requirements
          </h4>
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs">
            {/* Service & Category Title */}
            <div>
              <div className="font-semibold text-stone-900 text-xs sm:text-sm">{booking.service_title}</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-[#3A4F1C]" title="Category">
                {booking.category_title}
              </div>
            </div>

            {/* Add-ons Selected on the exact same line */}
            {booking.selected_add_ons && booking.selected_add_ons.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-stone-500 font-medium text-[10px] sm:text-[11px]">Add-ons Selected:</span>
                {booking.selected_add_ons.map((addon, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-white border border-stone-200 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] text-stone-700 font-medium"
                  >
                    {addon.title}
                  </span>
                ))}
              </div>
            )}

            {/* Venue */}
            <div className="flex items-start gap-2 pt-2 border-t border-stone-200/60">
              <span title="Venue Location" className="shrink-0 inline-flex mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-[#3A4F1C]" />
              </span>
              <div>
                <span className="font-medium text-stone-900 text-xs sm:text-xs">
                  {booking.venue_city}{booking.event_country_name ? `, ${booking.event_country_name}` : ''}
                </span>
                {booking.venue_address && (
                  <span className="text-stone-600 block text-[10px] sm:text-[11px]">{booking.venue_address}</span>
                )}
              </div>
            </div>

            {/* Special Notes */}
            {booking.special_notes && (
              <div className="flex items-start gap-2 pt-2 border-t border-stone-200/60">
                <span title="Client Special Notes" className="shrink-0 inline-flex mt-0.5">
                  <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
                </span>
                <p className="text-stone-800 italic bg-white p-2 sm:p-2.5 rounded-lg border border-stone-200/60 leading-relaxed flex-1 text-[11px] sm:text-xs max-h-28 overflow-y-auto">
                  &ldquo;{booking.special_notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Future-Ready Payment Placeholder (Hidden for Staff) */}
        {!isStaff && <BookingPaymentPlaceholder />}

        {/* Rejection Log */}
        {booking.rejection_reason && (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-2.5 sm:p-3.5 text-[11px] sm:text-xs text-red-900">
            <div className="flex items-center gap-1.5 font-semibold text-red-800 mb-1">
              <span title="Decline Reason" className="shrink-0 inline-flex">
                <ShieldAlert className="h-4 w-4 text-red-600" />
              </span>
              <span>Decline Reason</span>
            </div>
            <p className="leading-relaxed max-h-28 overflow-y-auto">{booking.rejection_reason}</p>
          </div>
        )}

        {/* Internal Admin Notes */}
        {(localNotes ?? booking.admin_notes) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 sm:p-3.5 text-[11px] sm:text-xs text-stone-800">
            <span className="font-semibold text-amber-900 block mb-1">Internal Team Notes:</span>
            <p className="leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">{localNotes ?? booking.admin_notes}</p>
          </div>
        )}

        <div className="text-[10px] sm:text-[11px] text-stone-400 flex items-center gap-4 pt-1">
          <span>Created: {new Date(booking.created_at).toLocaleDateString()}</span>
          <span>Updated: {new Date(booking.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="border-t border-[#3A4F1C]/10 bg-[#F7F3E8]/30 p-3 sm:p-4">
        {isStaff ? (
          <div className="space-y-2">
            {!isAddingNote ? (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-medium">

                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNote(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A4F1C]/30 bg-white py-1.5 px-3 text-[11px] font-semibold text-[#3A4F1C] hover:bg-[#3A4F1C]/10 transition cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>+ Add Operational Note</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Enter internal operational note for this event..."
                  rows={2}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#3A4F1C] focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSubmittingNote}
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteText('');
                    }}
                    className="px-2.5 py-1 text-[11px] text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingNote || !newNoteText.trim()}
                    onClick={async () => {
                      if (!newNoteText.trim()) return;
                      setIsSubmittingNote(true);
                      try {
                        const res = await appendBookingNoteAction({
                          bookingId: booking.id,
                          note: newNoteText.trim(),
                        });
                        if (res.success && res.adminNotes) {
                          setLocalNotes(res.adminNotes);
                          if (onNoteAppended) onNoteAppended(res.adminNotes);
                          setIsAddingNote(false);
                          setNewNoteText('');
                        }
                      } catch (err) {
                        console.error('[AddNote Error]:', err);
                      } finally {
                        setIsSubmittingNote(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#3A4F1C] text-white text-[11px] font-semibold hover:bg-[#2B3817] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : booking.status === 'pending' ? (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAcceptModalOpen(true)}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3A4F1C] py-2 sm:py-2.5 px-3 text-[11px] sm:text-xs font-semibold text-white shadow-xs hover:bg-[#2B3817] transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Accept Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRejectModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white py-2 sm:py-2.5 px-3 text-[11px] sm:text-xs font-semibold text-red-700 hover:bg-red-50 transition"
            >
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Decline</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white py-2 sm:py-2.5 px-3 text-[11px] sm:text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
              title="Edit booking details"
            >
              <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Edit</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-[11px] sm:text-xs text-stone-500">
              {booking.status === 'confirmed' ? 'Event is confirmed and scheduled.' : 'This reservation was declined.'}
            </div>
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white py-1.5 sm:py-2 px-2.5 sm:px-3 text-[11px] sm:text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Dialogs */}
      {isAcceptModalOpen && (
        <AcceptBookingModal
          key={`${booking.id}-accept`}
          booking={booking}
          isOpen={isAcceptModalOpen}
          onClose={() => setIsAcceptModalOpen(false)}
          onConfirm={onAccept}
        />
      )}

      {isRejectModalOpen && (
        <RejectBookingModal
          key={`${booking.id}-reject`}
          booking={booking}
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={onReject}
        />
      )}

      {isUpdateModalOpen && (
        <UpdateBookingModal
          key={`${booking.id}-update`}
          booking={booking}
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onConfirm={onUpdate}
        />
      )}
    </div>
  );
}
