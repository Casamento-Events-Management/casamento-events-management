import React from 'react';
import type { Metadata } from 'next';
import { getHomePageContent } from '@/lib/services/homeService';
import { HeroSectionComponent } from '@/components/home/hero-section';
import { TeaserVideosSection } from '@/components/home/teaser-videos-section';
import { UpcomingEventsSection } from '@/components/home/upcoming-events-section';
import { PartnersSection } from '@/components/home/partners-section';
import { ConnectSection } from '@/components/home/connect-section';
import { HomeJsonLd } from '@/components/home/home-json-ld';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePageContent();
  return {
    title: 'Casamento Events | Unforgettable Celebrations & Event Management',
    description: content.hero.brandline,
    openGraph: {
      title: 'Casamento Events | Unforgettable Celebrations',
      description: content.hero.brandline,
      images: [
        {
          url: content.hero.showreelThumbnail.asset.url || '',
          width: 1920,
          height: 1080,
          alt: content.hero.showreelThumbnail.alt || 'Casamento Events Hero',
        },
      ],
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

        {/* Section 2: 3 Teaser Videos Section */}
        <TeaserVideosSection teaserVideos={content.teaserVideos} />

        {/* Section 3: Upcoming Events Section */}
        <UpcomingEventsSection events={content.upcomingEvents} />

        {/* Section 4: Partners Section */}
        <PartnersSection partners={content.partners} />

        {/* Section 5: Connect With Us Section */}
        <ConnectSection socialLinks={content.socialLinks} />
      </article>
    </>
  );
}
