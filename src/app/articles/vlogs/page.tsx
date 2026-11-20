import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticlesHero } from '@/components/articles/ArticlesHero';
import { VlogGallery } from '@/components/articles/VlogGallery';
import { ConnectSection } from '@/components/layout/connect-section';
import { getContactSectionContent } from '@/lib/services/contactService';
import {
  getArticlesHero,
  getArticleVlogsForGallery,
  getArticleVlogTotalCount,
  getPortfolioCategories,
} from '@/lib/services/articleVlogService';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildOpenGraphImages,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

const ITEMS_PER_PAGE = 12;
const canonicalUrl = buildCanonicalUrl('/articles/vlogs');
const defaultOgImages = buildOpenGraphImages(
  undefined,
  `Event Production Vlogs & Guides — ${SITE_NAME}`
);

export const metadata: Metadata = {
  title: 'Event Production Vlogs & Planning Guides',
  description:
    'Browse the complete collection of behind-the-scenes production vlogs, corporate event guides, brand activation recaps, and styling insights from Casamento Events Management in the Philippines.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Event Production Vlogs & Planning Guides | ${SITE_NAME}`,
    description:
      'Browse behind-the-scenes production vlogs, corporate event guides, brand activation recaps, and styling insights across the Philippines.',
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'en_PH',
    type: 'website',
    images: defaultOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Event Production Vlogs & Planning Guides | ${SITE_NAME}`,
    description:
      'Browse behind-the-scenes production vlogs, corporate event guides, brand activation recaps, and styling insights across the Philippines.',
    images: defaultOgImages.map((img) => img.url),
  },
};

export default async function ArticlesVlogsPage() {
  const [heroContent, items, categories, totalCount, contactData] = await Promise.all([
    getArticlesHero(),
    getArticleVlogsForGallery(undefined, 1, ITEMS_PER_PAGE),
    getPortfolioCategories(),
    getArticleVlogTotalCount(),
    getContactSectionContent(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Event Production Vlogs & Planning Guides | ${SITE_NAME}`,
    url: canonicalUrl,
    inLanguage: 'en-PH',
  };
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Articles & Vlogs', path: '/articles' },
    { name: 'Vlogs & Guides', path: '/articles/vlogs' },
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <ArticlesHero content={heroContent} headingLevel="h1" />

      <div className="pb-8">
        <VlogGallery
          items={items}
          categories={categories}
          totalCount={totalCount}
          showViewMore={false}
        />
      </div>

      {/* Pagination nav */}
      <nav
        aria-label="Vlog pages"
        className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 max-w-7xl mx-auto py-10 px-6 sm:px-8"
      >
        {/* Left: Back to main Articles */}
        <div className="flex justify-center md:justify-start">
          <Link
            href="/articles"
            className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
          >
            ← Back to Articles
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
              href="/articles/vlogs/page/2"
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
