import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getAllArticleVlogSlugs,
  getArticleVlogBySlug,
  getRelatedArticleVlogs,
} from '@/lib/services/articleVlogService';
import { CustomPortableText } from '@/components/ui/portable-text';
import { parseVideoSource } from '@/lib/utils/videoUtils';
import { SocialIcon } from '@/components/ui/social-icon';
import { ArticleVlogJsonLd } from '@/components/articles/article-vlog-json-ld';
import { Button } from '@/components/ui/button';
import {
  buildCanonicalUrl,
  buildOpenGraphImages,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllArticleVlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getArticleVlogBySlug(slug);

  if (!item) {
    return { title: 'Article Not Found' };
  }

  const canonicalUrl = buildCanonicalUrl(`/articles/vlogs/${slug}`);
  const thumbnailUrl = item.thumbnail?.asset?.url;
  const description = item.description ?? item.summary;
  const ogImages = buildOpenGraphImages(
    thumbnailUrl,
    item.thumbnail?.alt || item.title
  );

  return {
    title: item.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${item.title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_PH',
      type: 'article',
      publishedTime: item.publishedAt,
      modifiedTime: item._updatedAt || item.publishedAt,
      ...(item.category?.title && { section: item.category.title }),
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.title} | ${SITE_NAME}`,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function VlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getArticleVlogBySlug(slug);

  if (!item) return notFound();

  const relatedItems = await getRelatedArticleVlogs(slug, item.category?.slug, 3);
  const thumbnailUrl = item.thumbnail?.asset?.url;

  const publishedDate = item.publishedAt
    ? new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(item.publishedAt))
    : null;

  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-20">
      <ArticleVlogJsonLd item={item} slug={slug} />

      <article className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-[#3A4F1C]/50 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#BC6F07] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/articles" className="hover:text-[#BC6F07] transition-colors">
            Articles
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/articles/vlogs" className="hover:text-[#BC6F07] transition-colors">
            Vlogs
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#3A4F1C]/80 truncate max-w-[220px]">{item.title}</span>
        </nav>

        {/* Category & Date */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {item.category?.title && (
            <Link
              href={`/portfolio/${item.category.slug}`}
              className="text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase hover:underline underline-offset-4"
            >
              {item.category.title}
            </Link>
          )}
          {publishedDate && (
            <time dateTime={item.publishedAt} className="text-xs text-[#3A4F1C]/50">
              {publishedDate}
            </time>
          )}
          {item.mediaType === 'video' && item.videoDuration && (
            <span className="text-xs text-[#3A4F1C]/50">{item.videoDuration}</span>
          )}
          {item.mediaType === 'image' && item.readTime && (
            <span className="text-xs text-[#3A4F1C]/50">{item.readTime}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif text-[#3A4F1C] font-medium leading-tight mb-6">
          {item.title}
        </h1>

        {/* Description */}
        {item.description && (
          <p className="text-base text-[#3A4F1C]/75 font-light leading-relaxed mb-8 max-w-2xl">
            {item.description}
          </p>
        )}

        {/* Hero Media Container — Video Player or Image Showcase */}
        {(() => {
          if (item.mediaType === 'video' && item.videoSource) {
            const parsed = parseVideoSource(item.videoSource, false);

            if (parsed.sourceType === 'sanity' || parsed.sourceType === 'native') {
              const videoUrl = parsed.directUrl || '';
              if (videoUrl) {
                return (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-10 bg-[#1A2310] shadow-xl">
                    <video
                      controls
                      preload="none"
                      width={1280}
                      height={720}
                      playsInline
                      poster={thumbnailUrl}
                      className="w-full h-full object-contain bg-black"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support HTML5 video.
                    </video>
                  </div>
                );
              }
            }

            if (parsed.sourceType === 'external' && parsed.embedUrl) {
              return (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-10 bg-[#1A2310] shadow-xl">
                  <iframe
                    src={parsed.embedUrl}
                    title={item.title}
                    className="w-full h-full border-0 bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              );
            }
          }

          if (thumbnailUrl) {
            return (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-10 bg-[#1A2310] shadow-lg">
                <Image
                  src={thumbnailUrl}
                  alt={item.thumbnail.alt || item.title}
                  fill
                  priority
                  fetchPriority="high"
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              </div>
            );
          }

          return null;
        })()}

        {/* Summary */}
        {item.summary && (
          <p className="text-lg text-[#3A4F1C]/80 font-light leading-relaxed mb-8 border-l-2 border-[#BC6F07] pl-5">
            {item.summary}
          </p>
        )}

        {/* Full content body from Sanity PortableText */}
        {item.content && item.content.length > 0 && (
          <div className="my-8">
            <CustomPortableText value={item.content} />
          </div>
        )}

        {/* Social Backlinks */}
        {item.socialBacklinks && item.socialBacklinks.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[#3A4F1C]/10">
            <p className="text-xs font-semibold tracking-widest text-[#3A4F1C]/50 uppercase mb-3">
              Also on
            </p>
            <div className="flex items-center gap-4">
              {item.socialBacklinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  title={link.platform}
                  className="text-[#3A4F1C]/75 hover:text-[#BC6F07] transition-colors duration-200"
                >
                  <SocialIcon platform={link.platform} className="w-5.5 h-5.5 sm:w-6 sm:h-6 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* E-E-A-T Publisher Attribution & Service CTA */}
        <aside className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#EFEAD8]/70 border border-[#3A4F1C]/15">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase mb-2">
            Published by {SITE_NAME}
          </p>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#3A4F1C] mb-2">
            Planning an Upcoming Event or Production in the Philippines?
          </h2>
          <p className="text-sm text-[#3A4F1C]/80 font-light leading-relaxed mb-5 max-w-2xl">
            With over 14 years of nationwide experience across Metro Manila, Luzon, Visayas, and Mindanao, our team delivers corporate events, brand activations, roadshows, social celebrations, stage styling, livestreaming, and e-commerce production.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/book-now" size="sm" variant="primary">
              Plan Your Event
            </Button>
            <Button href="/services" size="sm" variant="outline">
              Explore Our Services
            </Button>
            {item.category?.slug && (
              <Link
                href={`/portfolio/${item.category.slug}`}
                className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C] hover:text-[#BC6F07] underline underline-offset-4 ml-1 transition-colors"
              >
                View {item.category.title} Portfolio →
              </Link>
            )}
          </div>
        </aside>

        {/* Related Articles & Vlogs (Internal Linking) */}
        {relatedItems.length > 0 && (
          <section aria-labelledby="related-vlogs-heading" className="mt-14 pt-10 border-t border-[#3A4F1C]/15">
            <h2
              id="related-vlogs-heading"
              className="text-xl sm:text-2xl font-serif font-semibold text-[#3A4F1C] mb-6"
            >
              More Event Planning Guides &amp; Vlogs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedItems.map((related) => {
                const relThumb = related.thumbnail?.asset?.url;
                return (
                  <Link
                    key={related._id}
                    href={`/articles/vlogs/${related.slug.current}`}
                    className="group flex flex-col rounded-xl bg-white/80 border border-[#3A4F1C]/10 overflow-hidden hover:border-[#BC6F07]/40 hover:shadow-sm transition-all duration-200"
                  >
                    {relThumb && (
                      <div className="relative w-full aspect-video bg-[#1A2310] overflow-hidden">
                        <Image
                          src={relThumb}
                          alt={related.thumbnail?.alt || related.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, 280px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col gap-1.5 flex-1">
                      {related.category?.title && (
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-[#BC6F07]">
                          {related.category.title}
                        </span>
                      )}
                      <h3 className="text-sm font-serif font-semibold text-[#3A4F1C] group-hover:text-[#BC6F07] transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link
            href="/articles/vlogs"
            className="text-sm text-[#3A4F1C]/60 hover:text-[#BC6F07] transition-colors duration-200 underline underline-offset-4"
          >
            ← Back to all vlogs &amp; guides
          </Link>
        </div>
      </article>
    </div>
  );
}
