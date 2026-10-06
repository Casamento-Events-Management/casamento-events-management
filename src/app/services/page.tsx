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

export const metadata: Metadata = {
    title: 'Event Management & Production Services | Casamento Events Philippines',
    description: 'Explore our full-service event offerings: corporate conferences, brand activations, creative production, stage and lighting design, broadcast livestreaming, e-commerce live selling, and turnkey wedding coordination across the Philippines.',
    keywords: [
        'corporate event services Manila',
        'brand activation packages PH',
        'event styling and stage design Metro Manila',
        'live selling production services',
        'hybrid event broadcast Philippines',
        'OTD coordination Manila',
        'lights and sounds package Manila',
        'conference organizer Philippines',
        'wedding coordinator Manila',
        'debut packages Philippines',
        'Casamento Events services',
    ],
    openGraph: {
        title: 'Event Management & Production Services | Casamento Events',
        description: 'Full-service event planning, corporate activations, stage production, broadcast livestreaming, and turnkey event management across the Philippines.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/services`,
        siteName: 'Casamento Events Management',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Event Management & Production Services | Casamento Events',
        description: 'Full-service event planning, corporate activations, stage production, broadcast livestreaming, and turnkey event management.',
    },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/services`,
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
        <main className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <ServicesHero
                title={heroContent.title}
                description={heroContent.description}
            />
            <ServicesView
                categories={categories}
                services={services}
                activeCategory="all"
                eyebrow={heroContent.servicesEyebrow}
                title={heroContent.servicesTitle}
                description={heroContent.servicesDescription}
            />
            <ServicesJsonLd services={services} />
            <ConnectSection
                eyebrow={contactData.eyebrow}
                title={contactData.title}
                description={contactData.description}
                socialLinks={contactData.socialLinks}
            />
        </main>
    );
}
