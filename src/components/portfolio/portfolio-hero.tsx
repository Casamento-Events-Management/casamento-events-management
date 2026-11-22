import React from 'react';
import { PageHero, type PageHeroBannerImage } from '@/components/ui/page-hero';

interface PortfolioHeroProps {
  title?: string;
  description?: string;
  categoryTitle?: string;
  bannerImage?: PageHeroBannerImage | null;
  bannerImages?: PageHeroBannerImage[] | null;
}

export function PortfolioHero({
  title = 'Masterpieces in Motion',
  description = 'Explore our curated showcase of corporate events, brand activations, nationwide roadshows, stage and lighting production, broadcast livestreams, and social celebrations across the Philippines.',
  categoryTitle,
  bannerImage,
  bannerImages,
}: PortfolioHeroProps) {
  const displayTitle = categoryTitle ? `${categoryTitle} Portfolio` : title;
  const eyebrow = categoryTitle ? 'Portfolio Category' : 'Portfolio';

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
