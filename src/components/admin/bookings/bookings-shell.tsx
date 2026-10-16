'use client';

// =============================================================================
// bookings-shell.tsx — Master Layout Shell for Bookings & Dates Module
// =============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import type { BookingRecord, BookingStatus, AdminUpdateBookingPayload } from '@/types/booking';
import {
  acceptBookingAction,
  rejectBookingAction,
  updateBookingDetailsAction,
} from '@/lib/services/admin-booking-actions';
import { PendingBookingsMasterList } from './pending-bookings-master-list';
import { BookingDetailInspector } from './booking-detail-inspector';

interface BookingsShellProps {
  initialBookings: BookingRecord[];
  initialPendingCount?: number;
}

export function BookingsShell({
  initialBookings,
}: BookingsShellProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'calendar'>('requests');
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialBookings.find((b) => b.status === 'pending')?.id || initialBookings[0]?.id || null
  );
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compute pending count dynamically from current state
  const pendingCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending' && !b.is_archived).length;
  }, [bookings]);

  // Filter bookings based on status and search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.is_archived) return false;

      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase().trim();
        const matchesRef = b.booking_reference.toLowerCase().includes(query);
        const matchesName = b.client_full_name.toLowerCase().includes(query);
        const matchesEmail = b.client_email.toLowerCase().includes(query);
        const matchesService = b.service_title.toLowerCase().includes(query);
        const matchesCity = b.venue_city.toLowerCase().includes(query);
        return matchesRef || matchesName || matchesEmail || matchesService || matchesCity;
      }

      return true;
    });
  }, [bookings, statusFilter, searchTerm]);

  // Currently inspected booking record
  const selectedBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedId) || null;
  }, [bookings, selectedId]);

  // Keep selection aligned when filter changes
  const handleStatusFilterChange = (newStatus: BookingStatus | 'all') => {
    setStatusFilter(newStatus);
    const firstMatch = bookings.find((b) => !b.is_archived && (newStatus === 'all' || b.status === newStatus));
    setSelectedId(firstMatch ? firstMatch.id : null);
  };

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 5000);
  };

  // Handler: Accept Booking
  const handleAccept = async (params: { notifyClient: boolean; adminMessage?: string }) => {
    if (!selectedBooking) return;
    const res = await acceptBookingAction({
      bookingId: selectedBooking.id,
      notifyClient: params.notifyClient,
      adminMessage: params.adminMessage,
    });

    if (!res.success || !res.booking) {
      showBanner('error', res.error || 'Failed to accept booking.');
      return;
    }

    setBookings((prev) => prev.map((b) => (b.id === res.booking!.id ? res.booking! : b)));
    showBanner('success', `Booking ${res.booking.booking_reference} accepted and confirmed.`);
  };

  // Handler: Reject Booking
  const handleReject = async (params: { reason: string; notifyClient: boolean }) => {
    if (!selectedBooking) return;
    const res = await rejectBookingAction({
      bookingId: selectedBooking.id,
      reason: params.reason,
      notifyClient: params.notifyClient,
    });

    if (!res.success || !res.booking) {
      showBanner('error', res.error || 'Failed to decline booking.');
      return;
    }

    setBookings((prev) => prev.map((b) => (b.id === res.booking!.id ? res.booking! : b)));
    showBanner('success', `Booking ${res.booking.booking_reference} has been declined.`);
  };

  // Handler: Update Booking Details
  const handleUpdate = async (params: {
    updates: AdminUpdateBookingPayload;
    notifyClient: boolean;
    adminMessage?: string;
  }) => {
    if (!selectedBooking) return;
    const res = await updateBookingDetailsAction({
      bookingId: selectedBooking.id,
      updates: params.updates,
      notifyClient: params.notifyClient,
      adminMessage: params.adminMessage,
    });

    if (!res.success || !res.booking) {
      showBanner('error', res.error || 'Failed to update booking.');
      return;
    }

    setBookings((prev) => prev.map((b) => (b.id === res.booking!.id ? res.booking! : b)));
    showBanner('success', `Details for ${res.booking.booking_reference} have been updated.`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Alert if active */}
      {bannerMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium border animate-in fade-in duration-200 ${
            bannerMessage.type === 'success'
              ? 'bg-[#3A4F1C]/10 text-[#2B3817] border-[#3A4F1C]/20'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {bannerMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-[#3A4F1C] shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2B3817]">
            Bookings & Dates
          </h1>
          <p className="mt-0.5 text-xs text-[#2B3817]/70">
            Review pending booking requests, accept to confirm, or manage event dates.
          </p>
        </div>

        {/* Top-Right "+ New Event" Button */}
        <div>
          <Link
            href="/book"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A4F1C] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2B3817] transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Link>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="border-b border-[#3A4F1C]/15 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold transition border-b-2 -mb-px ${
            activeTab === 'requests'
              ? 'border-[#3A4F1C] text-[#2B3817]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Requests</span>
          {pendingCount > 0 && (
            <span
              className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                activeTab === 'requests'
                  ? 'bg-[#BC6F07] text-white'
                  : 'bg-[#BC6F07]/15 text-[#BC6F07]'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold transition border-b-2 -mb-px ${
            activeTab === 'calendar'
              ? 'border-[#3A4F1C] text-[#2B3817]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>Calendar</span>
        </button>
      </div>

      {/* Content Workspace */}
      {activeTab === 'requests' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Master Queue List (~60-65% width) */}
          <div className="lg:col-span-7 xl:col-span-7">
            <PendingBookingsMasterList
              bookings={filteredBookings}
              selectedBookingId={selectedId}
              onSelectBooking={(b) => setSelectedId(b.id)}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              pendingCount={pendingCount}
            />
          </div>

          {/* Right Column: Active Booking Inspector (~35-40% width) */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4">
            <BookingDetailInspector
              booking={selectedBooking}
              onAccept={handleAccept}
              onReject={handleReject}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      ) : (
        /* Calendar View Workspace (Feature 2 Preparation) */
        <div className="rounded-2xl border border-dashed border-[#3A4F1C]/25 bg-white/60 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3A4F1C]/10 text-[#3A4F1C] mx-auto mb-3">
            <CalendarIcon className="h-7 w-7" />
          </div>
          <h2 className="text-base font-serif font-bold text-[#2B3817]">
            Upcoming Events Calendar
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#2B3817]/70 leading-relaxed">
            All accepted and confirmed bookings from the Requests tab will be visualized here in monthly, weekly, and day schedule views (Feature 2).
          </p>
        </div>
      )}
    </div>
  );
}
