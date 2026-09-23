import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
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

export const metadata: Metadata = {
  title: 'All Vlogs & Guides | Casamento Events Editorial Journal',
  description: 'Browse the full collection of behind-the-scenes vlogs, event production guides, and luxury styling articles from Casamento Events Management.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/vlogs`,
  },
  openGraph: {
    title: 'All Vlogs & Guides | Casamento Events',
    description: 'Browse the full collection of behind-the-scenes vlogs, event production guides, and luxury styling articles.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/vlogs`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
};

export default async function ArticlesVlogsPage() {
  const [heroContent, items, categories, totalCount, homeContent] = await Promise.all([
    getArticlesHero(),
    getArticleVlogsForGallery(undefined, 1, ITEMS_PER_PAGE),
    getPortfolioCategories(),
    getArticleVlogTotalCount(),
    getHomePageContent(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
      {totalPages > 1 && (
        <nav
          aria-label="Vlog pages"
          className="flex items-center justify-between max-w-7xl mx-auto py-10 px-6 sm:px-8"
        >
          <div className="w-24" />
          <span className="text-xs font-medium tracking-wider text-[#3A4F1C]/60 uppercase">
            Page 1 of {totalPages}
          </span>
          <div className="w-24 text-right">
            <Link
              href="/articles/vlogs/page/2"
              rel="next"
              className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
            >
              Next Page →
            </Link>
          </div>
        </nav>
      )}

      <ConnectSection socialLinks={homeContent.socialLinks} />
    </main>
  );
}

