import React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us | Our Story & Heritage',
  description: 'Learn about Casamento Events Management — our passion for crafting luxury weddings, grand debutante galas, and extraordinary celebrations across the Philippines and beyond.',
  keywords: [
    'about Casamento Events',
    'event planning company Philippines',
    'luxury wedding planner history',
    'Casamento Events Management team',
  ],
  openGraph: {
    title: 'About Casamento Events | Our Story & Heritage',
    description: 'Learn about Casamento Events Management — our passion for crafting luxury weddings, grand debutante galas, and extraordinary celebrations.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Casamento Events | Our Story & Heritage',
    description: 'Learn about Casamento Events Management — our passion for crafting luxury weddings, grand debutante galas, and extraordinary celebrations.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <span className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
          Our Heritage
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#3A4F1C]">
          About Us
        </h1>
        <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
        <p className="text-base sm:text-lg text-[#3A4F1C]/80 font-light leading-relaxed">
          Casamento Events Management creates unforgettable celebrations that last a lifetime. Detailed story coming soon.
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
