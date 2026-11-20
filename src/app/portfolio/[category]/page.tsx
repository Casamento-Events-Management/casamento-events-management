// =============================================================================
// app/portfolio/[category]/page.tsx — Category SEO Landing Page
//
// Dynamic / ISR Server Component for category subpath routes (e.g. /portfolio/corporate-events).
// Dynamically pre-renders category pages via generateStaticParams().
// =============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getPortfolioCategories,
    getPortfolioCategoryBySlug,
    getPortfolioHeroContent,
    getPortfolioItems,
    getPortfolioUpcomingEvents,
} from '@/lib/services/portfolioService';
import { PortfolioHero } from '@/components/portfolio/portfolio-hero';
import { PortfolioView } from '@/components/portfolio/portfolio-view';
import { PortfolioJsonLd } from '@/components/portfolio/portfolio-json-ld';
import { UpcomingEventsSection } from '@/components/home/upcoming-events-section';
import {
    buildCanonicalUrl,
    buildOpenGraphImages,
    SITE_NAME,
} from '@/lib/utils/seoUtils';

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
    const [category, categoryItems] = await Promise.all([
        getPortfolioCategoryBySlug(categorySlug),
        getPortfolioItems(categorySlug, 0, 1),
    ]);

    if (!category) {
        return {
            title: 'Category Not Found',
        };
    }

    const title = `${category.title} Portfolio Philippines`;
    const description =
        category.description ||
        `Explore our ${category.title.toLowerCase()} event management and production showcase by ${SITE_NAME} across Metro Manila and the Philippines.`;
    const canonical = buildCanonicalUrl(`/portfolio/${category.slug}`);
    const leadThumb = categoryItems[0]?.thumbnail;
    const ogImages = buildOpenGraphImages(
        leadThumb?.url,
        leadThumb?.alt || `${category.title} Portfolio — ${SITE_NAME}`,
        leadThumb?.width || 1200,
        leadThumb?.height || 630
    );

    return {
        title,
        description,
        keywords: [
            `${category.title.toLowerCase()} portfolio Philippines`,
            `${category.title.toLowerCase()} event planner Manila`,
            `${category.title.toLowerCase()} Casamento Events`,
            `${category.title.toLowerCase()} Metro Manila`,
            'event production company Philippines',
            'Casamento Events Management',
        ],
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url: canonical,
            siteName: SITE_NAME,
            locale: 'en_PH',
            type: 'website',
            images: ogImages,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | ${SITE_NAME}`,
            description,
            images: ogImages.map((img) => img.url),
        },
        alternates: {
            canonical,
        },
    };
}


export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category: categorySlug } = await params;

    const [category, categories, items, upcomingEventsData, heroContent] = await Promise.all([
        getPortfolioCategoryBySlug(categorySlug),
        getPortfolioCategories(),
        getPortfolioItems('all'), // Pass all items to PortfolioView so tab switching remains instant
        getPortfolioUpcomingEvents(),
        getPortfolioHeroContent(),
    ]);

    if (!category) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
            <PortfolioHero
                categoryTitle={category.title}
                description={category.description}
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
        </div>
    );
}
