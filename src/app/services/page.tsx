// =============================================================================
// app/services/page.tsx — Services Main Landing Page
//
// Static / ISR Server Component for the primary /services route.
// Includes Metadata generation, Server Component data fetching, and structured JSON-LD data for SEO.
// =============================================================================

import React from 'react';
import type { Metadata } from 'next';
import { getServiceCategories, getServiceItems, getServicesHeroContent } from '@/lib/services/serviceService';
import { getContactSectionContent } from '@/lib/services/contactService';
import { ServicesHero } from '@/components/services/services-hero';
import { ServicesView } from '@/components/services/services-view';
import { ServicesJsonLd } from '@/components/services/services-json-ld';
import { ConnectSection } from '@/components/layout/connect-section';
import {
    buildCanonicalUrl,
    buildOpenGraphImages,
    SITE_NAME,
} from '@/lib/utils/seoUtils';

const canonicalUrl = buildCanonicalUrl('/services');
const defaultOgImages = buildOpenGraphImages(
    undefined,
    'Event Management & Production Services — Casamento Events Management Philippines'
);

export const metadata: Metadata = {
    title: 'Event Management & Production Services Philippines',
    description:
        'Explore full-service events management in the Philippines: corporate conferences, brand activations, roadshows, creative production, stage and lighting design, broadcast livestreaming, e-commerce live selling, and social events.',
    keywords: [
        'corporate event services Manila',
        'brand activation packages PH',
        'event styling and stage design Metro Manila',
        'live selling production services',
        'hybrid event broadcast Philippines',
        'lights and sounds package Manila',
        'conference organizer Philippines',
        'social event coordination Manila',
        'digital advertising production PH',
        'Casamento Events services',
    ],
    openGraph: {
        title: `Event Management & Production Services Philippines | ${SITE_NAME}`,
        description:
            'Full-service event planning, corporate events, brand activations, creative production, stage styling, broadcast livestreaming, and e-commerce production across the Philippines.',
        url: canonicalUrl,
        siteName: SITE_NAME,
        locale: 'en_PH',
        type: 'website',
        images: defaultOgImages,
    },
    twitter: {
        card: 'summary_large_image',
        title: `Event Management & Production Services Philippines | ${SITE_NAME}`,
        description:
            'Full-service event planning, corporate events, brand activations, creative production, stage styling, broadcast livestreaming, and e-commerce production across the Philippines.',
        images: defaultOgImages.map((img) => img.url),
    },
    alternates: {
        canonical: canonicalUrl,
    },
};

export default async function ServicesPage() {
    const [categories, services, contactData, heroContent] = await Promise.all([
        getServiceCategories(),
        getServiceItems('all'),
        getContactSectionContent(),
        getServicesHeroContent(),
    ]);

    return (
        <div className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <ServicesHero
                title={heroContent.title}
                description={heroContent.description}
                bannerImages={heroContent.bannerImages}
            />
            <ServicesView
                categories={categories}
                services={services}
                activeCategory="all"
                eyebrow={heroContent.servicesEyebrow}
                title={heroContent.servicesTitle}
                description={heroContent.servicesDescription}
            />
            <ServicesJsonLd services={services} categories={categories} />
            <ConnectSection
                eyebrow={contactData.eyebrow}
                title={contactData.title}
                description={contactData.description}
                socialLinks={contactData.socialLinks}
            />
        </div>
    );
}
