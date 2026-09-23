import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getArticleVlogBySlug,
  getAllArticleVlogSlugs,
} from '@/lib/services/articleVlogService';

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
    return { title: 'Vlog Not Found | Casamento Events' };
  }

  const thumbnailUrl = item.thumbnail?.asset?.url;

  return {
    title: `${item.title} | Casamento Events`,
    description: item.description ?? item.summary,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/vlogs/${slug}`,
    },
    openGraph: {
      title: item.title,
      description: item.description ?? item.summary,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/vlogs/${slug}`,
      siteName: 'Casamento Events Management',
      type: 'article',
      publishedTime: item.publishedAt,
      ...(thumbnailUrl && {
        images: [{ url: thumbnailUrl, alt: item.thumbnail.alt || item.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description ?? item.summary,
    },
  };
}

export default async function VlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getArticleVlogBySlug(slug);

  if (!item) return notFound();

  const thumbnailUrl = item.thumbnail?.asset?.url;

  const publishedDate = item.publishedAt
    ? new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(item.publishedAt))
    : null;

  return (
    <main className="min-h-screen bg-[#F7F3E8] pt-20">
      <article className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs text-[#3A4F1C]/50 flex items-center gap-2">
          <Link href="/articles" className="hover:text-[#BC6F07] transition-colors">
            Articles
          </Link>
          <span>/</span>
          <Link href="/articles/vlogs" className="hover:text-[#BC6F07] transition-colors">
            Vlogs
          </Link>
          <span>/</span>
          <span className="text-[#3A4F1C]/80 truncate max-w-[200px]">{item.title}</span>
        </nav>

        {/* Category & Date */}
        <div className="flex items-center gap-4 mb-4">
          {item.category?.title && (
            <span className="text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
              {item.category.title}
            </span>
          )}
          {publishedDate && (
            <span className="text-xs text-[#3A4F1C]/50">{publishedDate}</span>
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

        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-10 bg-[#1A2310]">
            <Image
              src={thumbnailUrl}
              alt={item.thumbnail.alt || item.title}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Summary */}
        {item.summary && (
          <p className="text-lg text-[#3A4F1C]/80 font-light leading-relaxed mb-8 border-l-2 border-[#BC6F07] pl-5">
            {item.summary}
          </p>
        )}

        {/* Full content placeholder — PortableText renderer goes here */}
        {/* TODO: Add @portabletext/react renderer when content body implementation is scoped */}

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
                  className="text-xs font-medium text-[#3A4F1C]/70 hover:text-[#BC6F07] capitalize underline underline-offset-4 transition-colors duration-200"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-14">
          <Link
            href="/articles/vlogs"
            className="text-sm text-[#3A4F1C]/60 hover:text-[#BC6F07] transition-colors duration-200 underline underline-offset-4"
          >
            ← Back to all vlogs
          </Link>
        </div>
      </article>
    </main>
  );
}
