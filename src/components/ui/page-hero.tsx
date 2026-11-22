import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroBannerMedia } from '@/components/ui/hero-banner-media';

export interface PageHeroBannerImage {
  url: string;
  alt?: string;
}

export interface PageHeroCTA {
  label?: string;
  href?: string;
}

export interface PageHeroProps {
  /** Small uppercase kicker label displayed above the main heading */
  eyebrow?: string;
  /** Primary page H1 headline */
  title?: string;
  /** Introductory summary paragraph below the headline */
  description?: string;
  /** Optional italic editorial lead/quote (e.g. brand name origin on About page) */
  quote?: string;
  /** Single optional full-bleed background banner image */
  bannerImage?: PageHeroBannerImage | null;
  /** Multiple optional banner images — auto-rotates as a crossfade carousel */
  bannerImages?: PageHeroBannerImage[] | null;
  /** Carousel interval in milliseconds (defaults to 2000ms) */
  intervalMs?: number;
  /** Optional primary call-to-action button (e.g. from CMS `ctaButton` field) */
  ctaButton?: PageHeroCTA | null;
  /** Optional custom action buttons or links rendered below the description */
  actions?: React.ReactNode;
}

/**
 * Reusable editorial PageHero component shared across public pages.
 *
 * - Normalized bottom-left editorial alignment aligned to the site's max-w-7xl grid.
 * - Matches the editorial banner height proportion below the fixed header.
 * - Supports a 2-second crossfade banner carousel when multiple images are provided.
 * - Supports an optional structured `ctaButton` (with automatic banner/cream contrast)
 *   as well as custom `actions`.
 * - 3-tier banner fallback:
 *     1. Banner image(s) present & loaded → full-bleed photo/carousel + deep-olive scrim + cream text.
 *     2. No banner configured → same geometry on muted cream (#EFEAD8) + olive text.
 *     3. Banner URL(s) fail to load → client media leaf hides cleanly, revealing solid
 *        deep-olive (#2A3A14) so light overlay text maintains full contrast.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  quote,
  bannerImage,
  bannerImages,
  intervalMs = 2000,
  ctaButton,
  actions,
}: PageHeroProps) {
  const normalizedImages: PageHeroBannerImage[] = [];
  const seenUrls = new Set<string>();

  const candidates = [
    ...(Array.isArray(bannerImages) ? bannerImages : []),
    ...(bannerImage ? [bannerImage] : []),
  ];

  for (const img of candidates) {
    const cleanUrl = img?.url?.trim();
    if (cleanUrl && !seenUrls.has(cleanUrl)) {
      seenUrls.add(cleanUrl);
      normalizedImages.push({ url: cleanUrl, alt: img.alt });
    }
  }

  const hasBanner = normalizedImages.length > 0;
  const ctaLabel = ctaButton?.label?.trim();
  const hasCta = Boolean(ctaLabel);
  const hasContent = Boolean(eyebrow || title || quote || description || hasCta || actions);

  return (
    <div className="pt-[72px] bg-[#F7F3E8]">
      <header
        className={`relative w-full overflow-hidden flex flex-col justify-end min-h-[280px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[460px] xl:min-h-[540px] ${
          hasBanner
            ? 'bg-[#2A3A14] text-[#F7F3E8]'
            : 'bg-[#EFEAD8] text-[#3A4F1C] border-b border-[#3A4F1C]/15'
        }`}
      >
        {/* Optional Full-Bleed Background Banner Carousel + Warm Deep-Olive Scrim */}
        {hasBanner && (
          <>
            <HeroBannerMedia
              images={normalizedImages}
              fallbackAlt={title || 'Casamento Events Management'}
              intervalMs={intervalMs}
            />
            {hasContent && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A2310]/90 via-[#1A2310]/50 to-[#1A2310]/20"
              />
            )}
          </>
        )}

        {/* Bottom-Left Editorial Content Container */}
        {hasContent && (
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              {eyebrow && (
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
                  {eyebrow}
                </span>
              )}

              {title && (
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] [text-wrap:balance] ${
                    hasBanner ? 'text-[#F7F3E8]' : 'text-[#3A4F1C]'
                  }`}
                >
                  {title}
                </h1>
              )}

              {(eyebrow || title) && (
                <div className="w-12 h-0.5 bg-[#BC6F07]" aria-hidden="true" />
              )}

              {quote && (
                <p
                  className={`text-base sm:text-lg md:text-xl italic leading-relaxed max-w-2xl ${
                    hasBanner ? 'text-[#F7F3E8]/85' : 'text-[#3A4F1C]/85'
                  }`}
                >
                  {quote}
                </p>
              )}

              {description && (
                <p
                  className={`text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl ${
                    hasBanner ? 'text-[#F7F3E8]/85' : 'text-[#3A4F1C]/80'
                  }`}
                >
                  {description}
                </p>
              )}

              {(hasCta || actions) && (
                <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3">
                  {hasCta && (
                    <Button
                      href={ctaButton?.href || '#'}
                      variant="primary"
                      size="sm"
                      className={
                        hasBanner
                          ? 'bg-[#BC6F07] hover:bg-[#9E5B04] text-[#F7F3E8] border-[#BC6F07] inline-flex items-center gap-2 active:scale-[0.98]'
                          : 'inline-flex items-center gap-2 active:scale-[0.98]'
                      }
                    >
                      <span>{ctaLabel}</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 shrink-0"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </Button>
                  )}
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
