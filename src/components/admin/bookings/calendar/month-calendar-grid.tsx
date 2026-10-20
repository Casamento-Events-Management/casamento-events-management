'use client';

// =============================================================================
// month-calendar-grid.tsx — 7-Column Interactive Month View Grid
// =============================================================================

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { BookingRecord } from '@/types/booking';

interface MonthCalendarGridProps {
  currentDate: Date; // Controls which month/year is shown
  selectedDate: string; // YYYY-MM-DD
  events: BookingRecord[];
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
}

export function MonthCalendarGrid({
  currentDate,
  selectedDate,
  events,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  viewMode,
  onViewModeChange,
}: MonthCalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Localized Month Year Label (e.g., "July 2026")
  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Map events by date YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, BookingRecord[]>();
    for (const b of events) {
      if (!b.event_date) continue;
      const arr = map.get(b.event_date) || [];
      arr.push(b);
      map.set(b.event_date, arr);
    }
    return map;
  }, [events]);

  // Compute 7x5 or 7x6 day matrix starting on Monday (ISO-8601)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday-based day of week (0 = Mon, 6 = Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const cells: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      events: BookingRecord[];
      hasHoliday: boolean;
    }> = [];

    // Fill preceding days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      const dayEvents = eventsByDate.get(dStr) || [];
      cells.push({
        dateStr: dStr,
        dayNum: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        events: dayEvents,
        hasHoliday: dayEvents.some((e) => e.is_holiday_date),
      });
    }

    // Fill current month days
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      const dayEvents = eventsByDate.get(dStr) || [];
      cells.push({
        dateStr: dStr,
        dayNum: dNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        events: dayEvents,
        hasHoliday: dayEvents.some((e) => e.is_holiday_date),
      });
    }

    // Fill trailing days to complete full 7-day grid rows (35 or 42 total cells)
    const totalCellsNeeded = cells.length <= 35 ? 35 : 42;
    const trailingCount = totalCellsNeeded - cells.length;
    for (let dNum = 1; dNum <= trailingCount; dNum++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      const dayEvents = eventsByDate.get(dStr) || [];
      cells.push({
        dateStr: dStr,
        dayNum: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        events: dayEvents,
        hasHoliday: dayEvents.some((e) => e.is_holiday_date),
      });
    }

    return cells;
  }, [year, month, eventsByDate, todayStr, selectedDate]);

  const weekHeaders = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Calendar Top Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#3A4F1C]/10 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#2B3817]">
            {monthYearLabel}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevMonth}
              title="Previous month"
              className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              title="Next month"
              className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToday}
              className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50 transition"
            >
              Today
            </button>
          </div>
        </div>

        {/* View Mode Toggle: Month vs Week */}
        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50/80 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('month')}
            className={`rounded-md px-3 py-1 font-medium transition ${
              viewMode === 'month'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('week')}
            className={`rounded-md px-3 py-1 font-medium transition ${
              viewMode === 'week'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Week Day Column Headers */}
      <div className="grid grid-cols-7 border-b border-stone-200/80 bg-[#F7F3E8]/40 text-center text-[11px] font-semibold tracking-wider text-stone-600 py-2.5">
        {weekHeaders.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* 7-Column Day Cells Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100 bg-stone-100/50">
        {calendarCells.map((cell) => {
          const maxVisibleBadges = 2;
          const overflowCount = cell.events.length - maxVisibleBadges;

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 cursor-pointer transition flex flex-col justify-between ${
                cell.isCurrentMonth ? 'bg-white' : 'bg-stone-50/70 text-stone-300'
              } ${
                cell.isSelected
                  ? 'ring-2 ring-inset ring-[#3A4F1C] bg-[#F7F3E8]/40'
                  : 'hover:bg-stone-50'
              }`}
            >
              {/* Day Header Inside Cell */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center text-xs font-semibold rounded-full h-5 w-5 sm:h-6 sm:w-6 ${
                    cell.isToday
                      ? 'bg-[#3A4F1C] text-white shadow-2xs'
                      : cell.isCurrentMonth
                      ? 'text-stone-800'
                      : 'text-stone-400'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {cell.hasHoliday && (
                  <span title="Public Holiday on this date" className="text-amber-500">
                    <Sparkles className="h-3 w-3" />
                  </span>
                )}
              </div>

              {/* Event Badges Inside Cell */}
              <div className="space-y-1 my-1">
                {cell.events.slice(0, maxVisibleBadges).map((evt) => {
                  const isCompleted = evt.status === 'completed';
                  return (
                    <div
                      key={evt.id}
                      className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium transition border ${
                        isCompleted
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                          : 'border-[#3A4F1C]/20 bg-[#F7F3E8] text-[#2B3817] hover:bg-[#3A4F1C]/15'
                      }`}
                      title={`${evt.service_title} — ${evt.client_full_name}${isCompleted ? ' (Completed)' : ''}`}
                    >
                      <span className="font-semibold">
                        {isCompleted ? '✓ ' : ''}
                        {evt.service_title}
                      </span>
                    </div>
                  );
                })}

                {overflowCount > 0 && (
                  <span className="text-[10px] text-stone-500 font-medium pl-1 block">
                    +{overflowCount} more
                  </span>
                )}
              </div>

              <div />
            </div>
          );
        })}
      </div>
    </div>
  );
}
