import React from 'react';
import type { Metadata } from 'next';
import { BookingHero } from '@/components/booking';
import { getBookingHeroContent } from '@/lib/services/bookingService';

export const metadata: Metadata = {
  title: 'Book Your Event | SERVICE BOOKING',
  description: 'Reserve your event date and schedule a free consultation with Casamento Events Management. Luxury weddings, debutante galas, corporate events, and live streaming productions.',
  keywords: [
    'book wedding planner Philippines',
    'event consultation Manila',
    'hire event planner Philippines',
    'luxury wedding booking Philippines',
    'reserve debutante gala production',
    'book Casamento Events',
  ],
  openGraph: {
    title: 'Book Your Event | Casamento Events Management',
    description: 'Reserve your event date and schedule a free consultation. Luxury weddings, debutante galas, corporate events, and live streaming productions.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/book-now`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Your Event | Casamento Events Management',
    description: 'Reserve your event date and schedule a free consultation. Luxury weddings, debutante galas, corporate events, and live streaming productions.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/book-now`,
  },
};

export default async function BookNowPage() {
  const heroContent = await getBookingHeroContent();

  return (
    <main className="min-h-screen bg-[#F7F3E8]">
      <BookingHero
        eyebrow={heroContent.eyebrow}
        title={heroContent.title}
        description={heroContent.description}
      />
    </main>
  );
}
