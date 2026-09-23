import React from 'react';
import type { Metadata } from 'next';
import { ArticleVlogBanner } from '@/components/articles/ArticleVlogBanner';
import { getArticleVlogBanner } from '@/lib/services/articleBannerService';

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
  const bannerData = await getArticleVlogBanner();

  return (
    <main className="min-h-screen bg-[#F7F3E8] pt-20">
      {/* Section 1: Article Vlog Banner */}
      <ArticleVlogBanner banner={bannerData} />
    </main>
  );
}
