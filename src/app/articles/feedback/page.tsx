import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { FeedbackCard } from '@/components/articles/FeedbackCard';
import { ShareExperienceTrigger } from '@/components/articles/ShareExperienceTrigger';
import { ConnectSection } from '@/components/layout/connect-section';
import { getHomePageContent } from '@/lib/services/homeService';
import {
  getApprovedFeedbacksPage,
  getApprovedFeedbacksCount,
  getAggregateRating,
} from '@/lib/services/feedbackService';

const ITEMS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'Client Feedbacks & Reviews | Casamento Events',
  description:
    'Read verified client reviews, testimonials, and experiences from luxury weddings and events coordinated by Casamento Events Management.',
  keywords: [
    'Casamento Events reviews',
    'wedding planner testimonials Philippines',
    'client feedback Casamento Events',
    'luxury event reviews',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/feedback`,
  },
  openGraph: {
    title: 'Client Feedbacks & Reviews | Casamento Events',
    description:
      'Read verified client reviews and testimonials from couples and clients of Casamento Events.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/feedback`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
};

export default async function FeedbackPage() {
  const pageNum = 1;
  const [feedbacks, totalCount, aggregate, homeContent] = await Promise.all([
    getApprovedFeedbacksPage(pageNum, ITEMS_PER_PAGE),
    getApprovedFeedbacksCount(),
    getAggregateRating(),
    getHomePageContent(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNext = pageNum < totalPages;

  // JSON-LD Structured Data injection for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Casamento Events Management',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregate.average,
      reviewCount: aggregate.count,
      bestRating: 5,
      worstRating: 1,
    },
    review: feedbacks.map((item) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: item.name,
      },
      datePublished: item.submittedAt,
      reviewBody: item.message,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: item.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#F7F3E8] pt-24 pb-16">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/articles"
            className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
          >
            ← Back to Articles Hub
          </Link>
        </div>

        {/* Section Heading */}
        <SectionHeading
          eyebrow="CLIENT REVIEWS & TESTIMONIALS"
          title="What Our Clients Say"
          description="Read full experiences and honest feedback from our valued clients."
          theme="light"
        />

        {/* Rating Display (No card container — directly centered below hero) */}
        <div className="flex items-center justify-center gap-2 mb-12 text-center -mt-4 sm:-mt-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 sm:w-5 h-4 sm:h-5 fill-[#BC6F07] text-[#BC6F07]" />
            ))}
          </div>
          <span className="text-sm sm:text-base font-serif font-semibold text-[#3A4F1C]">
            5.0 Rating out of {totalCount} feedbacks
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
              ← Back to Hub
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
                Next Page →
              </Link>
            )}
          </div>
        </nav>
      </div>

      <ConnectSection socialLinks={homeContent.socialLinks} />
    </main>
  );
}
