import React from 'react';
import type { Metadata } from 'next';
import { getContactSectionContent } from '@/lib/services/contactService';
import { ConnectSection } from '@/components/layout/connect-section';
import { TermsContent } from '@/components/terms/terms-content';

export const metadata: Metadata = {
  title: 'Terms of Service | Casamento Events Management',
  description:
    'Official Terms of Service for Casamento Events Management Inc. Detailing scope of services, booking deposits, rescheduling, cancellation policies, intellectual property, and governing law.',
  keywords: [
    'Casamento Events terms of service',
    'event management agreement Philippines',
    'event booking terms Manila',
    'wedding coordination contract terms',
    'Casamento Events cancellation policy',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | Casamento Events Management',
    description:
      'Official Terms of Service for Casamento Events Management Inc. Governing event design, booking deposits, rescheduling, and client agreements.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/terms`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
};

export default async function TermsOfServicePage() {
  const contactData = await getContactSectionContent();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service | Casamento Events Management',
    description:
      'Official Terms of Service for Casamento Events Management Inc. governing event bookings and production agreements.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/terms`,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Casamento Events Management Inc.',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-[#F7F3E8] text-[#2A3A14] min-h-screen">
        {/* Page Top Header Banner with Enlarged Viewport Height */}
        <header className="min-h-[45vh] sm:min-h-[52vh] flex flex-col justify-center items-center pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 bg-[#EFEAD8] border-b border-[#3A4F1C]/15 text-center">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2A3A14] tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#2A3A14]/80 max-w-2xl mx-auto leading-relaxed font-light">
              Clear, transparent operational standards and contractual agreements governing our event planning, styling, and technical production services.
            </p>
          </div>
        </header>

        {/* Interactive Content With Left Tab Navigation & Alternating Sections */}
        <TermsContent />

        {/* Pre-Footer Connect / Contact Section */}
        <ConnectSection
          eyebrow={contactData.eyebrow}
          title={contactData.title}
          description={contactData.description}
          socialLinks={contactData.socialLinks}
        />
      </main>
    </>
  );
}
