import React from 'react';
import type { Metadata } from 'next';
import { getHomeHeroContent, getFeaturedTeaserContent } from '@/lib/services/homeService';
import { getContactSectionContent } from '@/lib/services/contactService';
import { HeroSectionComponent } from '@/components/home/hero-section';
import { PartnersSection } from '@/components/home/partners-section';
import { ConnectSection } from '@/components/layout/connect-section';
import { HomeJsonLd } from '@/components/home/home-json-ld';
import { TeaserVideosSection } from '@/components/home/teaser-videos-section';

export async function generateMetadata(): Promise<Metadata> {
  const heroContent = await getHomeHeroContent();
  const firstSlide = heroContent.hero?.slides?.[0];
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
  const [heroContent, teaserContent, contactContent] = await Promise.all([
    getHomeHeroContent(),
    getFeaturedTeaserContent(),
    getContactSectionContent(),
  ]);

  const compositeJsonLdContent = {
    _id: heroContent._id,
    _type: 'homePage' as const,
    _createdAt: heroContent._createdAt,
    _updatedAt: heroContent._updatedAt,
    hero: heroContent.hero,
    teaserVideosEyebrow: teaserContent.teaserVideosEyebrow,
    teaserVideosTitle: teaserContent.teaserVideosTitle,
    teaserVideosDescription: teaserContent.teaserVideosDescription,
    teaserVideos: teaserContent.teaserVideos,
    partners: heroContent.partners,
  };

  return (
    <>
      <HomeJsonLd content={compositeJsonLdContent} />
      <article className="flex flex-col w-full">
        {/* Section 1: Hero / Landing Section */}
        <HeroSectionComponent hero={heroContent.hero} />

        {/* Section 2: Teaser Videos Section */}
        <TeaserVideosSection
          teaserVideos={teaserContent.teaserVideos}
          eyebrow={teaserContent.teaserVideosEyebrow}
          title={teaserContent.teaserVideosTitle}
          description={teaserContent.teaserVideosDescription}
        />

        {/* Section 3: Partners: 1 whole section */}
        <PartnersSection partners={heroContent.partners} />

        {/* Section 4: Connect With Us Section */}
        <ConnectSection
          eyebrow={contactContent.eyebrow}
          title={contactContent.title}
          description={contactContent.description}
          socialLinks={contactContent.socialLinks}
        />
      </article>
    </>
  );
}
