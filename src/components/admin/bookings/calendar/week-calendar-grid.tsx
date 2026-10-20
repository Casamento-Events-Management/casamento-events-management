'use client';

// =============================================================================
// week-calendar-grid.tsx — 7-Day Vertical Track Week View Grid
// =============================================================================

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BookingRecord } from '@/types/booking';

interface WeekCalendarGridProps {
  currentDate: Date;
  selectedDate: string; // YYYY-MM-DD
  events: BookingRecord[];
  onSelectDate: (dateStr: string) => void;
  onSelectEvent: (booking: BookingRecord) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
}

export function WeekCalendarGrid({
  currentDate,
  selectedDate,
  events,
  onSelectDate,
  onSelectEvent,
  onPrevWeek,
  onNextWeek,
  onToday,
  viewMode,
  onViewModeChange,
}: WeekCalendarGridProps) {
  // Today's date string
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Compute 7 days of the week starting Monday
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    // Distance to Monday (0 = Sun, 1 = Mon ... 6 = Sat)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const days: Array<{
      dateStr: string;
      dateObj: Date;
      dayName: string;
      dayNum: number;
      isToday: boolean;
      isSelected: boolean;
      events: BookingRecord[];
    }> = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const dateNum = current.getDate();
      const dStr = `${y}-${m}-${String(dateNum).padStart(2, '0')}`;

      const dayEvents = events.filter((e) => e.event_date === dStr);

      days.push({
        dateStr: dStr,
        dateObj: current,
        dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: dateNum,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        events: dayEvents,
      });
    }

    return days;
  }, [currentDate, events, todayStr, selectedDate]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0].dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = weekDays[6].dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} – ${end}`;
  }, [weekDays]);

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/15 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#3A4F1C]/10 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#2B3817]">
            {weekRangeLabel}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevWeek}
              title="Previous week"
              className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNextWeek}
              title="Next week"
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

        {/* View Mode Toggle */}
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

      {/* 7 Vertical Day Tracks */}
      <div className="grid grid-cols-7 divide-x divide-stone-100 bg-white min-h-[460px]">
        {weekDays.map((day) => (
          <div
            key={day.dateStr}
            onClick={() => onSelectDate(day.dateStr)}
            className={`p-2 cursor-pointer transition flex flex-col ${
              day.isSelected ? 'bg-[#F7F3E8]/50 ring-2 ring-inset ring-[#3A4F1C]' : 'hover:bg-stone-50/70'
            }`}
          >
            {/* Day Header */}
            <div className="text-center pb-2 border-b border-stone-100">
              <span className="text-[10px] font-semibold text-stone-400 block uppercase">
                {day.dayName}
              </span>
              <span
                className={`inline-flex items-center justify-center text-xs font-bold rounded-full h-6 w-6 mt-0.5 ${
                  day.isToday
                    ? 'bg-[#3A4F1C] text-white shadow-2xs'
                    : 'text-stone-800'
                }`}
              >
                {day.dayNum}
              </span>
            </div>

            {/* Events on this day */}
            <div className="space-y-1.5 pt-2 flex-1">
              {day.events.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-stone-300">
                  No events
                </div>
              ) : (
                day.events.map((evt) => {
                  const isCompleted = evt.status === 'completed';
                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className={`rounded-lg border p-1.5 text-xs transition shadow-2xs space-y-0.5 cursor-pointer ${
                        isCompleted
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
                          : 'border-[#3A4F1C]/20 bg-[#F7F3E8] text-[#2B3817] hover:bg-[#3A4F1C]/15'
                      }`}
                    >
                      <span className="font-semibold block text-[11px] leading-tight truncate">
                        {isCompleted ? '✓ ' : ''}
                        {evt.service_title}
                      </span>
                      <span className="text-[10px] text-stone-600 block truncate">
                        {evt.client_full_name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
