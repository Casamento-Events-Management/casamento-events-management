'use client';

// =============================================================================
// calendar-list-view.tsx — Chronological Upcoming Events & Archived Items View
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
  FileText,
  Archive,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import type { BookingRecord } from '@/types/booking';
import { calculateDaysRemaining } from '@/lib/utils/dateUtils';

interface CalendarListViewProps {
  events: BookingRecord[];
  allBookings?: BookingRecord[];
  onSelectEvent: (booking: BookingRecord) => void;
  onRescheduleEvent?: (booking: BookingRecord) => void;
  onEditEvent?: (booking: BookingRecord) => void;
  onTasksEvent: (booking: BookingRecord) => void;
  onCompleteEvent?: (booking: BookingRecord) => void;
  onCancelEvent?: (booking: BookingRecord) => void;
}

type DaysFilter = 'all' | '7' | '14' | '30' | '90';

export function CalendarListView({
  events,
  allBookings = [],
  onSelectEvent,
  onRescheduleEvent,
  onEditEvent,
  onTasksEvent,
  onCompleteEvent,
  onCancelEvent,
}: CalendarListViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'completed' | 'archived'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [daysFilter, setDaysFilter] = useState<DaysFilter>('all');

  // Segregate upcoming vs completed vs archived/cancelled
  const { upcomingBase, completedBase, archivedBase } = useMemo(() => {
    const pool = allBookings.length > 0 ? allBookings : events;

    const archived = pool
      .filter((b) => b.status === 'cancelled' || b.is_archived)
      .sort((a, b) => b.event_date.localeCompare(a.event_date)); // Most recent first for archived

    const completed = pool
      .filter((b) => b.status === 'completed' && !b.is_archived)
      .sort((a, b) => b.event_date.localeCompare(a.event_date)); // Most recent completed first

    const upcoming = pool
      .filter((b) => b.status === 'confirmed' && !b.is_archived)
      .sort((a, b) => a.event_date.localeCompare(b.event_date)); // Chronological ascending

    return { upcomingBase: upcoming, completedBase: completed, archivedBase: archived };
  }, [events, allBookings]);

  // Compute counts for the days filter
  const filterCounts = useMemo(() => {
    let count7 = 0;
    let count14 = 0;
    let count30 = 0;
    let count90 = 0;

    for (const b of upcomingBase) {
      const days = calculateDaysRemaining(b.event_date);
      if (days >= 0 && days <= 7) count7++;
      if (days >= 0 && days <= 14) count14++;
      if (days >= 0 && days <= 30) count30++;
      if (days >= 0 && days <= 90) count90++;
    }

    return {
      all: upcomingBase.length,
      7: count7,
      14: count14,
      30: count30,
      90: count90,
    };
  }, [upcomingBase]);

  // Filtered upcoming events based on daysFilter and search
  const filteredUpcomingEvents = useMemo(() => {
    let list = upcomingBase;

    // Apply days count filter
    if (daysFilter !== 'all') {
      const maxDays = parseInt(daysFilter, 10);
      list = list.filter((b) => {
        const days = calculateDaysRemaining(b.event_date);
        return days >= 0 && days <= maxDays;
      });
    }

    // Apply search query
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
  }, [upcomingBase, daysFilter, searchTerm]);

  // Filtered archived events based on search
  const filteredArchivedEvents = useMemo(() => {
    let list = archivedBase;

    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.booking_reference.toLowerCase().includes(q) ||
          b.client_full_name.toLowerCase().includes(q) ||
          b.service_title.toLowerCase().includes(q) ||
          b.venue_city.toLowerCase().includes(q) ||
          (b.cancellation_reason && b.cancellation_reason.toLowerCase().includes(q))
      );
    }

    return list;
  }, [archivedBase, searchTerm]);

  // Filtered completed events based on search
  const filteredCompletedEvents = useMemo(() => {
    let list = completedBase;

    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.booking_reference.toLowerCase().includes(q) ||
          b.client_full_name.toLowerCase().includes(q) ||
          b.service_title.toLowerCase().includes(q) ||
          b.venue_city.toLowerCase().includes(q) ||
          (b.completion_notes && b.completion_notes.toLowerCase().includes(q))
      );
    }

    return list;
  }, [completedBase, searchTerm]);

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
      {/* Sub-Tabs: Upcoming Events vs Completed vs Archived / Cancelled */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        {/* Mobile Status Select (<sm) */}
        <div className="sm:hidden flex items-center gap-2 w-full">
          <label htmlFor="mobile-list-status" className="text-[11px] font-medium text-stone-500 shrink-0">
            Status:
          </label>
          <div className="relative flex-1">
            <select
              id="mobile-list-status"
              value={activeSubTab}
              onChange={(e) => setActiveSubTab(e.target.value as 'upcoming' | 'completed' | 'archived')}
              className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-stone-800 focus:border-[#3A4F1C] focus:outline-hidden shadow-2xs cursor-pointer appearance-none"
            >
              <option value="upcoming">Upcoming Events ({upcomingBase.length})</option>
              <option value="completed">Completed ({completedBase.length})</option>
              <option value="archived">Archived / Removed ({archivedBase.length})</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          </div>
        </div>

        {/* Desktop / Tablet Sub-Tabs (>=sm) */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('upcoming')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${activeSubTab === 'upcoming'
                ? 'bg-[#3A4F1C] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Upcoming</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${activeSubTab === 'upcoming'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-200 text-stone-700'
                }`}
            >
              {upcomingBase.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('completed')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${activeSubTab === 'completed'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${activeSubTab === 'completed'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
                }`}
            >
              {completedBase.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('archived')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${activeSubTab === 'archived'
                ? 'bg-stone-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Archived</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${activeSubTab === 'archived'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-200 text-stone-700'
                }`}
            >
              {archivedBase.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeSubTab === 'upcoming'
                ? 'Search upcoming events...'
                : activeSubTab === 'completed'
                  ? 'Search completed events or notes...'
                  : 'Search archived events...'
            }
            className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-8 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:border-[#3A4F1C] focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Days Count (Only visible when Upcoming tab is active) */}
      {activeSubTab === 'upcoming' && (
        <div>
          {/* Mobile Filter Days Select (<sm) */}
          <div className="sm:hidden flex items-center gap-2 w-full">
            <label htmlFor="mobile-days-filter" className="text-[11px] font-medium text-stone-500 shrink-0">
              Filter Days:
            </label>
            <div className="relative flex-1">
              <select
                id="mobile-days-filter"
                value={daysFilter}
                onChange={(e) => setDaysFilter(e.target.value as DaysFilter)}
                className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-stone-800 focus:border-[#3A4F1C] focus:outline-hidden shadow-2xs cursor-pointer appearance-none"
              >
                <option value="all">All ({filterCounts.all})</option>
                <option value="7">7 Days ({filterCounts[7]})</option>
                <option value="14">14 Days ({filterCounts[14]})</option>
                <option value="30">30 Days ({filterCounts[30]})</option>
                <option value="90">90 Days ({filterCounts[90]})</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            </div>
          </div>

          {/* Desktop/Tablet Filter Days Pills (>=sm) */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-stone-500 mr-1">Filter Days:</span>
            {(
              [
                { id: 'all', label: 'All', count: filterCounts.all },
                { id: '7', label: '7 Days', count: filterCounts[7] },
                { id: '14', label: '14 Days', count: filterCounts[14] },
                { id: '30', label: '30 Days', count: filterCounts[30] },
                { id: '90', label: '90 Days', count: filterCounts[90] },
              ] as const
            ).map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setDaysFilter(pill.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${daysFilter === pill.id
                    ? 'bg-[#3A4F1C]/15 text-[#3A4F1C] border border-[#3A4F1C]/30 font-semibold'
                    : 'border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${daysFilter === pill.id
                      ? 'bg-[#3A4F1C] text-white font-bold'
                      : 'bg-stone-100 text-stone-500'
                    }`}
                >
                  {pill.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events Table / List (limited height with vertical scroll-down) */}
      <div className="w-full max-h-[600px] sm:max-h-[680px] overflow-y-auto pr-1 sm:pr-2">
        {activeSubTab === 'upcoming' ? (
          filteredUpcomingEvents.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs">
              No confirmed upcoming events match your filter or search criteria.
            </div>
          ) : (
            <div className="space-y-2.5 w-full pb-2">
              {filteredUpcomingEvents.map((booking) => (
                <div
                  key={booking.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-stone-200/90 bg-white p-3.5 hover:border-[#3A4F1C]/40 hover:bg-[#F7F3E8]/30 transition"
                >
                  {/* Date & Urgency */}
                  <div className="w-full sm:w-36 shrink-0 flex items-center justify-between sm:block space-y-0 sm:space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <Calendar className="h-3.5 w-3.5 text-[#3A4F1C]" />
                      <span>{formatShortDate(booking.event_date)}</span>
                    </div>
                    <div>{getCountdownBadge(booking.event_date)}</div>
                  </div>

                  {/* Event & Client Info (widened) */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-stone-900">
                        {booking.service_title}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">
                        • {booking.booking_reference}
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

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3 text-stone-400" />
                        <span className="text-stone-700 font-medium">{booking.client_full_name}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        <span>
                          {booking.venue_city}
                          {booking.event_country_name ? `, ${booking.event_country_name}` : ''}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Row: Remove instead of Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {onCompleteEvent && (
                      <button
                        type="button"
                        onClick={() => onCompleteEvent(booking)}
                        className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-emerald-300 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition shrink-0"
                        title="Mark as Done (Conclude)"
                        aria-label="Mark as Done"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}

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

                    {onRescheduleEvent && (
                      <button
                        type="button"
                        onClick={() => onRescheduleEvent(booking)}
                        className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                        title="Reschedule"
                        aria-label="Reschedule"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {onEditEvent && (
                      <button
                        type="button"
                        onClick={() => onEditEvent(booking)}
                        className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                        title="Edit Details"
                        aria-label="Edit Details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {onCancelEvent && (
                      <button
                        type="button"
                        onClick={() => onCancelEvent(booking)}
                        className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition shrink-0"
                        title="Remove Event"
                        aria-label="Remove Event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeSubTab === 'completed' ? (
          /* Completed Events List */
          filteredCompletedEvents.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs">
              No completed events found matching your search.
            </div>
          ) : (
            <div className="space-y-2.5 w-full pb-2">
              {filteredCompletedEvents.map((booking) => (
                <div
                  key={booking.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-3.5 hover:border-emerald-300 transition"
                >
                  {/* Date & Completed Badge */}
                  <div className="w-full sm:w-36 shrink-0 flex items-center justify-between sm:block space-y-0 sm:space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                      <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                      <span>{formatShortDate(booking.event_date)}</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                        <span>Completed</span>
                      </span>
                    </div>
                  </div>

                  {/* Event & Client Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-stone-900">
                        {booking.service_title}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">
                        • {booking.booking_reference}
                      </span>
                      {booking.completed_at && (
                        <span className="text-[10px] text-stone-400">
                          (Concluded: {formatShortDate(booking.completed_at.slice(0, 10))})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3 text-stone-400" />
                        <span className="text-stone-700 font-medium">{booking.client_full_name}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        <span>
                          {booking.venue_city}
                          {booking.event_country_name ? `, ${booking.event_country_name}` : ''}
                        </span>
                      </span>
                    </div>

                    {booking.completion_notes && (
                      <div className="text-[11px] text-[#2B3817] bg-[#FAF6ED] rounded-md p-2 mt-1 border border-[#3A4F1C]/15">
                        <span className="font-semibold text-[#3A4F1C] block text-[10px] uppercase tracking-wider mb-0.5">
                          Wrap-Up Notes:
                        </span>
                        <span className="line-clamp-2">{booking.completion_notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Completed Items */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
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
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Archived / Removed List */
          filteredArchivedEvents.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs">
              No archived or removed events found.
            </div>
          ) : (
            <div className="space-y-2.5 w-full pb-2">
              {filteredArchivedEvents.map((booking) => (
                <div
                  key={booking.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-stone-200/90 bg-stone-50/50 p-3.5 hover:border-stone-300 transition"
                >
                  {/* Date & Status */}
                  <div className="w-full sm:w-36 shrink-0 flex items-center justify-between sm:block space-y-0 sm:space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" />
                      <span>{formatShortDate(booking.event_date)}</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                        {booking.status === 'cancelled' ? 'Cancelled / Removed' : 'Archived'}
                      </span>
                    </div>
                  </div>

                  {/* Event & Client Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-stone-800">
                        {booking.service_title}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">
                        • {booking.booking_reference}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3 text-stone-400" />
                        <span className="text-stone-700 font-medium">{booking.client_full_name}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        <span>
                          {booking.venue_city}
                          {booking.event_country_name ? `, ${booking.event_country_name}` : ''}
                        </span>
                      </span>
                    </div>

                    {booking.cancellation_reason && (
                      <div className="flex items-start gap-1.5 text-[11px] text-red-600/90 bg-red-50/60 rounded-md p-1.5 mt-1 border border-red-100">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>Removal reason: {booking.cancellation_reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Archived Items */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <button
                      type="button"
                      onClick={() => onSelectEvent(booking)}
                      className="h-7 w-7 rounded-lg inline-flex items-center justify-center border border-stone-200 bg-white text-stone-600 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
