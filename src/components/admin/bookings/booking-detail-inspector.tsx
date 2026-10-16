'use client';

// =============================================================================
// booking-detail-inspector.tsx — Right Column Booking Inspection Card
// =============================================================================

import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Building,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import type { BookingRecord, AdminUpdateBookingPayload } from '@/types/booking';
import { BookingPaymentPlaceholder } from './booking-payment-placeholder';
import { AcceptBookingModal } from './modals/accept-booking-modal';
import { RejectBookingModal } from './modals/reject-booking-modal';
import { UpdateBookingModal } from './modals/update-booking-modal';

interface BookingDetailInspectorProps {
  booking: BookingRecord | null;
  onAccept: (params: { notifyClient: boolean; adminMessage?: string }) => Promise<void>;
  onReject: (params: { reason: string; notifyClient: boolean }) => Promise<void>;
  onUpdate: (params: {
    updates: AdminUpdateBookingPayload;
    notifyClient: boolean;
    adminMessage?: string;
  }) => Promise<void>;
}

export function BookingDetailInspector({
  booking,
  onAccept,
  onReject,
  onUpdate,
}: BookingDetailInspectorProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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

  const statusBadges = {
    pending: {
      label: 'Awaiting Decision',
      style: 'bg-[#BC6F07]/10 text-[#BC6F07] border-[#BC6F07]/30',
    },
    confirmed: {
      label: 'Confirmed',
      style: 'bg-[#3A4F1C]/10 text-[#3A4F1C] border-[#3A4F1C]/30',
    },
    cancelled: {
      label: 'Declined',
      style: 'bg-red-50 text-red-700 border-red-200',
    },
    completed: {
      label: 'Completed',
      style: 'bg-stone-100 text-stone-700 border-stone-300',
    },
  };

  const badge = statusBadges[booking.status] || statusBadges.pending;

  // Format event date for display (e.g., "Friday, October 24, 2026")
  const formatEventDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Header Card */}
      <div className="border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/40 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70">
              Target Event Date
            </span>
            <h2 className="text-base font-serif font-bold text-[#2B3817] mt-0.5">
              {formatEventDate(booking.event_date)}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-mono text-stone-600">
                {booking.booking_reference}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(booking.booking_reference, 'ref')}
                title="Copy Reference"
                className="text-stone-400 hover:text-[#3A4F1C] transition"
              >
                {copiedKey === 'ref' ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.style}`}
          >
            {badge.label}
          </span>
        </div>

        {booking.is_holiday_date && booking.holiday_name && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 border border-amber-200">
            <Sparkles className="h-3.5 w-3.5 text-[#BC6F07] shrink-0" />
            <span>Target date coincides with holiday: <strong>{booking.holiday_name}</strong></span>
          </div>
        )}
      </div>

      {/* Main Inspection Body */}
      <div className="p-5 space-y-5 overflow-y-auto flex-1">
        {/* Client Contact Block */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70 mb-2.5">
            Client Details
          </h4>
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3.5 space-y-2 text-xs">
            <div className="font-semibold text-stone-900 text-sm">
              {booking.client_full_name}
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1.5 text-stone-500">
                <Mail className="h-3.5 w-3.5 text-[#3A4F1C]" />
                Email:
              </span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-stone-900">{booking.client_email}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(booking.client_email, 'email')}
                  className="text-stone-400 hover:text-[#3A4F1C]"
                >
                  {copiedKey === 'email' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {booking.client_phone && (
              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center gap-1.5 text-stone-500">
                  <Phone className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  Phone:
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-stone-900">{booking.client_phone}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(booking.client_phone || '', 'phone')}
                    className="text-stone-400 hover:text-[#3A4F1C]"
                  >
                    {copiedKey === 'phone' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            )}

            {booking.company_name && (
              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center gap-1.5 text-stone-500">
                  <Building className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  Company:
                </span>
                <span className="font-medium text-stone-900">{booking.company_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Specification Block */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#3A4F1C]/70 mb-2.5">
            Event & Service Requirements
          </h4>
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3.5 space-y-2.5 text-xs">
            <div>
              <span className="text-stone-500 block text-[11px]">Requested Service</span>
              <p className="font-semibold text-stone-900 text-sm mt-0.5">
                {booking.service_title}
              </p>
              <span className="inline-block mt-1 text-[11px] font-medium text-[#3A4F1C] bg-[#3A4F1C]/10 px-2 py-0.5 rounded-full">
                {booking.category_title}
              </span>
            </div>

            {booking.selected_add_ons && booking.selected_add_ons.length > 0 && (
              <div>
                <span className="text-stone-500 block text-[11px] mb-1">Add-ons Selected:</span>
                <div className="flex flex-wrap gap-1.5">
                  {booking.selected_add_ons.map((addon, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-white border border-stone-200 px-2 py-0.5 text-[11px] text-stone-700"
                    >
                      {addon.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200/60">
              <span className="flex items-center gap-1 text-stone-500 text-[11px]">
                <MapPin className="h-3.5 w-3.5 text-[#3A4F1C]" />
                Venue Location:
              </span>
              <p className="font-medium text-stone-900 mt-0.5">
                {booking.venue_city}
                {booking.venue_address && <span className="text-stone-600 block">{booking.venue_address}</span>}
              </p>
            </div>

            {booking.special_notes && (
              <div className="pt-2 border-t border-stone-200/60">
                <span className="flex items-center gap-1 text-stone-500 text-[11px]">
                  <FileText className="h-3.5 w-3.5 text-[#3A4F1C]" />
                  Client Special Notes:
                </span>
                <p className="mt-1 text-stone-800 italic bg-white p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                  &ldquo;{booking.special_notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Future-Ready Payment Placeholder */}
        <BookingPaymentPlaceholder />

        {/* Rejection / Decision Log if already decided */}
        {booking.rejection_reason && (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 text-xs text-red-900">
            <div className="flex items-center gap-1.5 font-semibold text-red-800 mb-1">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>Decline Reason</span>
            </div>
            <p className="leading-relaxed">{booking.rejection_reason}</p>
          </div>
        )}

        {/* Internal Admin Notes */}
        {booking.admin_notes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 text-xs text-stone-800">
            <span className="font-semibold text-amber-900 block mb-1">Internal Team Notes:</span>
            <p className="leading-relaxed whitespace-pre-wrap">{booking.admin_notes}</p>
          </div>
        )}

        <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
          <span>Created: {new Date(booking.created_at).toLocaleString()}</span>
          <span>Last updated: {new Date(booking.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="border-t border-[#3A4F1C]/10 bg-[#F7F3E8]/30 p-4">
        {booking.status === 'pending' ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setIsAcceptModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3A4F1C] py-2.5 px-3 text-xs font-semibold text-white shadow-xs hover:bg-[#2B3817] transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Accept Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRejectModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white py-2.5 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
            >
              <XCircle className="h-4 w-4" />
              <span>Decline</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
              title="Edit booking details"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-xs text-stone-500">
              {booking.status === 'confirmed' ? 'Event is confirmed and scheduled.' : 'This reservation was declined.'}
            </div>
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white py-2 px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Dialogs */}
      <AcceptBookingModal
        booking={booking}
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={onAccept}
      />

      <RejectBookingModal
        booking={booking}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={onReject}
      />

      <UpdateBookingModal
        booking={booking}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onConfirm={onUpdate}
      />
    </div>
  );
}
