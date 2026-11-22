import React from 'react';
import type { ArticleVlogBannerProps } from '@/types';
import { PageHero, type PageHeroBannerImage } from '@/components/ui/page-hero';

/**
 * ArticleVlogBanner Component
 *
 * Delegates to the normalized reusable PageHero component for the /articles route,
 * preserving the optional CTA button and supporting both the 2s banner carousel
 * (`bannerImages`) and legacy single `backgroundImage` documents.
 */
export const ArticleVlogBanner: React.FC<ArticleVlogBannerProps> = ({ banner }) => {
  if (!banner) {
    return null;
  }

  const bannerImages: PageHeroBannerImage[] = [
    ...(Array.isArray(banner.bannerImages) ? banner.bannerImages : []),
    ...(banner.backgroundImage?.asset?.url
      ? [
          {
            url: banner.backgroundImage.asset.url,
            alt: banner.backgroundImage.alt,
          },
        ]
      : []),
  ];

  const hasContent = Boolean(
    bannerImages.length > 0 ||
      banner.title ||
      banner.description ||
      banner.ctaButton?.label
  );

  if (!hasContent) {
    return null;
  }

  return (
    <PageHero
      title={banner.title}
      description={banner.description}
      bannerImages={bannerImages}
      intervalMs={2000}
      ctaButton={
        banner.ctaButton?.label
          ? {
              label: banner.ctaButton.label,
              href: banner.ctaButton.href || '#vlog-gallery',
            }
          : undefined
      }
    />
  );
};
