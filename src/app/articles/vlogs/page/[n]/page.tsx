import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

interface PageProps {
  params: Promise<{ n: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  const pageNum = parseInt(n, 10);
  const canonicalUrl = buildCanonicalUrl(`/articles/vlogs/page/${pageNum}`);
  const ogImages = buildOpenGraphImages(
    undefined,
    `Vlogs & Guides — Page ${pageNum} — ${SITE_NAME}`
  );

  return {
    title: `Event Vlogs & Guides — Page ${pageNum}`,
    description: `Browse page ${pageNum} of behind-the-scenes production vlogs and event management guides from ${SITE_NAME} in the Philippines.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Event Vlogs & Guides — Page ${pageNum} | ${SITE_NAME}`,
      description: `Browse page ${pageNum} of behind-the-scenes production vlogs and event management guides.`,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_PH',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Event Vlogs & Guides — Page ${pageNum} | ${SITE_NAME}`,
      description: `Browse page ${pageNum} of behind-the-scenes production vlogs and event management guides.`,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function VlogsPageN({ params }: PageProps) {
  const { n } = await params;
  const pageNum = parseInt(n, 10);

  if (isNaN(pageNum) || pageNum < 2) return notFound();

  const [heroContent, items, categories, totalCount, contactData] = await Promise.all([
    getArticlesHero(),
    getArticleVlogsForGallery(undefined, pageNum, ITEMS_PER_PAGE),
    getPortfolioCategories(),
    getArticleVlogTotalCount(),
    getContactSectionContent(),
  ]);

  if (items.length === 0) return notFound();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const prevHref = pageNum === 2 ? '/articles/vlogs' : `/articles/vlogs/page/${pageNum - 1}`;
  const hasNext = pageNum < totalPages;

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Articles & Vlogs', path: '/articles' },
    { name: 'Vlogs & Guides', path: '/articles/vlogs' },
    { name: `Page ${pageNum}`, path: `/articles/vlogs/page/${pageNum}` },
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-20">
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
              href={`/articles/vlogs/page/${pageNum + 1}`}
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
