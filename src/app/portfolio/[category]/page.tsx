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
    getPortfolioItems,
} from '@/lib/services/portfolioService';
import { PortfolioHero } from '@/components/portfolio/portfolio-hero';
import { PortfolioView } from '@/components/portfolio/portfolio-view';
import { PortfolioJsonLd } from '@/components/portfolio/portfolio-json-ld';

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

    const title = `${category.title} Portfolio | Casamento Events Management`;
    const description = category.description || `Explore our high-end ${category.title.toLowerCase()} showcase by Casamento Events Management.`;
    const canonical = `https://casamentoevents.com/portfolio/${category.slug}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: 'Casamento Events Management',
            type: 'website',
        },
        alternates: {
            canonical,
        },
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category: categorySlug } = await params;

    const [category, categories, items] = await Promise.all([
        getPortfolioCategoryBySlug(categorySlug),
        getPortfolioCategories(),
        getPortfolioItems('all'), // Pass all items to PortfolioView so tab switching remains instant
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
            <PortfolioView
                categories={categories}
                items={items}
                activeCategory={categorySlug}
            />
            <PortfolioJsonLd
                items={items.filter((item) => item.category.slug === categorySlug)}
            />
        </main>
    );
}
