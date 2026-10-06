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
import { getFeaturedFeedbacks, getApprovedFeedbacksCount } from '@/lib/services/feedbackService';
import { ConnectSection } from '@/components/layout/connect-section';
import { getContactSectionContent } from '@/lib/services/contactService';

export const metadata: Metadata = {
  title: 'Articles & Vlogs | Event Planning Guides & Production Insights',
  description: 'Read expert event planning guides, corporate activation trends, behind-the-scenes vlogs, and technical production insights from the Casamento Events editorial journal in the Philippines.',
  keywords: [
    'event planning articles Philippines',
    'corporate event guides Manila',
    'wedding planning tips Philippines',
    'brand activation case studies PH',
    'behind the scenes event production',
    'live stream production tips Manila',
    'Casamento Events editorial',
  ],
  openGraph: {
    title: 'Articles & Vlogs | Casamento Events Editorial Journal',
    description: 'Read expert event planning guides, corporate activation trends, behind-the-scenes vlogs, and production insights across the Philippines.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/articles`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles & Vlogs | Casamento Events Editorial Journal',
    description: 'Read expert event planning guides, corporate activation trends, behind-the-scenes vlogs, and production insights across the Philippines.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/articles`,
  },
};

export default async function ArticlesPage() {
  const [bannerData, heroContent, items, categories, totalCount, contactData, featuredFeedbacks, totalFeedbackCount] = await Promise.all([
    getArticleVlogBanner(),
    getArticlesHero(),
    getArticleVlogsForGallery(undefined, 1, 6),
    getPortfolioCategories(),
    getArticleVlogTotalCount(),
    getContactSectionContent(),
    getFeaturedFeedbacks(),
    getApprovedFeedbacksCount(),
  ]);

  const showViewMore = totalCount > 6;

  return (
    <main className="min-h-screen bg-[#F7F3E8] pt-20">
      {/* Section 1: Article Vlog Banner */}
      <ArticleVlogBanner banner={bannerData} />

      {/* Section 2: Articles Hero + Vlog Gallery */}
      <div className='bg-[#EFEAD8]/60 border-y border-[#3A4F1C]/10'>
        <ArticlesHero content={heroContent} />
        <VlogGallery
          items={items}
          categories={categories}
          totalCount={totalCount}
          showViewMore={showViewMore}
        />
      </div>

      {/* Section 3: Client Feedback & Testimonials */}
      <FeedbackSection feedbacks={featuredFeedbacks} totalCount={totalFeedbackCount} />

      <ConnectSection
        eyebrow={contactData.eyebrow}
        title={contactData.title}
        description={contactData.description}
        socialLinks={contactData.socialLinks}
      />
    </main>
  );
}
