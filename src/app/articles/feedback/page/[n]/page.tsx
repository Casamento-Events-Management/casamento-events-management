import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
  SITE_NAME,
} from '@/lib/utils/seoUtils';

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
  const canonicalUrl = buildCanonicalUrl(`/articles/feedback/page/${pageNum}`);
  const ogImages = buildOpenGraphImages(
    undefined,
    `Client Reviews — Page ${pageNum} — ${SITE_NAME}`
  );

  return {
    title: `Client Reviews & Testimonials — Page ${pageNum}`,
    description: `Read page ${pageNum} of verified client reviews and event testimonials for ${SITE_NAME} across the Philippines.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Client Reviews & Testimonials — Page ${pageNum} | ${SITE_NAME}`,
      description: `Read page ${pageNum} of verified client reviews and event testimonials.`,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_PH',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Client Reviews & Testimonials — Page ${pageNum} | ${SITE_NAME}`,
      description: `Read page ${pageNum} of verified client reviews and event testimonials.`,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function FeedbackPageN({ params }: PageProps) {
  const { n } = await params;
  const pageNum = parseInt(n, 10);

  if (isNaN(pageNum) || pageNum < 2) return notFound();

  const [feedbacks, totalCount, aggregate, contactData] = await Promise.all([
    getApprovedFeedbacksPage(pageNum, ITEMS_PER_PAGE),
    getApprovedFeedbacksCount(),
    getAggregateRating(),
    getContactSectionContent(),
  ]);

  if (!feedbacks || feedbacks.length === 0) return notFound();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const prevHref = pageNum === 2 ? '/articles/feedback' : `/articles/feedback/page/${pageNum - 1}`;
  const hasNext = pageNum < totalPages;

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Articles & Vlogs', path: '/articles' },
    { name: 'Client Reviews', path: '/articles/feedback' },
    { name: `Page ${pageNum}`, path: `/articles/feedback/page/${pageNum}` },
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-24 pb-16">
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
          title="Client Experiences"
          description="Read verified experiences and honest feedback from our valued clients across the Philippines."
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
              &larr; Previous Page
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
