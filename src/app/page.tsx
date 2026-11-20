import React from 'react';
import type { Metadata } from 'next';
import { getHomeHeroContent, getFeaturedTeaserContent, getClientSectionContent } from '@/lib/services/homeService';
import { getContactSectionContent } from '@/lib/services/contactService';
import { getPortfolioUpcomingEvents } from '@/lib/services/portfolioService';
import { getServiceCategories } from '@/lib/services/serviceService';
import { HeroSectionComponent } from '@/components/home/hero-section';
import { ClientsSection } from '@/components/home/partners-section';
import { ConnectSection } from '@/components/layout/connect-section';
import { HomeJsonLd } from '@/components/home/home-json-ld';
import { TeaserVideosSection } from '@/components/home/teaser-videos-section';
import {
  buildCanonicalUrl,
  buildOpenGraphImages,
  SITE_NAME,
} from '@/lib/utils/seoUtils';

export async function generateMetadata(): Promise<Metadata> {
  const heroContent = await getHomeHeroContent();
  const firstSlide = heroContent.hero?.slides?.[0];
  const pageDescription =
    firstSlide?.description ||
    'Full-service events management and creative production in the Philippines: corporate events, brand activations, roadshows, social celebrations, styling, broadcast livestreaming, and e-commerce production nationwide.';
  const pageOgImage =
    firstSlide?.image?.asset?.url ||
    firstSlide?.videoPoster?.asset?.url ||
    undefined;
  const ogImages = buildOpenGraphImages(
    pageOgImage,
    firstSlide?.heading || `${SITE_NAME} — Full-Service Event Planning & Production Philippines`,
    pageOgImage ? 1920 : 1200,
    pageOgImage ? 1080 : 630
  );
  const canonicalUrl = buildCanonicalUrl('/');

  return {
    title: {
      absolute: 'Events Management & Production Philippines | Casamento Events Management',
    },
    description: pageDescription,
    keywords: [
      'event management company Philippines',
      'corporate event planner Metro Manila',
      'brand activation agency Philippines',
      'event production company Philippines',
      'live stream production Manila',
      'stage and lighting design Philippines',
      'company year end party organizer',
      'mall tour event organizer Metro Manila',
      'e-commerce live selling production Manila',
      'social event coordinator Philippines',
      'Casamento Events Management',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Events Management & Production Philippines | Casamento Events Management',
      description: pageDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_PH',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Events Management & Production Philippines | Casamento Events Management',
      description: pageDescription,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function HomePage() {
  const [heroContent, teaserContent, clientContent, contactContent, upcomingEventsData, serviceCategories] =
    await Promise.all([
      getHomeHeroContent(),
      getFeaturedTeaserContent(),
      getClientSectionContent(),
      getContactSectionContent(),
      getPortfolioUpcomingEvents(),
      getServiceCategories(),
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
    partners: clientContent.partners,
    socialLinks: contactContent.socialLinks,
    upcomingEvents: upcomingEventsData.upcomingEvents,
  };

  return (
    <>
      <HomeJsonLd content={compositeJsonLdContent} serviceCategories={serviceCategories} />
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

        {/* Section 3: Clients & Brands Served Section */}
        <ClientsSection
          partners={clientContent.partners}
          eyebrow={clientContent.eyebrow}
          title={clientContent.title}
          description={clientContent.description}
        />

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
