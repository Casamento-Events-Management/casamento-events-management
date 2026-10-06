import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortfolioView } from '@/components/portfolio/portfolio-view';
import { PortfolioJsonLd } from '@/components/portfolio/portfolio-json-ld';
import { ConnectSection } from '@/components/layout/connect-section';
import { getContactSectionContent } from '@/lib/services/contactService';
import {
  getPortfolioHeroContent,
  getPortfolioCategories,
  getPortfolioItemsForGallery,
  getPortfolioItemTotalCount,
  PORTFOLIO_PAGE_SIZE,
} from '@/lib/services/portfolioService';

interface PageProps {
  params: Promise<{ n: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  const pageNum = parseInt(n, 10);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';

  return {
    title: `Portfolio Gallery — Page ${pageNum} | Casamento Events Management`,
    description: `Browse page ${pageNum} of event cinematography, corporate conferences, brand activations, wedding films, and stage production showcase from Casamento Events Management across the Philippines.`,
    alternates: {
      canonical: `${siteUrl}/portfolio/gallery/page/${pageNum}`,
    },
    openGraph: {
      title: `Portfolio Gallery — Page ${pageNum} | Casamento Events Management`,
      description: `Browse page ${pageNum} of event productions, wedding films, and corporate activations showcase.`,
      url: `${siteUrl}/portfolio/gallery/page/${pageNum}`,
      siteName: 'Casamento Events Management',
      type: 'website',
    },
  };
}

export default async function PortfolioGalleryPageN({ params }: PageProps) {
  const { n } = await params;
  const pageNum = parseInt(n, 10);

  if (isNaN(pageNum) || pageNum < 2) return notFound();

  const [heroContent, items, categories, totalCount, contactData] = await Promise.all([
    getPortfolioHeroContent(),
    getPortfolioItemsForGallery('all', pageNum, PORTFOLIO_PAGE_SIZE),
    getPortfolioCategories(),
    getPortfolioItemTotalCount('all'),
    getContactSectionContent(),
  ]);

  if (items.length === 0) return notFound();

  const totalPages = Math.ceil(totalCount / PORTFOLIO_PAGE_SIZE);
  if (pageNum > totalPages) return notFound();

  const prevHref = pageNum === 2 ? '/portfolio/gallery' : `/portfolio/gallery/page/${pageNum - 1}`;
  const hasNext = pageNum < totalPages;

  return (
    <main className="min-h-screen bg-[#F7F3E8] pt-20">
      <div className="pb-8">
        <PortfolioView
          items={items}
          categories={categories}
          activeCategory="all"
          showViewMore={false}
          galleryEyebrow={heroContent.galleryEyebrow}
          galleryTitle={heroContent.galleryTitle}
          galleryDescription={heroContent.galleryDescription}
        />
      </div>

      <PortfolioJsonLd items={items} />

      {/* Pagination nav */}
      <nav
        aria-label="Portfolio gallery pages"
        className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 max-w-7xl mx-auto py-10 px-6 sm:px-8"
      >
        {/* Left: Back to main Portfolio */}
        <div className="flex justify-center md:justify-start">
          <Link
            href="/portfolio"
            className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
          >
            ← Back to Portfolio
          </Link>
        </div>

        {/* Center: Page Counter */}
        <div className="flex justify-center text-center">
          <span className="text-xs font-medium tracking-wider text-[#3A4F1C]/60 uppercase">
            Page {pageNum} of {totalPages}
          </span>
        </div>

        {/* Right: Prev & Next Page Links */}
        <div className="flex items-center justify-center md:justify-end gap-4 sm:gap-6">
          <Link
            href={prevHref}
            rel="prev"
            className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
          >
            ← Previous Page
          </Link>

          {hasNext && (
            <Link
              href={`/portfolio/gallery/page/${pageNum + 1}`}
              rel="next"
              className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
            >
              Next Page →
            </Link>
          )}
        </div>
      </nav>

      <ConnectSection
        eyebrow={contactData.eyebrow}
        title={contactData.title}
        description={contactData.description}
        socialLinks={contactData.socialLinks}
      />
    </main>
  );
}
