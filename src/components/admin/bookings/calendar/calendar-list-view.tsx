'use client';

// =============================================================================
// calendar-list-view.tsx — Chronological Upcoming Events List View
// =============================================================================

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  User,
  Search,
  Sparkles,
  Edit3,
  Trash2,
  CheckSquare,
  ChevronRight,
} from 'lucide-react';
import type { BookingRecord } from '@/types/booking';
import { calculateDaysRemaining } from '@/lib/utils/dateUtils';

interface CalendarListViewProps {
  events: BookingRecord[];
  onSelectEvent: (booking: BookingRecord) => void;
  onRescheduleEvent: (booking: BookingRecord) => void;
  onEditEvent: (booking: BookingRecord) => void;
  onTasksEvent: (booking: BookingRecord) => void;
  onCancelEvent: (booking: BookingRecord) => void;
}

export function CalendarListView({
  events,
  onSelectEvent,
  onRescheduleEvent,
  onEditEvent,
  onTasksEvent,
  onCancelEvent,
}: CalendarListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort events chronologically by event_date ascending
  const sortedAndFilteredEvents = useMemo(() => {
    let list = [...events].sort((a, b) => a.event_date.localeCompare(b.event_date));

    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.booking_reference.toLowerCase().includes(q) ||
          b.client_full_name.toLowerCase().includes(q) ||
          b.service_title.toLowerCase().includes(q) ||
          b.venue_city.toLowerCase().includes(q)
      );
    }

    return list;
  }, [events, searchTerm]);

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

  const getCountdownBadge = (eventDate: string) => {
    const days = calculateDaysRemaining(eventDate);
    if (days < 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
          Passed
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-800 animate-pulse">
          Today
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
          Tomorrow
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center rounded-full bg-[#BC6F07]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#BC6F07] border border-[#BC6F07]/30">
          In {days} days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-[#3A4F1C]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#3A4F1C]">
        In {days} days
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-2xs overflow-hidden flex flex-col space-y-4 p-4 sm:p-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search confirmed events by client, service, venue..."
          className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Events Table / List */}
      <div className="overflow-x-auto">
        {sortedAndFilteredEvents.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-xs">
            No confirmed upcoming events match your search criteria.
          </div>
        ) : (
          <div className="space-y-2.5 min-w-[700px]">
            {sortedAndFilteredEvents.map((booking) => (
              <div
                key={booking.id}
                className="group flex items-center justify-between gap-4 rounded-xl border border-stone-200/90 bg-white p-3.5 hover:border-[#3A4F1C]/40 hover:bg-[#F7F3E8]/30 transition"
              >
                {/* Date & Urgency */}
                <div className="w-36 shrink-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Calendar className="h-3.5 w-3.5 text-[#3A4F1C]" />
                    <span>{formatShortDate(booking.event_date)}</span>
                  </div>
                  <div>{getCountdownBadge(booking.event_date)}</div>
                </div>

                {/* Event & Client Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-stone-900 truncate">
                      {booking.service_title}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      {booking.booking_reference}
                    </span>
                    {booking.is_holiday_date && (
                      <span
                        title={booking.holiday_name || 'Public Holiday'}
                        className="inline-flex items-center gap-0.5 rounded-sm bg-amber-100 px-1.5 py-0.2 text-[9px] font-semibold text-amber-800"
                      >
                        <Sparkles className="h-2 w-2" />
                        <span>Holiday</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3 text-stone-400" />
                      <span className="text-stone-700 font-medium">{booking.client_full_name}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 text-stone-400" />
                      <span>
                        {booking.venue_city}
                        {booking.event_country_name ? `, ${booking.event_country_name}` : ''}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectEvent(booking)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#3A4F1C]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#3A4F1C] hover:bg-[#3A4F1C]/20 transition"
                  >
                    <span>Details</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onTasksEvent(booking)}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-50 transition"
                  >
                    <CheckSquare className="h-3 w-3 text-[#3A4F1C]" />
                    <span>Tasks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRescheduleEvent(booking)}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-50 transition"
                  >
                    <Calendar className="h-3 w-3 text-[#3A4F1C]" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditEvent(booking)}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-50 transition"
                  >
                    <Edit3 className="h-3 w-3 text-[#3A4F1C]" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCancelEvent(booking)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 transition"
                    title="Cancel event"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
