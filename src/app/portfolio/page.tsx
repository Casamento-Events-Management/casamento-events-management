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
import {
    buildCanonicalUrl,
    buildOpenGraphImages,
    SITE_NAME,
} from '@/lib/utils/seoUtils';

const canonicalUrl = buildCanonicalUrl('/portfolio');
const defaultOgImages = buildOpenGraphImages(
    undefined,
    'Event Production Portfolio & Showcase — Casamento Events Management Philippines'
);

export const metadata: Metadata = {
    title: 'Event Production Portfolio & Showcase Philippines',
    description:
        'Explore our portfolio of corporate conferences, brand activations, roadshows, stage and lighting designs, broadcast livestreams, and social celebrations across the Philippines.',
    keywords: [
        'event portfolio Philippines',
        'corporate event videos Manila',
        'brand activation portfolio PH',
        'stage production portfolio Manila',
        'live streaming portfolio Philippines',
        'event cinematography showcase',
        'lights and sounds event portfolio',
        'Casamento Events portfolio',
    ],
    openGraph: {
        title: `Event Production Portfolio & Showcase | ${SITE_NAME}`,
        description:
            'Explore our portfolio of corporate conferences, brand activations, roadshows, stage productions, broadcast livestreams, and social events across the Philippines.',
        url: canonicalUrl,
        siteName: SITE_NAME,
        locale: 'en_PH',
        type: 'website',
        images: defaultOgImages,
    },
    twitter: {
        card: 'summary_large_image',
        title: `Event Production Portfolio & Showcase | ${SITE_NAME}`,
        description:
            'Explore our portfolio of corporate conferences, brand activations, roadshows, stage productions, broadcast livestreams, and social events.',
        images: defaultOgImages.map((img) => img.url),
    },
    alternates: {
        canonical: canonicalUrl,
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
        <div className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <PortfolioHero
                title={heroContent.title}
                description={heroContent.description}
                bannerImages={heroContent.bannerImages}
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
        </div>
    );
}
