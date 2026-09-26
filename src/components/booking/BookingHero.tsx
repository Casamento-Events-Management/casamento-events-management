import React from 'react';
import { Button } from '@/components/ui/button';

interface BookingHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * BookingHero Component
 *
 * Renders the primary editorial hero banner for the /book-now page.
 * Uses design system styling consistent with ServicesHero (font-serif, #3A4F1C, #BC6F07).
 * Features two hardcoded CTA buttons: "Browse Our Services" (primary) and "Contact Us" (secondary).
 */
export function BookingHero({
  eyebrow = 'SERVICE BOOKING',
  title = 'Reserve Your Date with Casamento',
  description = 'Schedule a personalized consultation with us or begin your booking inquiry for weddings, product streaming, social events, etc...',
}: BookingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#F7F3E8] pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest text-[#BC6F07] uppercase mb-3 sm:mb-4">
            {eyebrow}
          </span>
        )}

        {title && (
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-[#3A4F1C] mb-4 sm:mb-6 leading-tight [text-wrap:balance]">
            {title}
          </h1>
        )}

        <div className="w-12 h-0.5 bg-[#BC6F07]/60 mx-auto mb-6 sm:mb-8" />

        {description && (
          <p className="text-sm sm:text-base md:text-lg text-[#3A4F1C]/80 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed font-light [text-wrap:balance] mb-8">
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/services" variant="primary" size="md">
            View Our Services
          </Button>
          <Button href="/#contact-form" variant="secondary" size="md">
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}
