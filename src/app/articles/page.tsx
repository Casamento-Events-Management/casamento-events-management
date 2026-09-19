import React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

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

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <span className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
          Editorial Journal
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#3A4F1C]">
          Articles & Vlogs
        </h1>
        <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
        <p className="text-base sm:text-lg text-[#3A4F1C]/80 font-light leading-relaxed">
          Our articles and video journal feature is coming soon in the upcoming CMS phase.
        </p>
        <div className="pt-6">
          <Button href="/" variant="primary" size="md">
            Return to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}
