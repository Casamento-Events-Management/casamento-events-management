import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingHero, BookingView } from '@/components/booking';
import { getBookingHeroContent } from '@/lib/services/bookingService';
import { getServiceItems } from '@/lib/services/serviceService';
import { ConnectSection } from '@/components/layout/connect-section';
import { getContactSectionContent } from '@/lib/services/contactService';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildOpenGraphImages,
  getSiteUrl,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
} from '@/lib/utils/seoUtils';

const canonicalUrl = buildCanonicalUrl('/book-now');
const defaultOgImages = buildOpenGraphImages(
  undefined,
  `Book an Event Consultation — ${SITE_NAME}`
);

export const metadata: Metadata = {
  title: 'Book an Event Consultation & Production Proposal',
  description:
    'Schedule an event consultation with Casamento Events Management. Request tailored packages and proposals for corporate events, brand activations, roadshows, livestreaming, creative production, or social celebrations across the Philippines.',
  keywords: [
    'hire event planner Philippines',
    'corporate event quotation Manila',
    'brand activation proposal PH',
    'event production consultation Philippines',
    'book event organizer Manila',
    'book Casamento Events',
    'event management rates Philippines',
  ],
  openGraph: {
    title: `Book an Event Consultation & Production Proposal | ${SITE_NAME}`,
    description:
      'Schedule an event consultation with Casamento Events Management. Request tailored packages and proposals for corporate events, brand activations, livestreaming, or social celebrations.',
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'en_PH',
    type: 'website',
    images: defaultOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Book an Event Consultation & Production Proposal | ${SITE_NAME}`,
    description:
      'Schedule an event consultation with Casamento Events Management for corporate events, brand activations, livestreaming, or social celebrations.',
    images: defaultOgImages.map((img) => img.url),
  },
  alternates: {
    canonical: canonicalUrl,
  },
};

export default async function BookNowPage() {
  const [heroContent, availableServices, contactData] = await Promise.all([
    getBookingHeroContent(),
    getServiceItems('all'),
    getContactSectionContent(),
  ]);

  const siteUrl = getSiteUrl();
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Book an Event Consultation | ${SITE_NAME}`,
    description:
      'Request an event management consultation or production proposal from Casamento Events Management in the Philippines.',
    url: canonicalUrl,
    inLanguage: 'en-PH',
    mainEntity: {
      '@type': ['ProfessionalService', 'LocalBusiness'],
      '@id': `${siteUrl}/#organization`,
      name: SITE_NAME,
      url: siteUrl,
      telephone: SITE_PHONE,
      email: SITE_EMAIL,
      areaServed: {
        '@type': 'Country',
        name: 'Philippines',
      },
    },
  };

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Book Now', path: '/book-now' },
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3E8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

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
    </div>
  );
}
