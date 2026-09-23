import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import type { UpcomingEvent } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';

interface UpcomingEventsSectionProps {
  events: UpcomingEvent[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function UpcomingEventsSection({ events, eyebrow, title, description }: UpcomingEventsSectionProps) {
  if (!events || events.length === 0) return null;

  const displayEyebrow = (eyebrow && eyebrow.trim()) ? eyebrow : 'Calendar & Events';
  const displayTitle = (title && title.trim()) ? title : 'Upcoming & Featured Events';
  const displayDescription = (description && description.trim()) ? description : 'Discover our upcoming celebrations and past milestone galas curated with timeless elegance.';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <section className="py-20 md:py-28 bg-[#EFEAD8]/60 border-y border-[#3A4F1C]/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          eyebrow={displayEyebrow}
          title={displayTitle}
          description={displayDescription}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.slug.current}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#3A4F1C]/10 shadow-xs hover:shadow-lg transition-all duration-300"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-[#2A3A14]">
                <Image
                  src={event.coverImage.asset.url || ''}
                  alt={event.coverImage.alt || event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 z-10">
                  <Badge status={event.status || 'upcoming'} />
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#BC6F07] uppercase tracking-wider mb-2">
                    <Calendar size={14} />
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <h3 className="text-xl font-serif font-semibold text-[#3A4F1C] mb-3 group-hover:text-[#BC6F07] transition-colors">
                    {event.title}
                  </h3>

                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-[#3A4F1C]/70 mb-4">
                      <MapPin size={14} className="shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
