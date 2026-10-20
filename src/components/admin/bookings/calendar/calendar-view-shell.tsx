'use client';

// =============================================================================
// calendar-view-shell.tsx — Master Shell for Upcoming Events Calendar & Coordination
// =============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { syncUrlParams, getUrlParam } from '@/lib/utils/urlParamUtils';
import type { BookingRecord, AdminUpdateBookingPayload } from '@/types/booking';
import { MonthCalendarGrid } from './month-calendar-grid';
import { WeekCalendarGrid } from './week-calendar-grid';
import { CalendarDayPanel } from './calendar-day-panel';
import { CalendarListView } from './calendar-list-view';
import { RescheduleEventModal } from './modals/reschedule-event-modal';
import { CancelEventModal } from './modals/cancel-event-modal';
import { CompleteEventModal } from './modals/complete-event-modal';
import { EventTasksModal } from './modals/event-tasks-modal';
import { UpdateBookingModal } from '../modals/update-booking-modal';
import { BookingDetailInspector } from '../booking-detail-inspector';
import { reopenEventAction } from '@/lib/services/admin-calendar-actions';

interface CalendarViewShellProps {
  bookings: BookingRecord[];
  onBookingsChange: (updater: (prev: BookingRecord[]) => BookingRecord[]) => void;
  onUpdateBookingDetails: (params: {
    bookingId?: string;
    updates: AdminUpdateBookingPayload;
    notifyClient: boolean;
    adminMessage?: string;
  }) => Promise<unknown>;
  onNewEventClick?: () => void;
  viewMode?: 'calendar' | 'list';
  isStaff?: boolean;
}

