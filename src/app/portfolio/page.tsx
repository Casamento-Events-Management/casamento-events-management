// =============================================================================
// app/portfolio/page.tsx — Portfolio Main Landing Page ("All" Category)
//
// Static / ISR Server Component for the primary /portfolio route.
// Includes Metadata generation and structured JSON-LD data for SEO.
// =============================================================================

import type { Metadata } from 'next';
import {
    getPortfolioCategories, getPortfolioHeroContent,
    getPortfolioItems
} from '@/lib/services/portfolioService';

import { PortfolioHero } from '@/components/portfolio/portfolio-hero';
import { PortfolioView } from '@/components/portfolio/portfolio-view';
import { PortfolioJsonLd } from '@/components/portfolio/portfolio-json-ld';
import { getHomePageContent } from '@/lib/services/homeService';
import { UpcomingEventsSection } from '@/components/home/upcoming-events-section';
import { ConnectSection } from '@/components/layout/connect-section';

export const metadata: Metadata = {
    title: 'Portfolio | Wedding Films, Stage Production & Live Streams',
    description: 'Explore our portfolio of high-end wedding films, cinematic stage productions, LED lighting designs, and broadcast live streams by Casamento Events.',
    keywords: [
        'wedding films portfolio Philippines',
        'stage production portfolio Manila',
        'live streaming portfolio Philippines',
        'event cinematography showcase',
        'luxury event portfolio Casamento',
    ],
    openGraph: {
        title: 'Casamento Events Portfolio | Masterpieces in Motion',
        description: 'Explore our portfolio of high-end wedding films, cinematic stage productions, LED lighting designs, and broadcast live streams.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/portfolio`,
        siteName: 'Casamento Events Management',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Casamento Events Portfolio | Masterpieces in Motion',
        description: 'Explore our portfolio of high-end wedding films, cinematic stage productions, LED lighting designs, and broadcast live streams.',
    },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/portfolio`,
    },
};

export default async function PortfolioPage() {
    const [categories, items, heroContent, content] = await Promise.all([
        getPortfolioCategories(),
        getPortfolioItems('all'),
        getPortfolioHeroContent(),
        getHomePageContent(),
    ]);

    return (
        <main className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <PortfolioHero
                title={heroContent.title}
                description={heroContent.description}
            />

            <UpcomingEventsSection
                events={content.upcomingEvents}
                eyebrow={heroContent.upcomingEventsEyebrow}
                title={heroContent.upcomingEventsTitle}
                description={heroContent.upcomingEventsDescription}
            />

            <PortfolioView
                categories={categories}
                items={items}
                activeCategory="all"
                galleryEyebrow={heroContent.galleryEyebrow}
                galleryTitle={heroContent.galleryTitle}
                galleryDescription={heroContent.galleryDescription}
            />
            <PortfolioJsonLd items={items} />
            <ConnectSection socialLinks={content.socialLinks} />
        </main>
    );
}
