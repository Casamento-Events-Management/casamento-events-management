// =============================================================================
// app/portfolio/[category]/page.tsx — Category SEO Landing Page
//
// Dynamic / ISR Server Component for category subpath routes (e.g. /portfolio/weddings).
// Dynamically pre-renders category pages via generateStaticParams().
// =============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getPortfolioCategories,
    getPortfolioCategoryBySlug,
    getPortfolioHeroContent,
    getPortfolioItems,
} from '@/lib/services/portfolioService';
import { getHomePageContent } from '@/lib/services/homeService';
import { PortfolioHero } from '@/components/portfolio/portfolio-hero';
import { PortfolioView } from '@/components/portfolio/portfolio-view';
import { PortfolioJsonLd } from '@/components/portfolio/portfolio-json-ld';
import { UpcomingEventsSection } from '@/components/home/upcoming-events-section';

interface CategoryPageProps {
    params: Promise<{ category: string }>;
}

/**
 * Pre-generate static pages for all categories published in Sanity CMS
 */
export async function generateStaticParams() {
    const categories = await getPortfolioCategories();
    return categories.map((cat) => ({
        category: cat.slug,
    }));
}

/**
 * Generate SEO metadata per category page
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category: categorySlug } = await params;
    const category = await getPortfolioCategoryBySlug(categorySlug);

    if (!category) {
        return {
            title: 'Category Not Found | Casamento Events',
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
    // Use short title — root layout template appends "| Casamento Events"
    const title = `${category.title} Portfolio`;
    const description = category.description || `Explore our high-end ${category.title.toLowerCase()} showcase by Casamento Events Management.`;
    const canonical = `${siteUrl}/portfolio/${category.slug}`;

    return {
        title,
        description,
        keywords: [
            `${category.title.toLowerCase()} portfolio Philippines`,
            `${category.title.toLowerCase()} Casamento Events`,
            `${category.title.toLowerCase()} Manila`,
            'luxury event production Philippines',
            'Casamento Events Management',
        ],
        openGraph: {
            title: `${category.title} Portfolio | Casamento Events`,
            description,
            url: canonical,
            siteName: 'Casamento Events Management',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${category.title} Portfolio | Casamento Events`,
            description,
        },
        alternates: {
            canonical,
        },
    };
}


export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category: categorySlug } = await params;

    const [category, categories, items, homeContent, heroContent] = await Promise.all([
        getPortfolioCategoryBySlug(categorySlug),
        getPortfolioCategories(),
        getPortfolioItems('all'), // Pass all items to PortfolioView so tab switching remains instant
        getHomePageContent(),
        getPortfolioHeroContent(),
    ]);

    if (!category) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <PortfolioHero
                categoryTitle={category.title}
                description={category.description}
            />
            <UpcomingEventsSection events={homeContent.upcomingEvents} />
            <PortfolioView
                categories={categories}
                items={items}
                activeCategory={categorySlug}
                galleryEyebrow={heroContent.galleryEyebrow}
                galleryTitle={heroContent.galleryTitle}
                galleryDescription={heroContent.galleryDescription}
            />
            <PortfolioJsonLd
                items={items.filter((item) => item.category.slug === categorySlug)}
                categorySlug={categorySlug}
                categoryTitle={category.title}
            />
        </main>
    );
}
