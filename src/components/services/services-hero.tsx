import React from 'react';
import { PageHero, type PageHeroBannerImage } from '@/components/ui/page-hero';

interface ServicesHeroProps {
  title?: string;
  description?: string;
  categoryTitle?: string;
  bannerImage?: PageHeroBannerImage | null;
  bannerImages?: PageHeroBannerImage[] | null;
}

/**
 * ServicesHero Component
 *
 * Delegates to the normalized reusable PageHero component for the /services route.
 */
export function ServicesHero({
  title,
  description,
  categoryTitle,
  bannerImage,
  bannerImages,
}: ServicesHeroProps) {
  const displayTitle = categoryTitle ? `${categoryTitle} Services` : title;
  const eyebrow = categoryTitle ? 'Service Category' : 'Our Services';

  return (
    <PageHero
      eyebrow={eyebrow}
      title={displayTitle}
      description={description}
      bannerImage={bannerImage}
      bannerImages={bannerImages}
      intervalMs={2000}
    />
  );
}
