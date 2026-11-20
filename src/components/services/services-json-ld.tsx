import React from 'react';
import type { ServiceCategory, ServiceItem } from '@/types';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  getSiteUrl,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
} from '@/lib/utils/seoUtils';

interface ServicesJsonLdProps {
  services: ServiceItem[];
  categories?: ServiceCategory[];
}

/**
 * ServicesJsonLd Component
 *
 * Injects structured schema.org JSON-LD data for Services, Service Categories,
 * geographic areaServed coverage, and BreadcrumbList.
 */
export function ServicesJsonLd({ services, categories }: ServicesJsonLdProps) {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;

  const provider = {
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': orgId,
    name: SITE_NAME,
    url: siteUrl,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Metro Manila',
      addressRegion: 'NCR',
      addressCountry: 'PH',
    },
  };

  const areaServed = [
    { '@type': 'Country', name: 'Philippines' },
    { '@type': 'AdministrativeArea', name: 'Metro Manila' },
    { '@type': 'AdministrativeArea', name: 'Luzon' },
    { '@type': 'AdministrativeArea', name: 'Visayas' },
    { '@type': 'AdministrativeArea', name: 'Mindanao' },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Casamento Events Management Services',
    url: buildCanonicalUrl('/services'),
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        '@id': `${siteUrl}/services#${service.slug}`,
        name: service.title,
        serviceType: service.serviceType,
        category: service.category.title,
        description: service.fullDescription || service.shortDescription,
        provider,
        areaServed,
        ...(service.images && service.images[0]?.url ? { image: service.images[0].url } : {}),
      },
    })),
  };

  const offerCatalogSchema =
    categories && categories.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'OfferCatalog',
          name: 'Events Management & Production Categories',
          url: buildCanonicalUrl('/services'),
          itemListElement: categories.map((cat) => ({
            '@type': 'OfferCatalog',
            name: cat.title,
            ...(cat.description ? { description: cat.description } : {}),
          })),
        }
      : null;

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schemaData) }}
      />
      {offerCatalogSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(offerCatalogSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
