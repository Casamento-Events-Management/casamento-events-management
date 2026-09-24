import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

interface PageProps {
  params: Promise<{ n: string }>;
}

export async function generateStaticParams() {
  const totalCount = await getApprovedFeedbacksCount();
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const paths: { n: string }[] = [];
  for (let i = 2; i <= totalPages; i++) {
    paths.push({ n: i.toString() });
  }
  return paths;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  const pageNum = parseInt(n, 10);

  return {
    title: `Client Feedbacks — Page ${pageNum} | Casamento Events`,
    description: `Read page ${pageNum} of verified client reviews and testimonials for Casamento Events Management.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/feedback/page/${pageNum}`,
    },
    openGraph: {
      title: `Client Feedbacks — Page ${pageNum} | Casamento Events`,
      description: `Read page ${pageNum} of verified client reviews and testimonials.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/feedback/page/${pageNum}`,
      siteName: 'Casamento Events Management',
      type: 'website',
    },
  };
}

export default async function FeedbackPageN({ params }: PageProps) {
  const { n } = await params;
  const pageNum = parseInt(n, 10);

  if (isNaN(pageNum) || pageNum < 2) return notFound();

  const [feedbacks, totalCount, aggregate, homeContent] = await Promise.all([
    getApprovedFeedbacksPage(pageNum, ITEMS_PER_PAGE),
    getApprovedFeedbacksCount(),
    getAggregateRating(),
    getHomePageContent(),
  ]);

  if (!feedbacks || feedbacks.length === 0) return notFound();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const prevHref = pageNum === 2 ? '/articles/feedback' : `/articles/feedback/page/${pageNum - 1}`;
  const hasNext = pageNum < totalPages;

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
          title={`Client Experiences`}
          description="Read full experiences and honest feedback from our valued clients."
          theme="light"
        />

        {/* Rating Display (No Card Container) */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {feedbacks.map((item, index) => (
            <FeedbackCard key={item._id} feedback={item} index={index} compact={false} />
          ))}
        </div>

        {/* Share Your Experience Action Button & Prompt */}
        <ShareExperienceTrigger />

        {/* Pagination nav */}
        <nav
          aria-label="Feedback pages"
          className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-8 border-t border-[#3A4F1C]/10"
        >
          {/* Left: Back / Previous Page */}
          <div className="flex justify-center md:justify-start">
            <Link
              href={prevHref}
              rel="prev"
              className="text-xs font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors uppercase tracking-wider"
            >
              ← Previous Page
            </Link>
          </div>

          {/* Center: Page Counter */}
          <div className="flex justify-center text-center">
            <span className="text-xs font-medium tracking-wider text-[#3A4F1C]/60 uppercase">
              Page {pageNum} of {totalPages}
            </span>
          </div>

          {/* Right: Next Page */}
          <div className="flex items-center justify-center md:justify-end gap-4 sm:gap-6">
            {hasNext && (
              <Link
                href={`/articles/feedback/page/${pageNum + 1}`}
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
