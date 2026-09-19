import React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Book Your Event | Consultation & Reservation',
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

export default function BookNowPage() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <span className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
          Consultation & Reservation
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#3A4F1C]">
          Book Your Event
        </h1>
        <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
        <p className="text-base sm:text-lg text-[#3A4F1C]/80 font-light leading-relaxed">
          Interactive booking inquiry form integration will be connected in Phase 2. Connect with us via social links or return home.
        </p>
        <div className="pt-6">
          <Button href="/" variant="primary" size="md">
            Return to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}
