// =============================================================================
// home-json-ld.tsx — Structured Data for the Homepage
//
// Injects schema.org JSON-LD on the root homepage:
//   1. WebSite — Brand & publisher identity for sitelinks and entity linking
//   2. ProfessionalService / LocalBusiness — Full-service events management in PH
//   3. Event — Upcoming scheduled events (for Google Event rich results)
//   4. VideoObject — Featured teaser highlight videos
//   5. BreadcrumbList — Root breadcrumb (Home)
// =============================================================================

import React from 'react';
import type { HomePageContent, ServiceCategory } from '@/types';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  DEFAULT_OG_IMAGE_PATH,
  getSiteUrl,
  SITE_EMAIL,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_PHONE,
  toIsoDateString,
} from '@/lib/utils/seoUtils';
import { parseVideoSource } from '@/lib/utils/videoUtils';

interface HomeJsonLdProps {
  content: HomePageContent;
  serviceCategories?: ServiceCategory[];
}

const DEFAULT_OFFER_CATALOG_SERVICES = [
  'Social Events Management',
  'Corporate Events Management',
  'Brand Activations & Roadshows',
  'Creative Production',
  'Event Styling & Production Design',
  'Livestreaming & Digital Events',
  'E-Commerce Production Management',
  'Digital Advertising',
];

export function HomeJsonLd({ content, serviceCategories }: HomeJsonLdProps) {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  const offerNames =
    serviceCategories && serviceCategories.length > 0
      ? serviceCategories.map((cat) => cat.title)
      : DEFAULT_OFFER_CATALOG_SERVICES;

  const sameAsUrls = (content.socialLinks || [])
    .map((s) => s.url?.trim())
    .filter((url): url is string => Boolean(url));

  const primaryImage =
    content.hero?.slides?.[0]?.image?.asset?.url ||
    content.hero?.slides?.[0]?.videoPoster?.asset?.url ||
    buildCanonicalUrl(DEFAULT_OG_IMAGE_PATH);

  // ---------------------------------------------------------------------------
  // 1. WebSite schema
  // ---------------------------------------------------------------------------
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: 'en-PH',
    publisher: {
      '@id': orgId,
    },
  };

  // ---------------------------------------------------------------------------
  // 2. ProfessionalService + LocalBusiness schema
  // ---------------------------------------------------------------------------
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': orgId,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: siteUrl,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    foundingDate: '2012',
    priceRange: '₱₱–₱₱₱',
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon.png`,
      width: 512,
      height: 512,
    },
    image: [primaryImage],
    description:
      content.hero?.slides?.[0]?.description ||
      'Full-service events management and creative production company in the Philippines delivering corporate events, brand activations, roadshows, social celebrations, event styling, broadcast livestreaming, e-commerce production, and digital advertising nationwide.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Metro Manila',
      addressRegion: 'NCR',
      addressCountry: 'PH',
    },
    areaServed: [
      { '@type': 'Country', name: 'Philippines' },
      { '@type': 'AdministrativeArea', name: 'Metro Manila' },
      { '@type': 'AdministrativeArea', name: 'Luzon' },
      { '@type': 'AdministrativeArea', name: 'Visayas' },
      { '@type': 'AdministrativeArea', name: 'Mindanao' },
      { '@type': 'AdministrativeArea', name: 'Tagaytay' },
      { '@type': 'AdministrativeArea', name: 'Cebu' },
      { '@type': 'AdministrativeArea', name: 'Davao' },
      { '@type': 'AdministrativeArea', name: 'Boracay' },
    ],
    knowsAbout: offerNames,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Events Management & Production Services',
      itemListElement: offerNames.map((name) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name,
          provider: { '@id': orgId },
        },
      })),
    },
    ...(sameAsUrls.length > 0 && { sameAs: sameAsUrls }),
  };

  // ---------------------------------------------------------------------------
  // 3. Event schema — only upcoming / active scheduled events
  // ---------------------------------------------------------------------------
  const upcomingList = (content.upcomingEvents || []).filter(
    (event) => event.status !== 'completed' && Boolean(event.title) && Boolean(event.date)
  );
  const eventSchemas = upcomingList.map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: toIsoDateString(event.date) || event.date,
    location: {
      '@type': 'Place',
      name: event.location || 'Metro Manila, Philippines',
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location || 'Metro Manila',
        addressCountry: 'PH',
      },
    },
    image: [event.coverImage?.asset?.url || buildCanonicalUrl(DEFAULT_OG_IMAGE_PATH)],
    organizer: {
      '@type': 'Organization',
      '@id': orgId,
      name: SITE_NAME,
      url: siteUrl,
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  }));

  // ---------------------------------------------------------------------------
  // 4. VideoObject schemas — Featured Teaser Highlights
  // ---------------------------------------------------------------------------
  const fallbackUploadDate = toIsoDateString(content._updatedAt || content._createdAt);
  const teaserVideoSchemas = (content.teaserVideos || [])
    .map((teaser) => {
      const parsed = parseVideoSource(teaser.video, false);
      const thumbnailUrl = teaser.thumbnail?.asset?.url;
      if (!thumbnailUrl || (!parsed.embedUrl && !parsed.directUrl)) return null;

      return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: teaser.title,
        description: teaser.description || `${teaser.title} — ${SITE_NAME}`,
        thumbnailUrl: [thumbnailUrl],
        ...(fallbackUploadDate && { uploadDate: fallbackUploadDate }),
        ...(parsed.sourceType === 'external' && parsed.embedUrl
          ? { embedUrl: parsed.embedUrl }
          : parsed.directUrl
            ? { contentUrl: parsed.directUrl }
            : {}),
        publisher: {
          '@type': 'Organization',
          '@id': orgId,
          name: SITE_NAME,
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/icon.png`,
          },
        },
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // ---------------------------------------------------------------------------
  // 5. BreadcrumbList — root level (Home)
  // ---------------------------------------------------------------------------
  const breadcrumbSchema = buildBreadcrumbJsonLd([{ name: 'Home', path: '/' }]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
      />
      {eventSchemas.map((eventJson, index: number) => (
        <script
          key={`event-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(eventJson) }}
        />
      ))}
      {teaserVideoSchemas.map((videoJson, index: number) => (
        <script
          key={`teaser-video-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(videoJson) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
