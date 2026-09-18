// =============================================================================
// app/portfolio/page.tsx — Portfolio Main Landing Page ("All" Category)
//
// Static / ISR Server Component for the primary /portfolio route.
// Includes Metadata generation and structured JSON-LD data for SEO.
// =============================================================================

import type { Metadata } from 'next';
import { getPortfolioCategories, getPortfolioItems } from '@/lib/services/portfolioService';
import { PortfolioHero } from '@/components/portfolio/portfolio-hero';
import { PortfolioView } from '@/components/portfolio/portfolio-view';
import { PortfolioJsonLd } from '@/components/portfolio/portfolio-json-ld';

export const metadata: Metadata = {
    title: 'Portfolio | Wedding Films, Stage Production & Live Streams | Casamento Events',
    description: 'Explore our portfolio of high-end wedding films, cinematic stage productions, LED lighting designs, and broadcast live streams by Casamento Events.',
    openGraph: {
        title: 'Casamento Events Portfolio | Masterpieces in Motion',
        description: 'Explore our portfolio of high-end wedding films, cinematic stage productions, LED lighting designs, and broadcast live streams.',
        url: 'https://casamentoevents.com/portfolio',
        siteName: 'Casamento Events Management',
        type: 'website',
    },
    alternates: {
        canonical: 'https://casamentoevents.com/portfolio',
    },
};

export default async function PortfolioPage() {
    const [categories, items] = await Promise.all([
        getPortfolioCategories(),
        getPortfolioItems('all'),
    ]);

    return (
        <main className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <PortfolioHero />
            <PortfolioView
                categories={categories}
                items={items}
                activeCategory="all"
            />
            <PortfolioJsonLd items={items} />
        </main>
    );
}
