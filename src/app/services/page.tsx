import React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Event Management Services | Wedding, Gala & Production',
  description: 'Full-service luxury wedding planning, debutante gala coordination, corporate event management, LED stage production, and live streaming services across the Philippines.',
  keywords: [
    'wedding planning services Philippines',
    'debutante gala event management',
    'corporate event management Manila',
    'stage production services Philippines',
    'live streaming events service',
    'luxury event coordination Philippines',
  ],
  openGraph: {
    title: 'Event Management Services | Casamento Events',
    description: 'Full-service luxury wedding planning, debutante gala coordination, corporate event management, LED stage production, and live streaming services.',
    url: 'https://casamentoevents.com/services',
    siteName: 'Casamento Events Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Management Services | Casamento Events',
    description: 'Full-service luxury wedding planning, debutante gala coordination, corporate event management, LED stage production, and live streaming services.',
  },
  alternates: {
    canonical: 'https://casamentoevents.com/services',
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <span className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
          What We Offer
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#3A4F1C]">
          Our Services
        </h1>
        <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
        <p className="text-base sm:text-lg text-[#3A4F1C]/80 font-light leading-relaxed">
          From full bespoke planning to same-day coordination, our service details will be launched soon.
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
