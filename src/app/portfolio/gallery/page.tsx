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

export const metadata: Metadata = {
  title: 'Full Portfolio Showcase | Event Productions & Cinematography Gallery',
  description: 'Browse our complete portfolio archive of corporate conferences, brand activations, wedding films, stage and lighting designs, and broadcast live streams from Casamento Events Management across the Philippines.',
  keywords: [
    'event gallery Philippines',
    'corporate event portfolio Manila',
    'brand activation showcase PH',
    'wedding films portfolio Philippines',
    'stage production showcase Manila',
    'live streaming gallery Philippines',
    'Casamento Events gallery',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/portfolio/gallery`,
  },
  openGraph: {
    title: 'Full Portfolio Showcase | Event Productions & Cinematography Gallery',
    description: 'Browse our complete portfolio archive of corporate conferences, brand activations, wedding films, and stage production designs.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/portfolio/gallery`,
    siteName: 'Casamento Events Management',
    type: 'website',
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
    </main>
  );
}
