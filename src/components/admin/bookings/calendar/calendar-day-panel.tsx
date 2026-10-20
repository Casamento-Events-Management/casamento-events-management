'use client';

// =============================================================================
// calendar-day-panel.tsx — Right-Column Selected Day Event Schedule Cards
// =============================================================================

import React from 'react';
import {
  Calendar,
  MapPin,
  Sparkles,
  Edit3,
  Trash2,
  CheckSquare,
  FileText,
  User,
  X,
} from 'lucide-react';
import type { BookingRecord } from '@/types/booking';
import { calculateDaysRemaining } from '@/lib/utils/dateUtils';

interface CalendarDayPanelProps {
  selectedDate: string; // YYYY-MM-DD
  events: BookingRecord[];
  onSelectEvent: (booking: BookingRecord) => void;
  onRescheduleEvent: (booking: BookingRecord) => void;
  onEditEvent: (booking: BookingRecord) => void;
  onTasksEvent: (booking: BookingRecord) => void;
  onCancelEvent: (booking: BookingRecord) => void;
  onClose?: () => void;
}

export function CalendarDayPanel({
  selectedDate,
  events,
  onSelectEvent,
  onRescheduleEvent,
  onEditEvent,
  onTasksEvent,
  onCancelEvent,
  onClose,
}: CalendarDayPanelProps) {
  const formattedDayTitle = React.useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return selectedDate;
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const getCountdownPill = (eventDate: string) => {
    const days = calculateDaysRemaining(eventDate);
    if (days < 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200">
          Passed
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800 border border-red-200 animate-pulse">
          Today
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
          Tomorrow
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center rounded-full bg-[#BC6F07]/15 px-2 py-0.5 text-[10px] font-semibold text-[#BC6F07] border border-[#BC6F07]/30">
          In {days} days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-[#3A4F1C]/10 px-2 py-0.5 text-[10px] font-medium text-[#3A4F1C]">
        In {days} days
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-2xs overflow-hidden flex flex-col h-full xl:min-h-[500px]">
      {/* Day Header */}
      <div className="flex items-center justify-between border-b border-[#3A4F1C]/10 bg-[#F7F3E8]/50 p-4 sm:p-5">
        <div>
          <h3 className="text-sm sm:text-base font-serif font-bold text-[#2B3817]">
            {formattedDayTitle}
          </h3>
          <p className="text-xs text-[#2B3817]/70 mt-0.5">
            {events.length} {events.length === 1 ? 'confirmed event' : 'confirmed events'}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
            title="Close panel"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Events List Body */}
      <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-stone-400">
            <Calendar className="h-8 w-8 text-stone-300 mb-2" />
            <p className="text-xs font-medium text-stone-600">No events on this day</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Select another date from the calendar to inspect scheduled events.
            </p>
          </div>
        ) : (
          events.map((booking) => (
            <div
              key={booking.id}
              className="group rounded-xl border border-stone-200/90 bg-white p-4 shadow-2xs hover:border-[#3A4F1C]/40 transition space-y-3"
            >
              {/* Event Top Bar */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#3A4F1C] transition">
                    {booking.service_title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-stone-600">
                    <User className="h-3 w-3 text-[#3A4F1C]" />
                    <span className="font-medium text-stone-800">{booking.client_full_name}</span>
                    <span className="font-mono text-stone-400 text-[10px]">
                      • {booking.booking_reference}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {getCountdownPill(booking.event_date)}
                </div>
              </div>

              {/* Venue & Category */}
              <div className="space-y-1 text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-[#3A4F1C] shrink-0" />
                  <span className="truncate">
                    {booking.venue_city}
                    {booking.event_country_name ? `, ${booking.event_country_name}` : ''}
                  </span>
                </div>

                {booking.is_holiday_date && booking.holiday_name && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 rounded-md px-2 py-0.5 border border-amber-200">
                    <Sparkles className="h-2.5 w-2.5 text-amber-600 shrink-0" />
                    <span>Holiday: {booking.holiday_name}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => onSelectEvent(booking)}
                  className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                  title="View Details"
                  aria-label="View Details"
                >
                  <FileText className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onTasksEvent(booking)}
                  className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                  title="Tasks"
                  aria-label="Tasks"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onRescheduleEvent(booking)}
                  className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                  title="Reschedule"
                  aria-label="Reschedule"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onEditEvent(booking)}
                  className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                  title="Edit Details"
                  aria-label="Edit Details"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>

                  <button
                    type="button"
                    onClick={() => onCancelEvent(booking)}
                    className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition shrink-0 ml-auto"
                    title="Remove Event"
                    aria-label="Remove Event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
