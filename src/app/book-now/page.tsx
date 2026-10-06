import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingHero, BookingView } from '@/components/booking';
import { getBookingHeroContent } from '@/lib/services/bookingService';
import { getServiceItems } from '@/lib/services/serviceService';
import { ConnectSection } from '@/components/layout/connect-section';
import { getContactSectionContent } from '@/lib/services/contactService';

export const metadata: Metadata = {
  title: 'Book a Consultation | Event Planning & Production Inquiries',
  description: 'Schedule an event consultation with Casamento Events Management. Request customized packages and proposals for corporate events, brand activations, livestreaming, weddings, or milestone celebrations in the Philippines.',
  keywords: [
    'hire event planner Philippines',
    'corporate event quotation Manila',
    'event production consultation PH',
    'book wedding coordinator Manila',
    'OTD coordination inquiry Philippines',
    'reserve debut production Manila',
    'book Casamento Events',
    'event management rates Philippines',
  ],
  openGraph: {
    title: 'Book a Consultation | Casamento Events Management',
    description: 'Schedule an event consultation with Casamento Events Management. Request customized packages and proposals for corporate events, brand activations, livestreaming, or milestone celebrations.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/book-now`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Consultation | Casamento Events Management',
    description: 'Schedule an event consultation with Casamento Events Management. Request customized packages and proposals for corporate events, brand activations, livestreaming, or milestone celebrations.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/book-now`,
  },
};

export default async function BookNowPage() {
  const [heroContent, availableServices, contactData] = await Promise.all([
    getBookingHeroContent(),
    getServiceItems('all'),
    getContactSectionContent()
  ]);

  return (
    <main className="min-h-screen bg-[#F7F3E8]">
      <BookingHero
        eyebrow={heroContent.eyebrow}
        title={heroContent.title}
        description={heroContent.description}
      />
      <Suspense fallback={<div className="p-12 text-center text-xs text-[#3A4F1C]/70">Loading Booking System...</div>}>
        <BookingView availableServices={availableServices} />
      </Suspense>
      <ConnectSection
        eyebrow={contactData.eyebrow}
        title={contactData.title}
        description={contactData.description}
        socialLinks={contactData.socialLinks}
      />
    </main>
  );
}
