// =============================================================================
// app/portfolio/page.tsx — Portfolio Main Landing Page ("All" Category)
//
// Static / ISR Server Component for the primary /portfolio route.
// Includes Metadata generation and structured JSON-LD data for SEO.
// =============================================================================

import type { Metadata } from 'next';
import {
    getPortfolioCategories,
    getPortfolioHeroContent,
    getPortfolioItemsForGallery,
    getPortfolioItemTotalCount,
    getPortfolioUpcomingEvents
} from '@/lib/services/portfolioService';
import { getContactSectionContent } from '@/lib/services/contactService';

import { PortfolioHero } from '@/components/portfolio/portfolio-hero';
import { PortfolioView } from '@/components/portfolio/portfolio-view';
import { PortfolioJsonLd } from '@/components/portfolio/portfolio-json-ld';
import { UpcomingEventsSection } from '@/components/home/upcoming-events-section';
import { ConnectSection } from '@/components/layout/connect-section';

export const metadata: Metadata = {
    title: 'Portfolio Showcase | Corporate Events, Brand Activations, Films & Broadcasts',
    description: 'Explore our portfolio of corporate conferences, brand activations, wedding films, stage and lighting designs, and broadcast live streams by Casamento Events across the Philippines.',
    keywords: [
        'event portfolio Philippines',
        'corporate event videos Manila',
        'brand activation portfolio PH',
        'wedding films portfolio Philippines',
        'stage production portfolio Manila',
        'live streaming portfolio Philippines',
        'event cinematography showcase',
        'lights and sounds event portfolio',
        'Casamento Events portfolio',
    ],
    openGraph: {
        title: 'Casamento Events Portfolio | Event Productions & Showcase',
        description: 'Explore our portfolio of corporate conferences, brand activations, wedding films, stage productions, and broadcast live streams.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/portfolio`,
        siteName: 'Casamento Events Management',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Casamento Events Portfolio | Event Productions & Showcase',
        description: 'Explore our portfolio of corporate conferences, brand activations, wedding films, stage productions, and broadcast live streams.',
    },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/portfolio`,
    },
};

export default async function PortfolioPage() {
    const [categories, items, totalCount, heroContent, upcomingEventsData, contactData] = await Promise.all([
        getPortfolioCategories(),
        getPortfolioItemsForGallery('all', 1, 20),
        getPortfolioItemTotalCount('all'),
        getPortfolioHeroContent(),
        getPortfolioUpcomingEvents(),
        getContactSectionContent(),
    ]);

    const showViewMore = totalCount > 20;

    return (
        <main className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <PortfolioHero
                title={heroContent.title}
                description={heroContent.description}
            />

            <UpcomingEventsSection
                events={upcomingEventsData.upcomingEvents}
                eyebrow={upcomingEventsData.eyebrow}
                title={upcomingEventsData.title}
                description={upcomingEventsData.description}
            />

            <PortfolioView
                categories={categories}
                items={items}
                activeCategory="all"
                galleryEyebrow={heroContent.galleryEyebrow}
                galleryTitle={heroContent.galleryTitle}
                galleryDescription={heroContent.galleryDescription}
                showViewMore={showViewMore}
            />
            <PortfolioJsonLd items={items} />
            <ConnectSection
                eyebrow={contactData.eyebrow}
                title={contactData.title}
                description={contactData.description}
                socialLinks={contactData.socialLinks}
            />
        </main>
    );
}
