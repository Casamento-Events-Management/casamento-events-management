import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { FeedbackCard } from '@/components/articles/FeedbackCard';
import { ShareExperienceTrigger } from '@/components/articles/ShareExperienceTrigger';
import { ConnectSection } from '@/components/layout/connect-section';
import { getContactSectionContent } from '@/lib/services/contactService';
import { safeJsonLd } from '@/lib/utils/securityUtils';
import {
  getApprovedFeedbacksPage,
  getApprovedFeedbacksCount,
  getAggregateRating,
} from '@/lib/services/feedbackService';
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildOpenGraphImages,
  getSiteUrl,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

const ITEMS_PER_PAGE = 12;
const canonicalUrl = buildCanonicalUrl('/articles/feedback');
const defaultOgImages = buildOpenGraphImages(
  undefined,
  `Client Reviews & Testimonials — ${SITE_NAME}`
);

export const metadata: Metadata = {
  title: 'Client Reviews & Event Testimonials Philippines',
  description:
    'Read verified client reviews, testimonials, and experiences from corporate events, brand activations, roadshows, livestream productions, and social celebrations managed by Casamento Events Management across the Philippines.',
  keywords: [
    'Casamento Events reviews',
    'events management reviews Philippines',
    'corporate event planner feedback PH',
    'brand activation agency testimonials Manila',
    'client feedback Casamento Events',
    'event coordinator ratings Manila',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Client Reviews & Event Testimonials | ${SITE_NAME}`,
    description:
      'Read verified client reviews and testimonials from corporate partners, brands, and event clients with Casamento Events Management across the Philippines.',
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'en_PH',
    type: 'website',
    images: defaultOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Client Reviews & Event Testimonials | ${SITE_NAME}`,
    description:
      'Read verified client reviews and testimonials from corporate partners, brands, and event clients with Casamento Events Management.',
    images: defaultOgImages.map((img) => img.url),
  },
};

export default async function FeedbackPage() {
  const pageNum = 1;
  const [feedbacks, totalCount, aggregate, contactData] = await Promise.all([
    getApprovedFeedbacksPage(pageNum, ITEMS_PER_PAGE),
    getApprovedFeedbacksCount(),
    getAggregateRating(),
    getContactSectionContent(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNext = pageNum < totalPages;
  const siteUrl = getSiteUrl();

  // Policy-compliant CollectionPage + BreadcrumbList JSON-LD (avoids self-serving Organization review snippet spam)
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Client Reviews & Event Testimonials | ${SITE_NAME}`,
    description:
      'Verified client experiences and event testimonials for Casamento Events Management across the Philippines.',
    url: canonicalUrl,
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
    { name: 'Client Reviews', path: '/articles/feedback' },
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-24 pb-16">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/articles"
            className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
          >
            &larr; Back
          </Link>
        </div>

        {/* Section Heading */}
        <SectionHeading
          eyebrow="CLIENT REVIEWS & TESTIMONIALS"
          title="What Our Clients Say"
          description="Read verified experiences and honest feedback from our corporate partners, brands, and event clients across the Philippines."
          theme="light"
          headingLevel="h1"
        />

        {/* Rating Display (Reflects true computed average) */}
        <div className="flex items-center justify-center gap-2 mb-12 text-center -mt-4 sm:-mt-6">
          <div className="flex items-center gap-1" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 sm:w-5 h-4 sm:h-5 fill-[#BC6F07] text-[#BC6F07]" />
            ))}
          </div>
          <span className="text-sm sm:text-base font-serif font-semibold text-[#3A4F1C]">
            {aggregate.average.toFixed(1)} Rating out of {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Feedback Cards Grid */}
        {feedbacks && feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {feedbacks.map((item, index) => (
              <FeedbackCard key={item._id} feedback={item} index={index} compact={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-[#EFEAD8]/50 rounded-2xl border border-[#3A4F1C]/10 max-w-xl mx-auto mb-16">
            <p className="text-base text-[#3A4F1C]/70 font-light italic">
              No reviews published yet. Be the first to share your event story below!
            </p>
          </div>
        )}

        {/* Share Your Experience Action Button & Prompt */}
        <ShareExperienceTrigger />

        {/* Pagination Nav */}
        <nav
          aria-label="Feedback pages"
          className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-8 border-t border-[#3A4F1C]/10"
        >
          {/* Left: Back link */}
          <div className="flex justify-center md:justify-start">
            <Link
              href="/articles"
              className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors uppercase tracking-wider"
            >
              &larr; Back
            </Link>
          </div>

          {/* Center: Page Counter */}
          <div className="flex justify-center text-center">
            <span className="text-xs font-medium tracking-wider text-[#3A4F1C]/60 uppercase">
              Page {pageNum} of {totalPages}
            </span>
          </div>

          {/* Right: Next Page */}
          <div className="flex items-center justify-center md:justify-end">
            {hasNext && (
              <Link
                href="/articles/feedback/page/2"
                rel="next"
                className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors uppercase tracking-wider"
              >
                Next Page &rarr;
              </Link>
            )}
          </div>
        </nav>
      </div>

      <ConnectSection
        eyebrow={contactData.eyebrow}
        title={contactData.title}
        description={contactData.description}
        socialLinks={contactData.socialLinks}
      />
    </div>
  );
}
