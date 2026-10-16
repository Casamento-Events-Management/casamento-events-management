'use client';

// =============================================================================
// pending-bookings-master-list.tsx — Left Column Master Queue of Bookings
// =============================================================================

import React from 'react';
import { Search, Calendar, MapPin, Inbox, Clock } from 'lucide-react';
import type { BookingRecord, BookingStatus } from '@/types/booking';

interface PendingBookingsMasterListProps {
  bookings: BookingRecord[];
  selectedBookingId: string | null;
  onSelectBooking: (booking: BookingRecord) => void;
  statusFilter: BookingStatus | 'all';
  onStatusFilterChange: (status: BookingStatus | 'all') => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  pendingCount: number;
}

export function PendingBookingsMasterList({
  bookings,
  selectedBookingId,
  onSelectBooking,
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchChange,
  pendingCount,
}: PendingBookingsMasterListProps) {
  const filterPills: Array<{ label: string; value: BookingStatus | 'all'; count?: number }> = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending', count: pendingCount },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Declined', value: 'cancelled' },
  ];

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center rounded-full bg-[#BC6F07]/10 px-2 py-0.5 text-[11px] font-medium text-[#BC6F07] border border-[#BC6F07]/20">
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center rounded-full bg-[#3A4F1C]/10 px-2 py-0.5 text-[11px] font-medium text-[#3A4F1C] border border-[#3A4F1C]/20">
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 border border-red-200">
            Declined
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 border border-stone-200">
            Completed
          </span>
        );
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by reference, client, service, or city..."
          className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterPills.map((pill) => {
          const isActive = statusFilter === pill.value;
          return (
            <button
              key={pill.value}
              type="button"
              onClick={() => onStatusFilterChange(pill.value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition shrink-0 ${
                isActive
                  ? 'bg-[#3A4F1C] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{pill.label}</span>
              {pill.count !== undefined && pill.count > 0 && (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#BC6F07]/15 text-[#BC6F07]'
                  }`}
                >
                  {pill.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings Queue List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[360px]">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-stone-200 bg-white/50 p-6 text-center">
            <Inbox className="h-8 w-8 text-stone-300 mb-2" />
            <p className="text-xs font-medium text-stone-600">No bookings found</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No reservations in this status category.'}
            </p>
          </div>
        ) : (
          bookings.map((booking) => {
            const isSelected = booking.id === selectedBookingId;
            return (
              <div
                key={booking.id}
                onClick={() => onSelectBooking(booking)}
                className={`group cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                  isSelected
                    ? 'border-[#3A4F1C] bg-[#F7F3E8]/80 shadow-xs ring-1 ring-[#3A4F1C]/20'
                    : 'border-stone-200/90 bg-white hover:border-[#3A4F1C]/40 hover:bg-stone-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold text-stone-900 group-hover:text-[#3A4F1C] transition">
                      {booking.client_full_name}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                      {booking.booking_reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                      {booking.category_title}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#3A4F1C]" />
                    <span className="font-medium text-stone-700">{formatShortDate(booking.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#3A4F1C]" />
                    <span>{booking.venue_city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400 ml-auto">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
