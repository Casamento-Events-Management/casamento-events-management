import React from 'react';
import Image from 'next/image';
import type { ArticleVlogBannerProps } from '@/types';
import { Button } from '@/components/ui/button';

export const ArticleVlogBanner: React.FC<ArticleVlogBannerProps> = ({ banner }) => {
  const imageUrl = banner?.backgroundImage?.asset?.url;

  if (!banner || !imageUrl) {
    return null;
  }

  const { backgroundImage, title, description, ctaButton } = banner;
  const hasOverlayContent = Boolean(title || description || ctaButton?.label);

  return (
    <section className="relative w-full overflow-hidden bg-[#1A2310] h-[260px] xs:h-[300px] sm:h-[360px] md:h-[450px] lg:h-[520px] xl:h-[580px]">
      {/* Background Image (Full-bleed YouTube-style banner) */}
      <Image
        src={imageUrl}
        alt={backgroundImage.alt || title || 'Article Vlog Banner'}
        fill
        priority
        className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
        sizes="100vw"
      />

      {/* Conditionally render overlay gradient scrim & text if title/description exist */}
      {hasOverlayContent && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="max-w-4xl space-y-3 sm:space-y-4">
            {/* Optional Headline Title */}
            {title && (
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white font-medium leading-tight drop-shadow-md line-clamp-2">
                {title}
              </h1>
            )}

            {/* Optional Description */}
            {description && (
              <p className="text-xs sm:text-sm md:text-base text-white/90 font-light max-w-2xl leading-relaxed drop-shadow-sm line-clamp-3">
                {description}
              </p>
            )}

            {/* Optional CTA Link */}
            {ctaButton?.label && (
              <div className="pt-1 sm:pt-2">
                <Button
                  href={ctaButton.href || '#vlog-gallery'}
                  variant="primary"
                  size="sm"
                  className="text-[10px] sm:text-xs md:text-sm px-3.5 py-1.5 sm:px-5 sm:py-2.5 shadow-lg transition-transform hover:scale-105"
                >
                  {ctaButton.label}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
