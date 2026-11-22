import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
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
import {
  buildCanonicalUrl,
  buildOpenGraphImages,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

const canonicalUrl = buildCanonicalUrl('/portfolio/gallery');
const defaultOgImages = buildOpenGraphImages(
  undefined,
  `Full Portfolio Showcase — ${SITE_NAME}`
);

export const metadata: Metadata = {
  title: 'Full Event Production & Portfolio Gallery',
  description:
    'Browse our complete portfolio archive of corporate conferences, brand activations, nationwide roadshows, stage and lighting designs, broadcast livestreams, and social celebrations across the Philippines.',
  keywords: [
    'event gallery Philippines',
    'corporate event portfolio Manila',
    'brand activation showcase PH',
    'stage production showcase Manila',
    'live streaming gallery Philippines',
    'Casamento Events gallery',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Full Event Production & Portfolio Gallery | ${SITE_NAME}`,
    description:
      'Browse our complete portfolio archive of corporate conferences, brand activations, stage production designs, broadcast livestreams, and social events.',
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'en_PH',
    type: 'website',
    images: defaultOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Full Event Production & Portfolio Gallery | ${SITE_NAME}`,
    description:
      'Browse our complete portfolio archive of corporate conferences, brand activations, stage production designs, and broadcast livestreams.',
    images: defaultOgImages.map((img) => img.url),
  },
};

export default async function PortfolioGalleryPage() {
  const [heroContent, items, categories, totalCount, contactData] = await Promise.all([
    getPortfolioHeroContent(),
    getPortfolioItemsForGallery('all', 1, PORTFOLIO_PAGE_SIZE),
    getPortfolioCategories(),
    getPortfolioItemTotalCount('all'),
    getContactSectionContent(),
  ]);

  const totalPages = Math.ceil(totalCount / PORTFOLIO_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-20">
      <div className="pb-8">
        <PortfolioView
          items={items}
          categories={categories}
          activeCategory="all"
          showViewMore={false}
          syncCategoryWithRoute={false}
          galleryHeadingLevel="h1"
          galleryEyebrow={heroContent.galleryEyebrow}
          galleryTitle={heroContent.galleryTitle}
          galleryDescription={heroContent.galleryDescription}
        />
      </div>

      <PortfolioJsonLd items={items} isGalleryPage />

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
          {totalPages > 1 && (
            <span className="text-xs font-medium tracking-wider text-[#3A4F1C]/60 uppercase">
              Page 1 of {totalPages}
            </span>
          )}
        </div>

        {/* Right: Next Page Link */}
        <div className="flex justify-center md:justify-end">
          {totalPages > 1 && (
            <Link
              href="/portfolio/gallery/page/2"
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
    </div>
  );
}
