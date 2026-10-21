'use client';

// =============================================================================
// components/admin/overview/today-event-spotlight.tsx — Today's Event Spotlight
// =============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckSquare,
  ArrowUpRight,
} from 'lucide-react';
import type { OverviewTodayEvent } from '@/types/admin-overview';

interface TodayEventSpotlightProps {
  event: OverviewTodayEvent;
}

export function TodayEventSpotlight({ event }: TodayEventSpotlightProps) {
  const percentComplete =
    event.total_tasks > 0
      ? Math.round((event.completed_tasks / event.total_tasks) * 100)
      : 100;

  return (
    <div className="rounded-2xl border border-[#3A4F1C]/25 bg-gradient-to-br from-[#F7F3E8] to-white p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Top Banner Tag */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3A4F1C] text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
          <Sparkles className="h-3 w-3" />
          <span>Active Today</span>
        </span>
        <span className="text-xs font-mono font-medium text-stone-500">
          {event.booking_reference}
        </span>
      </div>

      {/* Main Details & Right-Aligned Action */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Event & Client Info */}
        <div className="space-y-1 min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#2B3817] truncate">
            {event.service_title}
          </h2>
          <p className="text-xs text-stone-600 font-medium">
            Client: <span className="font-semibold text-stone-800">{event.client_full_name}</span>
          </p>

          {/* Quick Telemetry & Contact */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-stone-500 pt-0.5">
            {event.event_time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>{event.event_time}</span>
              </span>
            )}

            {(event.venue_city || event.venue_name) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span className="truncate max-w-[200px]">
                  {event.venue_name ? `${event.venue_name}, ` : ''}{event.venue_city || ''}
                </span>
              </span>
            )}

            {event.client_phone && (
              <a
                href={`tel:${event.client_phone}`}
                title={`Call ${event.client_full_name}`}
                className="inline-flex items-center gap-1 text-[#3A4F1C] hover:underline font-medium cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{event.client_phone}</span>
              </a>
            )}

            {event.client_email && (
              <a
                href={`mailto:${event.client_email}`}
                title={`Email ${event.client_full_name}`}
                className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate max-w-[180px]">{event.client_email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Side: Progress Meter & Navigation Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:ml-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200/60 w-full md:w-auto">
          {event.total_tasks > 0 && (
            <div className="space-y-1 min-w-[140px] flex-1 sm:flex-initial">
              <div className="flex items-center gap-2 text-[11px] text-stone-600 font-medium">
                <CheckSquare className="h-3.5 w-3.5 text-[#3A4F1C]" />
                <span>Tasks: {event.completed_tasks} / {event.total_tasks}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-[#3A4F1C] transition-all duration-300"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          )}

          <Link
            href={`/admin/bookings?tab=calendar&modal=inspect&bookingId=${event.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3A4F1C] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2B3817] transition cursor-pointer shrink-0"
          >
            <span>Open Event Sheet</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
