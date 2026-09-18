import React from 'react';
import type { HomePageContent } from '@/types';

interface HomeJsonLdProps {
  content: HomePageContent;
}

export function HomeJsonLd({ content }: HomeJsonLdProps) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Casamento Events Management',
    url: 'https://casamentoevents.com',
    logo: 'https://casamentoevents.com/icon.jpg',
    description: content.hero.brandline,
    sameAs: content.socialLinks.map((s) => s.url),
  };

  const eventSchemas = content.upcomingEvents.map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.date,
    location: {
      '@type': 'Place',
      name: event.location || 'Metro Manila, Philippines',
    },
    image: [event.coverImage.asset.url || ''],
    eventStatus:
      event.status === 'completed'
        ? 'https://schema.org/EventMovedOnline'
        : 'https://schema.org/EventScheduled',
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {eventSchemas.map((eventJson, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJson) }}
        />
      ))}
    </>
  );
}
