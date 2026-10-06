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
    'Professional event planning, turnkey corporate activations, broadcast-grade livestreaming, and memorable milestone celebrations across Metro Manila, Tagaytay, and nationwide.';
  const pageOgImage =
    firstSlide?.image?.asset?.url ||
    firstSlide?.videoPoster?.asset?.url ||
    '';

  return {
    title: 'Casamento Events Management | Professional Event Planning & Production Philippines',
    description: pageDescription,
    keywords: [
      'event management company Philippines',
      'corporate event planner Metro Manila',
      'brand activation agency Philippines',
      'wedding coordinator Tagaytay Manila',
      'OTD coordinator Manila',
      'live stream production Manila',
      'stage and lighting design Philippines',
      'debut package Philippines',
      'company year end party organizer',
      'mall tour event organizer Metro Manila',
      'Casamento Events Management',
    ],
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
    },
    openGraph: {
      title: 'Casamento Events Management | Professional Event Planning & Production Philippines',
      description: pageDescription,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
      siteName: 'Casamento Events Management',
      locale: 'en_PH',
      images: [
        {
          url: pageOgImage || '/icon.png',
          width: 1920,
          height: 1080,
          alt: firstSlide?.heading || 'Casamento Events Management',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Casamento Events Management | Professional Event Planning & Production',
      description: pageDescription,
      images: [pageOgImage || '/icon.png'],
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
