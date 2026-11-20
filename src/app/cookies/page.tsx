import React from 'react';
import type { Metadata } from 'next';
import { getContactSectionContent } from '@/lib/services/contactService';
import { ConnectSection } from '@/components/layout/connect-section';
import { CookiesContent } from '@/components/cookies/cookies-content';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildOpenGraphImages,
  getSiteUrl,
  SITE_LEGAL_NAME,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

const canonicalUrl = buildCanonicalUrl('/cookies');
const defaultOgImages = buildOpenGraphImages(
  undefined,
  `Cookie Settings & Disclosure — ${SITE_NAME}`
);

export const metadata: Metadata = {
  title: 'Cookie Settings & Disclosure',
  description:
    'Technical disclosure regarding cookie usage, security verification via Google reCAPTCHA, and our policy on commercial advertising cookies.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Cookie Settings & Disclosure | ${SITE_NAME}`,
    description:
      'Technical disclosure regarding essential cookies, Google reCAPTCHA protection, and our zero-advertising cookie policy.',
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'en_PH',
    type: 'website',
    images: defaultOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Cookie Settings & Disclosure | ${SITE_NAME}`,
    description:
      'Technical disclosure regarding essential cookies, Google reCAPTCHA protection, and our zero-advertising cookie policy.',
    images: defaultOgImages.map((img) => img.url),
  },
};

export default async function CookieSettingsPage() {
  const contactData = await getContactSectionContent();
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Cookie Settings & Disclosure | ${SITE_NAME}`,
    description:
      'Technical disclosure regarding cookie usage and anti-spam verification for Casamento Events Management Inc.',
    url: canonicalUrl,
    inLanguage: 'en-PH',
    publisher: {
      '@type': 'Organization',
      name: SITE_LEGAL_NAME,
      url: siteUrl,
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Cookie Settings', path: '/cookies' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="bg-[#F7F3E8] text-[#2A3A14] min-h-screen">
        {/* Page Top Header Banner */}
        <header className="min-h-[45vh] sm:min-h-[52vh] flex flex-col justify-center items-center pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 bg-[#EFEAD8] border-b border-[#3A4F1C]/15 text-center">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2A3A14] tracking-tight">
              Cookie Settings &amp; Disclosure
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#2A3A14]/80 max-w-2xl mx-auto leading-relaxed font-light">
              Technical transparency regarding our essential security cookies, anti-spam protections via Google reCAPTCHA, and strict zero-advertising policy.
            </p>
          </div>
        </header>

        {/* Interactive Content With Left Tab Navigation & Alternating Sections */}
        <CookiesContent />

        {/* Pre-Footer Connect / Contact Section */}
        <ConnectSection
          eyebrow={contactData.eyebrow}
          title={contactData.title}
          description={contactData.description}
          socialLinks={contactData.socialLinks}
        />
      </div>
    </>
  );
}
