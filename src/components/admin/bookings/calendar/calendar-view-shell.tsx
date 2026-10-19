'use client';

// =============================================================================
// calendar-view-shell.tsx — Master Shell for Upcoming Events Calendar & Coordination
// =============================================================================

import React, { useState, useMemo } from 'react';
import type { BookingRecord, AdminUpdateBookingPayload } from '@/types/booking';
import { MonthCalendarGrid } from './month-calendar-grid';
import { WeekCalendarGrid } from './week-calendar-grid';
import { CalendarDayPanel } from './calendar-day-panel';
import { CalendarListView } from './calendar-list-view';
import { RescheduleEventModal } from './modals/reschedule-event-modal';
import { CancelEventModal } from './modals/cancel-event-modal';
import { EventTasksModal } from './modals/event-tasks-modal';
import { UpdateBookingModal } from '../modals/update-booking-modal';
import { BookingDetailInspector } from '../booking-detail-inspector';

interface CalendarViewShellProps {
  bookings: BookingRecord[];
  onBookingsChange: (updater: (prev: BookingRecord[]) => BookingRecord[]) => void;
  onUpdateBookingDetails: (params: {
    updates: AdminUpdateBookingPayload;
    notifyClient: boolean;
    adminMessage?: string;
  }) => Promise<void>;
  onNewEventClick?: () => void;
  viewMode?: 'calendar' | 'list';
}

export function CalendarViewShell({
  bookings,
  onBookingsChange,
  onUpdateBookingDetails,
  viewMode = 'calendar',
}: CalendarViewShellProps) {

  // Sub-view mode for calendar: 'month' vs 'week'
  const [calendarSubMode, setCalendarSubMode] = useState<'month' | 'week'>('month');

  // Active month/year navigation pointer
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Today's YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Currently selected date on the calendar
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Modal active targets
  const [reschedulingEvent, setReschedulingEvent] = useState<BookingRecord | null>(null);
  const [cancellingEvent, setCancellingEvent] = useState<BookingRecord | null>(null);
  const [tasksEvent, setTasksEvent] = useState<BookingRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<BookingRecord | null>(null);
  const [inspectingEvent, setInspectingEvent] = useState<BookingRecord | null>(null);

  // Filter only active, confirmed events for the upcoming calendar
  const confirmedEvents = useMemo(() => {
    return bookings.filter((b) => b.status === 'confirmed' && !b.is_archived);
  }, [bookings]);

  // Events on the currently selected date
  const eventsOnSelectedDate = useMemo(() => {
    return confirmedEvents.filter((b) => b.event_date === selectedDate);
  }, [confirmedEvents, selectedDate]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(todayStr);
  };

  // State update handlers
  const handleEventRescheduled = (updated: BookingRecord) => {
    onBookingsChange((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedDate(updated.event_date);
  };

  const handleEventCancelled = (updated: BookingRecord) => {
    onBookingsChange((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (inspectingEvent?.id === updated.id) {
      setInspectingEvent(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Workspace Body */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Calendar Grid (~65% width) */}
          <div className="lg:col-span-8">
            {calendarSubMode === 'month' ? (
              <MonthCalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={confirmedEvents}
                onSelectDate={setSelectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
                viewMode={calendarSubMode}
                onViewModeChange={setCalendarSubMode}
              />
            ) : (
              <WeekCalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={confirmedEvents}
                onSelectDate={setSelectedDate}
                onSelectEvent={(evt) => setInspectingEvent(evt)}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onToday={handleToday}
                viewMode={calendarSubMode}
                onViewModeChange={setCalendarSubMode}
              />
            )}
          </div>

          {/* Right Column: Selected Day Events Panel (~35% width) */}
          <div className="lg:col-span-4 lg:sticky lg:top-4">
            <CalendarDayPanel
              selectedDate={selectedDate}
              events={eventsOnSelectedDate}
              onSelectEvent={(evt) => setInspectingEvent(evt)}
              onRescheduleEvent={(evt) => setReschedulingEvent(evt)}
              onEditEvent={(evt) => setEditingEvent(evt)}
              onTasksEvent={(evt) => setTasksEvent(evt)}
              onCancelEvent={(evt) => setCancellingEvent(evt)}
            />
          </div>
        </div>
      ) : (
        /* List View */
        <CalendarListView
          events={confirmedEvents}
          onSelectEvent={(evt) => setInspectingEvent(evt)}
          onRescheduleEvent={(evt) => setReschedulingEvent(evt)}
          onEditEvent={(evt) => setEditingEvent(evt)}
          onTasksEvent={(evt) => setTasksEvent(evt)}
          onCancelEvent={(evt) => setCancellingEvent(evt)}
        />
      )}

      {/* Modals & Dialogs */}
      {reschedulingEvent && (
        <RescheduleEventModal
          key={`${reschedulingEvent.id}-reschedule`}
          booking={reschedulingEvent}
          isOpen={!!reschedulingEvent}
          onClose={() => setReschedulingEvent(null)}
          onRescheduled={handleEventRescheduled}
        />
      )}

      {cancellingEvent && (
        <CancelEventModal
          key={`${cancellingEvent.id}-cancel`}
          booking={cancellingEvent}
          isOpen={!!cancellingEvent}
          onClose={() => setCancellingEvent(null)}
          onCancelled={handleEventCancelled}
        />
      )}

      {tasksEvent && (
        <EventTasksModal
          key={`${tasksEvent.id}-tasks`}
          booking={tasksEvent}
          isOpen={!!tasksEvent}
          onClose={() => setTasksEvent(null)}
        />
      )}

      {editingEvent && (
        <UpdateBookingModal
          key={`${editingEvent.id}-update`}
          booking={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onConfirm={async (params) => {
            await onUpdateBookingDetails(params);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Event Details Inspector Modal */}
      {inspectingEvent && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setInspectingEvent(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg my-6 max-h-[90vh] overflow-hidden"
          >
            <BookingDetailInspector
              booking={inspectingEvent}
              onAccept={async () => {}}
              onReject={async () => {}}
              onUpdate={async (params) => {
                await onUpdateBookingDetails(params);
                setInspectingEvent(null);
              }}
              onClose={() => setInspectingEvent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
