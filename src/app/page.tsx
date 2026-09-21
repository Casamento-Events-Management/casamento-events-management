import React from 'react';
import type { Metadata } from 'next';
import { getHomePageContent } from '@/lib/services/homeService';
import { HeroSectionComponent } from '@/components/home/hero-section';
import { PartnersSection } from '@/components/home/partners-section';
import { ConnectSection } from '@/components/layout/connect-section';
import { HomeJsonLd } from '@/components/home/home-json-ld';
import { TeaserVideosSection } from '@/components/home/teaser-videos-section';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePageContent();
  const firstSlide = content.hero?.slides?.[0];
  const pageDescription =
    firstSlide?.description ||
    'Crafting unforgettable celebrations that last a lifetime. Luxury event management and production across the Philippines.';
  const pageOgImage =
    firstSlide?.image?.asset?.url ||
    firstSlide?.videoPoster?.asset?.url ||
    '';

  return {
    title: 'Casamento Events | Unforgettable Celebrations & Event Management',
    description: pageDescription,
    openGraph: {
      title: 'Casamento Events | Unforgettable Celebrations',
      description: pageDescription,
      locale: 'en_PH',
      images: [
        {
          url: pageOgImage,
          width: 1920,
          height: 1080,
          alt: firstSlide?.heading || 'Casamento Events Hero',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Casamento Events | Unforgettable Celebrations',
      description: pageDescription,
      images: [pageOgImage],
    },
  };
}

export default async function HomePage() {
  const content = await getHomePageContent();

  return (
    <>
      <HomeJsonLd content={content} />
      <article className="flex flex-col w-full">
        {/* Section 1: Hero / Landing Section */}
        <HeroSectionComponent hero={content.hero} />

        {/* Section 2: Teaser Videos Section */}
        <TeaserVideosSection
          teaserVideos={content.teaserVideos}
          eyebrow={content.teaserVideosEyebrow}
          title={content.teaserVideosTitle}
          description={content.teaserVideosDescription}
        />

        {/* Section 3: Partners: 1 whole section */}
        <PartnersSection partners={content.partners} />

        {/* Section 4: Connect With Us Section */}
        <ConnectSection socialLinks={content.socialLinks} />
      </article>
    </>
  );
}
