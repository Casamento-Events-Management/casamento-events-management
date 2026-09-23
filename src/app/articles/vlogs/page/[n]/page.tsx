import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticlesHero } from '@/components/articles/ArticlesHero';
import { VlogGallery } from '@/components/articles/VlogGallery';
import { ConnectSection } from '@/components/layout/connect-section';
import { getHomePageContent } from '@/lib/services/homeService';
import {
  getArticlesHero,
  getArticleVlogsForGallery,
  getArticleVlogTotalCount,
  getPortfolioCategories,
} from '@/lib/services/articleVlogService';

const ITEMS_PER_PAGE = 12;

interface PageProps {
  params: Promise<{ n: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  const pageNum = parseInt(n, 10);

  return {
    title: `Vlogs & Guides — Page ${pageNum} | Casamento Events`,
    description: `Browse page ${pageNum} of behind-the-scenes vlogs and event production guides from Casamento Events Management.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/vlogs/page/${pageNum}`,
    },
    openGraph: {
      title: `Vlogs & Guides — Page ${pageNum} | Casamento Events`,
      description: `Browse page ${pageNum} of behind-the-scenes vlogs and event guides.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/vlogs/page/${pageNum}`,
      siteName: 'Casamento Events Management',
      type: 'website',
    },
  };
}

export default async function VlogsPageN({ params }: PageProps) {
  const { n } = await params;
  const pageNum = parseInt(n, 10);

  if (isNaN(pageNum) || pageNum < 2) return notFound();

  const [heroContent, items, categories, totalCount, homeContent] = await Promise.all([
    getArticlesHero(),
    getArticleVlogsForGallery(undefined, pageNum, ITEMS_PER_PAGE),
    getPortfolioCategories(),
    getArticleVlogTotalCount(),
    getHomePageContent(),
  ]);

  if (items.length === 0) return notFound();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const prevHref = pageNum === 2 ? '/articles/vlogs' : `/articles/vlogs/page/${pageNum - 1}`;
  const hasNext = pageNum < totalPages;

  return (
    <main className="min-h-screen bg-[#F7F3E8] pt-20">
      <ArticlesHero content={heroContent} />

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
        className="flex items-center justify-between max-w-7xl mx-auto py-10 px-6 sm:px-8"
      >
        <div className="w-30">
          <Link
            href={prevHref}
            rel="prev"
            className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
          >
            ← Previous Page
          </Link>
        </div>
        <span className="text-xs font-medium tracking-wider text-[#3A4F1C]/60 uppercase">
          Page {pageNum} of {totalPages}
        </span>
        <div className="w-28 text-right">
          {hasNext ? (
            <Link
              href={`/articles/vlogs/page/${pageNum + 1}`}
              rel="next"
              className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
            >
              Next Page →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>

      <ConnectSection socialLinks={homeContent.socialLinks} />
    </main>
  );
}

