// =============================================================================
// home-json-ld.tsx — Structured Data for the Homepage
//
// Injects the following schema.org JSON-LD on the root homepage:
//   1. ProfessionalService — Rich organization card with service area (PH + International)
//   2. Event — One schema per upcoming published event (for Google Event rich results)
//   3. BreadcrumbList — Root breadcrumb (Home)
//
// Per AGENTS.md: JSON-LD for Events, VideoObject, and Organization schemas.
// =============================================================================

import React from 'react';
import type { HomePageContent } from '@/types';

interface HomeJsonLdProps {
    content: HomePageContent;
}

export function HomeJsonLd({ content }: HomeJsonLdProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // -------------------------------------------------------------------------
    // 1. ProfessionalService schema
    //    - Replaces bare Organization to get LocalBusiness-level search features
    //    - areaServed covers both Philippines regions AND international/worldwide
    //      because Casamento serves international clients
    // -------------------------------------------------------------------------
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': ['ProfessionalService', 'LocalBusiness'],
        name: 'Casamento Events Management',
        url: siteUrl,
        logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/icon.jpg`,
            width: 512,
            height: 512,
        },
        description: content.hero.brandline,
        // Physical HQ address (Metro Manila, Philippines)
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Metro Manila',
            addressRegion: 'NCR',
            addressCountry: 'PH',
        },
        // Service area: Philippines regions + worldwide for international clients
        areaServed: [
            {
                '@type': 'Country',
                name: 'Philippines',
            },
            {
                '@type': 'AdministrativeArea',
                name: 'Metro Manila',
            },
            {
                '@type': 'AdministrativeArea',
                name: 'Cebu',
            },
            {
                '@type': 'AdministrativeArea',
                name: 'Davao',
            },
            {
                '@type': 'AdministrativeArea',
                name: 'Boracay',
            },
            // International / destination events
            {
                '@type': 'AdministrativeArea',
                name: 'Worldwide',
            },
        ],
        // Core service offerings
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Event Management Services',
            itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Luxury Wedding Planning & Cinematography' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Debutante Gala Production' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Corporate Event & Stage Production' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Live Streaming & Broadcast Production' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'LED Lighting & Visual Design' } },
            ],
        },
        // Social media profile links
        sameAs: content.socialLinks.map((s) => s.url),
        // Hero showreel image as the primary photo
        image: [content.hero.showreelThumbnail?.asset?.url || `${siteUrl}/icon.jpg`],
    };

    // -------------------------------------------------------------------------
    // 2. Event schema — one per upcoming published event
    // -------------------------------------------------------------------------
    const eventSchemas = content.upcomingEvents.map((event) => ({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        startDate: event.date,
        location: {
            '@type': 'Place',
            name: event.location || 'Metro Manila, Philippines',
            address: {
                '@type': 'PostalAddress',
                addressLocality: event.location || 'Metro Manila',
                addressCountry: 'PH',
            },
        },
        image: [event.coverImage?.asset?.url || `${siteUrl}/icon.jpg`],
        organizer: {
            '@type': 'Organization',
            name: 'Casamento Events Management',
            url: siteUrl,
        },
        eventStatus:
            event.status === 'completed'
                ? 'https://schema.org/EventMovedOnline'
                : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    }));

    // -------------------------------------------------------------------------
    // 3. BreadcrumbList — root level (Home only)
    // -------------------------------------------------------------------------
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            {eventSchemas.map((eventJson, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJson) }}
                />
            ))}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
