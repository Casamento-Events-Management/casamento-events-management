import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero, type PageHeroBannerImage } from '@/components/ui/page-hero';

interface BookingHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  bannerImage?: PageHeroBannerImage | null;
  bannerImages?: PageHeroBannerImage[] | null;
}

/**
 * BookingHero Component
 *
 * Delegates to the normalized reusable PageHero component for the /book-now route,
 * adapting CTA button contrast automatically when a photo banner/carousel is active.
 */
export function BookingHero({
  eyebrow = 'Service Booking',
  title = 'Plan Your Event with Casamento',
  description = 'Schedule a personalized consultation or begin your inquiry for corporate events, brand activations, roadshows, social celebrations, livestreaming, creative production, and more across the Philippines.',
  bannerImage,
  bannerImages,
}: BookingHeroProps) {
  const hasBanner = Boolean(
    bannerImage?.url?.trim() ||
      (Array.isArray(bannerImages) && bannerImages.some((img) => Boolean(img?.url?.trim())))
  );

  return (
    <PageHero
      eyebrow={eyebrow}
      title={title}
      description={description}
      bannerImage={bannerImage}
      bannerImages={bannerImages}
      intervalMs={2000}
      actions={
        <>
          <Button
            href="/services"
            variant="primary"
            size="sm"
            className={
              hasBanner
                ? 'bg-[#BC6F07] hover:bg-[#9E5B04] text-[#F7F3E8] border-[#BC6F07] inline-flex items-center gap-2 active:scale-[0.98]'
                : 'inline-flex items-center gap-2 active:scale-[0.98]'
            }
          >
            <span>View Our Services</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          </Button>
          <Button
            href="#contact-form"
            variant="secondary"
            size="sm"
            className={
              hasBanner
                ? 'bg-[#F7F3E8]/10 hover:bg-[#F7F3E8]/20 text-[#F7F3E8] border-[#F7F3E8]/30 active:scale-[0.98]'
                : 'active:scale-[0.98]'
            }
          >
            Contact Us
          </Button>
        </>
      }
    />
  );
}
