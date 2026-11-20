import React from 'react';
import type { Metadata } from 'next';
import { getContactSectionContent } from '@/lib/services/contactService';
import { ConnectSection } from '@/components/layout/connect-section';
import { PrivacyContent } from '@/components/privacy/privacy-content';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildOpenGraphImages,
  getSiteUrl,
  SITE_LEGAL_NAME,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

const canonicalUrl = buildCanonicalUrl('/privacy');
const defaultOgImages = buildOpenGraphImages(undefined, `Privacy Policy — ${SITE_NAME}`);

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Official Privacy Policy for Casamento Events Management Inc. Explains our compliance with the Philippine Data Privacy Act of 2012, guest checkout architecture, data security, and media release policies.',
  keywords: [
    'Casamento Events privacy policy',
    'Philippine Data Privacy Act compliance',
    'event management privacy',
    'guest checkout data security',
    'Casamento Events data protection',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Official Privacy Policy for Casamento Events Management Inc. Detailing data protection, guest checkout architecture, and client portfolio release protocols.',
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'en_PH',
    type: 'website',
    images: defaultOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Official Privacy Policy for Casamento Events Management Inc. in compliance with the Philippine Data Privacy Act of 2012.',
    images: defaultOgImages.map((img) => img.url),
  },
};

export default async function PrivacyPolicyPage() {
  const contactData = await getContactSectionContent();
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Official Privacy Policy for Casamento Events Management Inc. in compliance with the Philippine Data Privacy Act of 2012.',
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
    { name: 'Privacy Policy', path: '/privacy' },
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
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#2A3A14]/80 max-w-2xl mx-auto leading-relaxed font-light">
              Casamento Events Management Inc. is dedicated to transparent data stewardship and safeguarding client privacy in accordance with the Philippine Data Privacy Act of 2012.
            </p>
          </div>
        </header>

        {/* Interactive Content With Left Tab Navigation & Alternating Sections */}
        <PrivacyContent />

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
