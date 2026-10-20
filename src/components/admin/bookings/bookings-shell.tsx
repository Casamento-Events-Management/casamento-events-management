'use client';

// =============================================================================
// bookings-shell.tsx — Master Layout Shell for Bookings & Dates Module
// =============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Plus, CheckCircle, AlertCircle, CheckSquare } from 'lucide-react';
import type { BookingRecord, BookingStatus, AdminUpdateBookingPayload, AdminCreateBookingInput } from '@/types/booking';
import {
  acceptBookingAction,
  rejectBookingAction,
  updateBookingDetailsAction,
  createBookingAction,
  getBookingByIdAction,
} from '@/lib/services/admin-booking-actions';
import { PendingBookingsMasterList } from './pending-bookings-master-list';
import { BookingDetailInspector } from './booking-detail-inspector';
import { CreateBookingModal } from './modals/create-booking-modal';
import { CalendarViewShell } from './calendar/calendar-view-shell';
import { TasksViewShell } from './tasks/tasks-view-shell';

interface BookingsShellProps {
  initialBookings: BookingRecord[];
  initialPendingCount?: number;
  currentUserId?: string;
  isSuperAdmin?: boolean;
  isStaff?: boolean;
}

export function BookingsShell({
  initialBookings,
  currentUserId,
  isSuperAdmin,
  isStaff = false,
}: BookingsShellProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'tasks' | 'requests'>('calendar');
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialBookings.find((b) => b.status === 'pending')?.id || initialBookings[0]?.id || null
  );
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compute pending count dynamically from current state
  const pendingCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending' && !b.is_archived).length;
  }, [bookings]);

  // Compute confirmed events count dynamically from current state
  const confirmedCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'confirmed' && !b.is_archived).length;
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

  // Esc key closes mobile detail modal
  useEffect(() => {
    if (!isMobileDetailOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDetailOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDetailOpen]);

  // Keep selection aligned when filter changes
  const handleStatusFilterChange = async (newStatus: BookingStatus | 'all') => {
    setStatusFilter(newStatus);
    const firstMatch = bookings.find((b) => !b.is_archived && (newStatus === 'all' || b.status === newStatus));
    const targetId = firstMatch ? firstMatch.id : null;
    setSelectedId(targetId);

    if (targetId) {
      try {
        const res = await getBookingByIdAction(targetId);
        if (res.success && res.booking) {
          setBookings((prev) =>
            prev.map((b) => (b.id === res.booking!.id ? res.booking! : b))
          );
        }
      } catch (err) {
        console.error('Failed to sync filtered booking data:', err);
      }
    }
  };

  const handleSelectBooking = async (booking: BookingRecord) => {
    setSelectedId(booking.id);
    setIsMobileDetailOpen(true);

    // Fetch authoritative fresh record from database for this specific selected item
    try {
      const res = await getBookingByIdAction(booking.id);
      if (res.success && res.booking) {
        setBookings((prev) =>
          prev.map((b) => (b.id === res.booking!.id ? res.booking! : b))
        );
      }
    } catch (err) {
      console.error('Failed to sync selected booking data:', err);
    }
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
    bookingId?: string;
    updates: AdminUpdateBookingPayload;
    notifyClient: boolean;
    adminMessage?: string;
  }): Promise<void> => {
    const targetId = params.bookingId || selectedBooking?.id;
    if (!targetId) {
      showBanner('error', 'No booking selected to update.');
      throw new Error('No booking selected to update.');
    }
    const res = await updateBookingDetailsAction({
      bookingId: targetId,
      updates: params.updates,
      notifyClient: params.notifyClient,
      adminMessage: params.adminMessage,
    });

    if (!res.success || !res.booking) {
      showBanner('error', res.error || 'Failed to update booking.');
      throw new Error(res.error || 'Failed to update booking.');
    }

    const updated = res.booking;
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showBanner('success', `Details for ${updated.booking_reference} have been updated.`);
  };

  // Handler: Create New Event
  const handleCreateEvent = async (input: AdminCreateBookingInput) => {
    const res = await createBookingAction(input);
    if (!res.success || !res.booking) {
      throw new Error(res.error || 'Failed to create event.');
    }

    setBookings((prev) => [res.booking!, ...prev]);
    setSelectedId(res.booking.id);
    showBanner('success', `New event ${res.booking.booking_reference} created.`);
    return res.booking;
  };

  const handleNoteAppended = (notes: string) => {
    if (!selectedId) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === selectedId ? { ...b, admin_notes: notes } : b))
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Alert if active */}
      {bannerMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium border animate-in fade-in duration-200 ${bannerMessage.type === 'success'
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
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2B3817]">
            Bookings & Dates
          </h1>
        </div>

        {/* Right side "+ New Event" Button */}
        {!isStaff && (
          <div className="ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A4F1C] px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2B3817] transition cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>New Event</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Navigation Tabs */}
      <div className="border-b border-[#3A4F1C]/15 flex items-center gap-6">
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

        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold transition border-b-2 -mb-px ${
            activeTab === 'list'
              ? 'border-[#3A4F1C] text-[#2B3817]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          <span>List</span>
          {confirmedCount > 0 && (
            <span
              className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                activeTab === 'list'
                  ? 'bg-[#3A4F1C] text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {confirmedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold transition border-b-2 -mb-px ${
            activeTab === 'tasks'
              ? 'border-[#3A4F1C] text-[#2B3817]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Tasks</span>
        </button>

        {!isStaff && (
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
        )}
      </div>

      {/* Content Workspace */}
      {activeTab === 'tasks' ? (
        <TasksViewShell
          currentUserId={currentUserId}
          isSuperAdmin={isSuperAdmin}
          isStaff={isStaff}
          onSelectBooking={(b) => {
            setSelectedId(b.id);
            setActiveTab('calendar');
          }}
        />
      ) : activeTab === 'requests' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Master Queue List (Full width on mobile/tablet, ~60% on desktop) */}
          <div className="lg:col-span-7 xl:col-span-7">
            <PendingBookingsMasterList
              bookings={filteredBookings}
              selectedBookingId={selectedId}
              onSelectBooking={handleSelectBooking}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              pendingCount={pendingCount}
            />
          </div>

          {/* Right Column: Embedded Desktop Inspector (Hidden on mobile/tablet) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4">
            <BookingDetailInspector
              booking={selectedBooking}
              onAccept={handleAccept}
              onReject={handleReject}
              onUpdate={handleUpdate}
              isStaff={isStaff}
              onNoteAppended={handleNoteAppended}
            />
          </div>

          {/* Mobile & iPad Modal Popup for Booking Detail Inspector */}
          {isMobileDetailOpen && selectedBooking && (
            <div
              role="dialog"
              aria-modal="true"
              onClick={() => setIsMobileDetailOpen(false)}
              className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg my-6 max-h-[90vh] overflow-hidden"
              >
                <BookingDetailInspector
                  booking={selectedBooking}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onUpdate={handleUpdate}
                  onClose={() => setIsMobileDetailOpen(false)}
                  isStaff={isStaff}
                  onNoteAppended={handleNoteAppended}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Calendar / List View Workspace */
        <CalendarViewShell
          bookings={bookings}
          onBookingsChange={setBookings}
          onUpdateBookingDetails={handleUpdate}
          onNewEventClick={() => setIsCreateModalOpen(true)}
          viewMode={activeTab === 'list' ? 'list' : 'calendar'}
          isStaff={isStaff}
        />
      )}

      {/* New Event Creation Modal */}
      {!isStaff && (
        <CreateBookingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateEvent}
        />
      )}
    </div>
  );
}
