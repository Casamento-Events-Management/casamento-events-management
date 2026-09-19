// =============================================================================
// app/services/page.tsx — Services Main Landing Page
//
// Static / ISR Server Component for the primary /services route.
// Includes Metadata generation, Server Component data fetching, and structured JSON-LD data for SEO.
// =============================================================================

import React from 'react';
import type { Metadata } from 'next';
import { getServiceCategories, getServiceItems } from '@/lib/services/serviceService';
import { getHomePageContent } from '@/lib/services/homeService';
import { ServicesHero } from '@/components/services/services-hero';
import { ServicesView } from '@/components/services/services-view';
import { ServicesJsonLd } from '@/components/services/services-json-ld';
import { ConnectSection } from '@/components/layout/connect-section';

export const metadata: Metadata = {
    title: 'Event Management Services | Wedding, Gala & Technical Production',
    description: 'Bespoke luxury wedding planning, turnkey coordination, broadcast live streaming, and stage lighting production by Casamento Events across the Philippines.',
    keywords: [
        'wedding planning services Philippines',
        'debutante gala event management',
        'corporate event management Manila',
        'stage production services Philippines',
        'live streaming events service Philippines',
        'luxury event coordination Casamento',
    ],
    openGraph: {
        title: 'Event Management Services | Casamento Events',
        description: 'Bespoke luxury wedding planning, turnkey coordination, broadcast live streaming, and stage lighting production.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/services`,
        siteName: 'Casamento Events Management',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Event Management Services | Casamento Events',
        description: 'Bespoke luxury wedding planning, turnkey coordination, broadcast live streaming, and stage lighting production.',
    },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/services`,
    },
};

export default async function ServicesPage() {
    const [categories, services, homeContent] = await Promise.all([
        getServiceCategories(),
        getServiceItems('all'),
        getHomePageContent(),
    ]);

    return (
        <main className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <ServicesHero />
            <ServicesView
                categories={categories}
                services={services}
                activeCategory="all"
            />
            <ServicesJsonLd services={services} />
            <ConnectSection socialLinks={homeContent.socialLinks} />
        </main>
    );
}
