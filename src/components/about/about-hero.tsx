import React from 'react';
import { PageHero, type PageHeroBannerImage } from '@/components/ui/page-hero';

interface AboutHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  bannerImage?: PageHeroBannerImage | null;
  bannerImages?: PageHeroBannerImage[] | null;
}

/**
 * AboutHero Component
 *
 * Delegates to the normalized reusable PageHero component for the /about route.
 */
export function AboutHero({
  eyebrow = 'About Us',
  title = 'Our Story & Production Legacy',
  description = 'Delivering thoughtful planning, creative direction, and dependable full-scale event productions across the Philippines.',
  bannerImage,
  bannerImages,
}: AboutHeroProps) {
  return (
    <PageHero
      eyebrow={eyebrow}
      title={title}
      quote={description}
      bannerImage={bannerImage}
      bannerImages={bannerImages}
      intervalMs={2000}
    />
  );
}