export function CalendarViewShell({
  bookings,
  onBookingsChange,
  onUpdateBookingDetails,
  viewMode = 'calendar',
  isStaff = false,
}: CalendarViewShellProps) {

  const searchParams = useSearchParams();

  // Sub-view mode for calendar: 'month' vs 'week'
  const calViewParam = searchParams.get('calView');
  const [calendarSubMode, setCalendarSubMode] = useState<'month' | 'week'>(() =>
    calViewParam === 'week' ? 'week' : 'month'
  );

  // Today's YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Currently selected date on the calendar
  const dateParam = searchParams.get('date');
  const initialDateStr = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayStr;
  const [selectedDate, setSelectedDate] = useState<string>(initialDateStr);

  // Active month/year navigation pointer
  const [currentDate, setCurrentDate] = useState(() => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const [y, m] = dateParam.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  // Check live URL parameters and ensure they apply only to calendar or list view
  const curTab = typeof window !== 'undefined' ? (getUrlParam('tab') || 'calendar') : (searchParams.get('tab') || 'calendar');
  const isCalendarOrListTab = curTab === 'calendar' || curTab === 'list';
  const modalParam = isCalendarOrListTab
    ? (typeof window !== 'undefined' ? getUrlParam('modal') : searchParams.get('modal'))
    : null;
  const bookingIdParam = isCalendarOrListTab
    ? (typeof window !== 'undefined' ? getUrlParam('bookingId') : searchParams.get('bookingId'))
    : null;

  // Mobile / Tablet Selected Day Panel modal state
  const [isMobileDayModalOpen, setIsMobileDayModalOpen] = useState(() => modalParam === 'day');

  // Modal active targets
  const [reschedulingEvent, setReschedulingEvent] = useState<BookingRecord | null>(() => {
    return modalParam === 'reschedule' && bookingIdParam
      ? bookings.find((b) => b.id === bookingIdParam) || null
      : null;
  });
  const [cancellingEvent, setCancellingEvent] = useState<BookingRecord | null>(() => {
    return modalParam === 'cancel' && bookingIdParam
      ? bookings.find((b) => b.id === bookingIdParam) || null
      : null;
  });
  const [completingEvent, setCompletingEvent] = useState<BookingRecord | null>(() => {
    return modalParam === 'complete' && bookingIdParam
      ? bookings.find((b) => b.id === bookingIdParam) || null
      : null;
  });
  const [tasksEvent, setTasksEvent] = useState<BookingRecord | null>(() => {
    return modalParam === 'tasks' && bookingIdParam
      ? bookings.find((b) => b.id === bookingIdParam) || null
      : null;
  });
  const [editingEvent, setEditingEvent] = useState<BookingRecord | null>(() => {
    return modalParam === 'edit' && bookingIdParam
      ? bookings.find((b) => b.id === bookingIdParam) || null
      : null;
  });
  const [inspectingEvent, setInspectingEvent] = useState<BookingRecord | null>(() => {
    return modalParam === 'inspect' && bookingIdParam
      ? bookings.find((b) => b.id === bookingIdParam) || null
      : null;
  });

  // Synchronize modal targets and date when URL search params change externally (e.g. Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      const liveTab = getUrlParam('tab') || 'calendar';
      if (liveTab !== 'calendar' && liveTab !== 'list') {
        setInspectingEvent(null);
        setReschedulingEvent(null);
        setCancellingEvent(null);
        setCompletingEvent(null);
        setTasksEvent(null);
        setEditingEvent(null);
        setIsMobileDayModalOpen(false);
        return;
      }

      const curDate = getUrlParam('date');
      if (curDate && /^\d{4}-\d{2}-\d{2}$/.test(curDate)) {
        setSelectedDate(curDate);
      }

      const curCalView = getUrlParam('calView');
      if (curCalView === 'month' || curCalView === 'week') {
        setCalendarSubMode(curCalView);
      }

      const curModal = getUrlParam('modal');
      const curBookingId = getUrlParam('bookingId');

      setIsMobileDayModalOpen(curModal === 'day');

      if (curBookingId) {
        const match = bookings.find((b) => b.id === curBookingId) || null;
        setInspectingEvent(curModal === 'inspect' ? match : null);
        setReschedulingEvent(curModal === 'reschedule' ? match : null);
        setCancellingEvent(curModal === 'cancel' ? match : null);
        setCompletingEvent(curModal === 'complete' ? match : null);
        setTasksEvent(curModal === 'tasks' ? match : null);
        setEditingEvent(curModal === 'edit' ? match : null);
      } else {
        setInspectingEvent(null);
        setReschedulingEvent(null);
        setCancellingEvent(null);
        setCompletingEvent(null);
        setTasksEvent(null);
        setEditingEvent(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [bookings]);

  // Handle date selection with mobile/tablet modal pop-up trigger and URL sync
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;
    if (isMobile) {
      setIsMobileDayModalOpen(true);
      syncUrlParams({ date: dateStr, modal: 'day' });
    } else {
      syncUrlParams({ date: dateStr });
    }
  };

  const handleCloseMobileDayModal = () => {
    setIsMobileDayModalOpen(false);
    syncUrlParams({ modal: null });
  };

  const handleSubModeChange = (mode: 'month' | 'week') => {
    setCalendarSubMode(mode);
    syncUrlParams({ calView: mode });
  };

  const handleOpenInspect = (evt: BookingRecord) => {
    setInspectingEvent(evt);
    syncUrlParams({ modal: 'inspect', bookingId: evt.id });
  };

  const handleCloseInspect = () => {
    setInspectingEvent(null);
    syncUrlParams({ modal: null, bookingId: null });
  };

  const handleOpenReschedule = (evt: BookingRecord) => {
    setReschedulingEvent(evt);
    syncUrlParams({ modal: 'reschedule', bookingId: evt.id });
  };

  const handleCloseReschedule = () => {
    setReschedulingEvent(null);
    syncUrlParams({ modal: null, bookingId: null });
  };

  const handleOpenCancel = (evt: BookingRecord) => {
    setCancellingEvent(evt);
    syncUrlParams({ modal: 'cancel', bookingId: evt.id });
  };

  const handleCloseCancel = () => {
    setCancellingEvent(null);
    syncUrlParams({ modal: null, bookingId: null });
  };

  const handleOpenComplete = (evt: BookingRecord) => {
    setCompletingEvent(evt);
    syncUrlParams({ modal: 'complete', bookingId: evt.id });
  };

  const handleCloseComplete = () => {
    setCompletingEvent(null);
    syncUrlParams({ modal: null, bookingId: null });
  };

  const handleOpenTasks = (evt: BookingRecord) => {
    setTasksEvent(evt);
    syncUrlParams({ modal: 'tasks', bookingId: evt.id });
  };

  const handleCloseTasks = () => {
    setTasksEvent(null);
    syncUrlParams({ modal: null, bookingId: null });
  };

  const handleOpenEdit = (evt: BookingRecord) => {
    setEditingEvent(evt);
    syncUrlParams({ modal: 'edit', bookingId: evt.id });
  };

  const handleCloseEdit = () => {
    setEditingEvent(null);
    syncUrlParams({ modal: null, bookingId: null });
  };

  // Close mobile modal automatically if screen is resized to desktop (>= 1280px)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
        setIsMobileDayModalOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Escape key and outside scroll lock whenever inspectingEvent or isMobileDayModalOpen is active
  useEffect(() => {
    const isMobileModalActuallyActive = isMobileDayModalOpen && typeof window !== 'undefined' && window.innerWidth < 1280;
    const isModalActive = Boolean(inspectingEvent || isMobileModalActuallyActive);

    if (!isModalActive) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectingEvent) {
          handleCloseInspect();
        } else if (isMobileDayModalOpen) {
          handleCloseMobileDayModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inspectingEvent, isMobileDayModalOpen]);

  // Filter active and completed events for calendar display
  const confirmedEvents = useMemo(() => {
    return bookings.filter(
      (b) => (b.status === 'confirmed' || b.status === 'completed') && !b.is_archived
    );
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

  const handleEventCompleted = (updated: BookingRecord) => {
    onBookingsChange((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (inspectingEvent?.id === updated.id) {
      setInspectingEvent(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Workspace Body */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left Column: Calendar Grid (Full width on mobile/tablet, ~65% on desktop) */}
          <div className="xl:col-span-8">
            {calendarSubMode === 'month' ? (
              <MonthCalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={confirmedEvents}
                onSelectDate={handleSelectDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
                viewMode={calendarSubMode}
                onViewModeChange={handleSubModeChange}
              />
            ) : (
              <WeekCalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={confirmedEvents}
                onSelectDate={handleSelectDate}
                onSelectEvent={handleOpenInspect}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onToday={handleToday}
                viewMode={calendarSubMode}
                onViewModeChange={handleSubModeChange}
              />
            )}
          </div>

          {/* Right Column: Selected Day Events Panel (~35% width, desktop only) */}
          <div className="hidden xl:block xl:col-span-4 xl:sticky xl:top-4">
            <CalendarDayPanel
              selectedDate={selectedDate}
              events={eventsOnSelectedDate}
              onSelectEvent={handleOpenInspect}
              onRescheduleEvent={isStaff ? undefined : handleOpenReschedule}
              onEditEvent={isStaff ? undefined : handleOpenEdit}
              onTasksEvent={handleOpenTasks}
              onCompleteEvent={isStaff ? undefined : handleOpenComplete}
              onCancelEvent={isStaff ? undefined : handleOpenCancel}
            />
          </div>
        </div>
      ) : (
        /* List View */
        <CalendarListView
          allBookings={bookings}
          events={confirmedEvents}
          onSelectEvent={handleOpenInspect}
          onRescheduleEvent={isStaff ? undefined : handleOpenReschedule}
          onEditEvent={isStaff ? undefined : handleOpenEdit}
          onTasksEvent={handleOpenTasks}
          onCompleteEvent={isStaff ? undefined : handleOpenComplete}
          onCancelEvent={isStaff ? undefined : handleOpenCancel}
        />
      )}

      {/* Modals & Dialogs */}
      {reschedulingEvent && (
        <RescheduleEventModal
          key={`${reschedulingEvent.id}-reschedule`}
          booking={reschedulingEvent}
          isOpen={!!reschedulingEvent}
          onClose={handleCloseReschedule}
          onRescheduled={handleEventRescheduled}
        />
      )}

      {cancellingEvent && (
        <CancelEventModal
          key={`${cancellingEvent.id}-cancel`}
          booking={cancellingEvent}
          isOpen={!!cancellingEvent}
          onClose={handleCloseCancel}
          onCancelled={handleEventCancelled}
        />
      )}

      {completingEvent && (
        <CompleteEventModal
          key={`${completingEvent.id}-complete`}
          booking={completingEvent}
          isOpen={!!completingEvent}
          onClose={handleCloseComplete}
          onCompleted={handleEventCompleted}
        />
      )}

      {tasksEvent && (
        <EventTasksModal
          key={`${tasksEvent.id}-tasks`}
          booking={tasksEvent}
          isOpen={!!tasksEvent}
          onClose={handleCloseTasks}
          isStaff={isStaff}
        />
      )}

      {editingEvent && (
        <UpdateBookingModal
          key={`${editingEvent.id}-update`}
          booking={editingEvent}
          isOpen={!!editingEvent}
          onClose={handleCloseEdit}
          onConfirm={async (params) => {
            await onUpdateBookingDetails({
              ...params,
              bookingId: editingEvent.id,
            });
            handleCloseEdit();
          }}
        />
      )}

      {/* iPad / Tablet / Mobile Pop-up Modal for Selected Day Events Panel */}
      {isMobileDayModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseMobileDayModal}
          className="xl:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg my-6 max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
          >
            <CalendarDayPanel
              selectedDate={selectedDate}
              events={eventsOnSelectedDate}
              onSelectEvent={(evt) => {
                handleCloseMobileDayModal();
                handleOpenInspect(evt);
              }}
              onRescheduleEvent={isStaff ? undefined : (evt) => {
                handleCloseMobileDayModal();
                handleOpenReschedule(evt);
              }}
              onEditEvent={isStaff ? undefined : (evt) => {
                handleCloseMobileDayModal();
                handleOpenEdit(evt);
              }}
              onTasksEvent={(evt) => {
                handleCloseMobileDayModal();
                handleOpenTasks(evt);
              }}
              onCompleteEvent={isStaff ? undefined : (evt) => {
                handleCloseMobileDayModal();
                handleOpenComplete(evt);
              }}
              onCancelEvent={isStaff ? undefined : (evt) => {
                handleCloseMobileDayModal();
                handleOpenCancel(evt);
              }}
              onClose={handleCloseMobileDayModal}
            />
          </div>
        </div>
      )}

      {/* Event Details Inspector Modal */}
      {inspectingEvent && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseInspect}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg my-6 max-h-[90vh] overflow-hidden"
          >
            <BookingDetailInspector
              booking={inspectingEvent}
              isStaff={isStaff}
              onAccept={async () => {}}
              onReject={async () => {}}
              onUpdate={async (params) => {
                await onUpdateBookingDetails({
                  ...params,
                  bookingId: inspectingEvent.id,
                });
                handleCloseInspect();
              }}
              onNoteAppended={(notes) => {
                onBookingsChange((prev) =>
                  prev.map((b) => (b.id === inspectingEvent.id ? { ...b, admin_notes: notes } : b))
                );
              }}
              onComplete={(b) => {
                handleCloseInspect();
                handleOpenComplete(b);
              }}
              onReopen={async (b) => {
                const res = await reopenEventAction({ bookingId: b.id });
                if (res.success && res.booking) {
                  handleEventCompleted(res.booking as BookingRecord);
                }
              }}
              onClose={handleCloseInspect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
