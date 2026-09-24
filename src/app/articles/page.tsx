import React from 'react';
import type { Metadata } from 'next';
import { ArticleVlogBanner } from '@/components/articles/ArticleVlogBanner';
import { ArticlesHero } from '@/components/articles/ArticlesHero';
import { VlogGallery } from '@/components/articles/VlogGallery';
import { FeedbackSection } from '@/components/articles/FeedbackSection';
import { getArticleVlogBanner } from '@/lib/services/articleBannerService';
import {
  getArticlesHero,
  getArticleVlogsForGallery,
  getArticleVlogTotalCount,
  getPortfolioCategories,
} from '@/lib/services/articleVlogService';
import { getApprovedFeedbacks } from '@/lib/services/feedbackService';
import { ConnectSection } from '@/components/layout/connect-section';
import { getHomePageContent } from '@/lib/services/homeService';

export const metadata: Metadata = {
  title: 'Articles & Vlogs | Event Planning Guides & Behind the Scenes',
  description: 'Read expert event planning guides, luxury wedding trends, behind-the-scenes vlogs, and production insights from the Casamento Events editorial journal.',
  keywords: [
    'wedding planning articles Philippines',
    'event planning guides',
    'luxury wedding trends',
    'behind the scenes event production',
    'Casamento Events blog',
    'event cinematography tips',
  ],
  openGraph: {
    title: 'Articles & Vlogs | Casamento Events Editorial Journal',
    description: 'Read expert event planning guides, luxury wedding trends, behind-the-scenes vlogs, and production insights.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles & Vlogs | Casamento Events Editorial Journal',
    description: 'Read expert event planning guides, luxury wedding trends, behind-the-scenes vlogs, and production insights.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`,
  },
};

export default async function ArticlesPage() {
  const [bannerData, heroContent, items, categories, totalCount, homeContent, feedbacks] = await Promise.all([
    getArticleVlogBanner(),
    getArticlesHero(),
    getArticleVlogsForGallery(undefined, 1, 6),
    getPortfolioCategories(),
    getArticleVlogTotalCount(),
    getHomePageContent(),
    getApprovedFeedbacks(),
  ]);

  const showViewMore = totalCount > 6;

  return (
    <main className="min-h-screen bg-[#F7F3E8] pt-20">
      {/* Section 1: Article Vlog Banner */}
      <ArticleVlogBanner banner={bannerData} />

      {/* Section 2: Articles Hero + Vlog Gallery */}
      <ArticlesHero content={heroContent} />

      <div>
        <VlogGallery
          items={items}
          categories={categories}
          totalCount={totalCount}
          showViewMore={showViewMore}
        />
      </div>

      {/* Section 3: Client Feedback & Testimonials */}
      <FeedbackSection feedbacks={feedbacks} />

      <ConnectSection socialLinks={homeContent.socialLinks} />
    </main>
  );
}
