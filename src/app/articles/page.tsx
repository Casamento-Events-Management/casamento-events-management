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
import {
  getAggregateRating,
  getApprovedFeedbacksCount,
  getFeaturedFeedbacks,
} from '@/lib/services/feedbackService';
import { ConnectSection } from '@/components/layout/connect-section';
import { getContactSectionContent } from '@/lib/services/contactService';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildOpenGraphImages,
  getSiteUrl,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

export async function generateMetadata(): Promise<Metadata> {
  const bannerData = await getArticleVlogBanner();
  const canonicalUrl = buildCanonicalUrl('/articles');
  const primaryBanner = bannerData?.bannerImages?.[0];
  const ogImageUrl = primaryBanner?.url || bannerData?.backgroundImage?.asset?.url;
  const ogImageAlt =
    primaryBanner?.alt ||
    bannerData?.backgroundImage?.alt ||
    `Event Planning Guides & Vlogs — ${SITE_NAME}`;
  const ogImages = buildOpenGraphImages(ogImageUrl, ogImageAlt);

  return {
    title: 'Event Planning Guides, Production Insights & Vlogs',
    description:
      'Read expert event planning guides, corporate activation strategies, behind-the-scenes vlogs, and technical production insights from the Casamento Events editorial journal in the Philippines.',
    keywords: [
      'event planning articles Philippines',
      'corporate event guides Manila',
      'brand activation case studies PH',
      'behind the scenes event production',
      'live stream production tips Manila',
      'event management insights Philippines',
      'Casamento Events editorial',
    ],
    openGraph: {
      title: `Event Planning Guides, Production Insights & Vlogs | ${SITE_NAME}`,
      description:
        'Read expert event planning guides, corporate activation strategies, behind-the-scenes vlogs, and production insights across the Philippines.',
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_PH',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Event Planning Guides, Production Insights & Vlogs | ${SITE_NAME}`,
      description:
        'Read expert event planning guides, corporate activation strategies, behind-the-scenes vlogs, and production insights across the Philippines.',
      images: ogImages.map((img) => img.url),
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ArticlesPage() {
  const [
    bannerData,
    heroContent,
    items,
    categories,
    totalCount,
    contactData,
    featuredFeedbacks,
    totalFeedbackCount,
    aggregateRating,
  ] = await Promise.all([
    getArticleVlogBanner(),
    getArticlesHero(),
    getArticleVlogsForGallery(undefined, 1, 6),
    getPortfolioCategories(),
    getArticleVlogTotalCount(),
    getContactSectionContent(),
    getFeaturedFeedbacks(),
    getApprovedFeedbacksCount(),
    getAggregateRating(),
  ]);

  const showViewMore = totalCount > 6;
  const hasBannerHeading = Boolean(bannerData?.title?.trim());

  const siteUrl = getSiteUrl();
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Event Planning Guides & Vlogs | ${SITE_NAME}`,
    description:
      'Editorial journal featuring event planning guides, corporate event insights, brand activation recaps, and production vlogs across the Philippines.',
    url: buildCanonicalUrl('/articles'),
    inLanguage: 'en-PH',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: SITE_NAME,
      url: siteUrl,
    },
  };
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Articles & Vlogs', path: '/articles' },
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3E8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      {/* Section 1: Article Vlog Banner */}
      <ArticleVlogBanner banner={bannerData} />

      {/* Section 2: Articles Hero + Vlog Gallery */}
      <div className="bg-[#EFEAD8]/60 border-y border-[#3A4F1C]/10">
        <ArticlesHero content={heroContent} headingLevel={hasBannerHeading ? 'h2' : 'h1'} />
        <VlogGallery
          items={items}
          categories={categories}
          totalCount={totalCount}
          showViewMore={showViewMore}
        />
      </div>

      {/* Section 3: Client Feedback & Testimonials */}
      <FeedbackSection
        feedbacks={featuredFeedbacks}
        totalCount={totalFeedbackCount}
        averageRating={aggregateRating.average}
      />

      <ConnectSection
        eyebrow={contactData.eyebrow}
        title={contactData.title}
        description={contactData.description}
        socialLinks={contactData.socialLinks}
      />
    </div>
  );
}
