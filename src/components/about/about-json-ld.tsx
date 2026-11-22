import React from 'react';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  getSiteUrl,
  SITE_EMAIL,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_PHONE,
} from '@/lib/utils/seoUtils';
import type { SocialLink } from '@/types';

interface AboutJsonLdProps {
  socialLinks?: SocialLink[];
}

export function AboutJsonLd({ socialLinks = [] }: AboutJsonLdProps) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl('/about');
  const sameAs = socialLinks
    .map((s) => s.url?.trim())
    .filter((url): url is string => Boolean(url));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    description:
      'The story, mission, vision, core values, and nationwide event production capabilities of Casamento Events Management.',
    url: canonicalUrl,
    inLanguage: 'en-PH',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: SITE_NAME,
      legalName: SITE_LEGAL_NAME,
      url: siteUrl,
      telephone: SITE_PHONE,
      email: SITE_EMAIL,
      foundingDate: '2012',
      description:
        'A full-service events, creative, and production company offering corporate event management, brand activations and roadshows, social events, creative production, event styling, digital advertising, livestreaming, and e-commerce production management across the Philippines.',
      areaServed: [
        { '@type': 'Country', name: 'Philippines' },
        { '@type': 'AdministrativeArea', name: 'Metro Manila' },
        { '@type': 'AdministrativeArea', name: 'Luzon' },
        { '@type': 'AdministrativeArea', name: 'Visayas' },
        { '@type': 'AdministrativeArea', name: 'Mindanao' },
      ],
      knowsAbout: [
        'Event Management',
        'Corporate Events',
        'Brand Activations and Roadshows',
        'Social Events',
        'Creative Production',
        'Event Styling and Production Design',
        'Livestreaming and Digital Events',
        'E-Commerce Production Management',
        'Digital Advertising',
      ],
      ...(sameAs.length > 0 && { sameAs }),
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
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
    </>
  );
}
