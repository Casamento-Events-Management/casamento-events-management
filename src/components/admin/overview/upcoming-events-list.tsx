'use client';

// =============================================================================
// components/admin/overview/upcoming-events-list.tsx — Compact Upcoming Schedule
// =============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { OverviewUpcomingEvent } from '@/types/admin-overview';
import { calculateDaysRemaining } from '@/lib/utils/dateUtils';

interface UpcomingEventsListProps {
  events: OverviewUpcomingEvent[];
}

export function UpcomingEventsList({ events }: UpcomingEventsListProps) {
  const formatShortDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getUrgencyBadge = (eventDate: string) => {
    const days = calculateDaysRemaining(eventDate);
    if (days === 0) {
      return (
        <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 animate-pulse">
          Today
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
          Tomorrow
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="rounded-md bg-[#BC6F07]/15 px-2 py-0.5 text-[10px] font-semibold text-[#BC6F07]">
          In {days}d
        </span>
      );
    }
    return (
      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
        In {days}d
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header with Right-Aligned Link */}
      <div className="flex items-center pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#3A4F1C]" />
          <h2 className="text-sm font-semibold text-stone-900">
            Upcoming Schedule
          </h2>
          <span className="rounded-full bg-stone-100 px-2 py-0.2 text-[11px] font-bold text-stone-600">
            {events.length}
          </span>
        </div>

        <Link
          href="/admin/bookings?tab=calendar"
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#3A4F1C] hover:text-[#2B3817] hover:underline"
        >
          <span>Full Calendar</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-400">
          No confirmed events currently scheduled in the upcoming weeks.
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {events.map((event) => {
            const hasTasks = event.total_tasks > 0;
            const percent = hasTasks
              ? Math.round((event.completed_tasks / event.total_tasks) * 100)
              : 100;

            return (
              <div
                key={event.id}
                className="group py-3 sm:py-2.5 hover:bg-[#F7F3E8]/30 rounded-xl px-2.5 sm:px-2 transition -mx-2"
              >
                {/* Main Row: Stacked on mobile, horizontal on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                  {/* Top line (mobile) / Left section (desktop): Date & Urgency */}
                  <div className="flex items-center gap-2 sm:w-36 shrink-0">
                    <span className="text-xs font-bold text-stone-800">
                      {formatShortDate(event.event_date)}
                    </span>
                    {getUrgencyBadge(event.event_date)}

                    {/* Mobile-only right-aligned action button */}
                    <Link
                      href={`/admin/bookings?tab=calendar&date=${event.event_date}&modal=inspect&bookingId=${event.id}`}
                      title="Inspect in Calendar"
                      className="sm:hidden ml-auto h-7.5 w-7.5 rounded-lg border border-stone-200 bg-white inline-flex items-center justify-center text-stone-500 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0 shadow-2xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Event Name & Client / Venue */}
                  <div className="min-w-0 flex-1 space-y-0.5 sm:pr-2">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {event.service_title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                      <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
                        <User className="h-3 w-3 text-stone-400 shrink-0" />
                        <span className="truncate">{event.client_full_name}</span>
                      </span>
                      {event.venue_city && (
                        <span className="inline-flex items-center gap-1 truncate max-w-[130px]">
                          <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                          <span className="truncate">{event.venue_city}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop Right Side: Task Progress & Jump Button */}
                  <div className="hidden sm:flex items-center gap-3 sm:ml-auto shrink-0">
                    {hasTasks ? (
                      <div
                        className="w-28 space-y-1 text-right"
                        title={`${event.completed_tasks} of ${event.total_tasks} checklist tasks completed`}
                      >
                        <span className="text-[10px] font-semibold text-stone-600">
                          {event.completed_tasks}/{event.total_tasks} tasks
                        </span>
                        <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full bg-[#3A4F1C] transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-stone-400 italic w-28 text-right">
                        No tasks
                      </span>
                    )}

                    <Link
                      href={`/admin/bookings?tab=calendar&date=${event.event_date}&modal=inspect&bookingId=${event.id}`}
                      title="Inspect in Calendar"
                      className="h-7 w-7 rounded-lg border border-stone-200 bg-white inline-flex items-center justify-center text-stone-500 hover:text-[#3A4F1C] hover:border-[#3A4F1C]/40 hover:bg-stone-50 transition shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Mobile-only Bottom Row: Full-width Task Progress Meter (Rendered when tasks exist) */}
                {hasTasks && (
                  <div
                    className="sm:hidden mt-2 pt-1.5 border-t border-stone-100 space-y-1"
                    title={`${event.completed_tasks} of ${event.total_tasks} checklist tasks completed`}
                  >
                    <div className="flex items-center text-[10px] text-stone-500">
                      <span className="font-medium text-stone-600">
                        Tasks: {event.completed_tasks}/{event.total_tasks} completed
                      </span>
                      <span className="ml-auto font-semibold text-stone-700">
                        {percent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-[#3A4F1C] transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
