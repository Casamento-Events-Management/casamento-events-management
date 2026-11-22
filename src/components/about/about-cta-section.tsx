import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { sanitizeHref } from '@/lib/utils/securityUtils';

interface AboutCtaSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
}

/**
 * Call-to-Action section for the /about route, reusing the shared
 * `SectionHeading` and `Button` UI primitives.
 */
export function AboutCtaSection({
  eyebrow = 'Begin Your Journey',
  title = 'Ready to Bring Your Next Event to Life?',
  description = 'From corporate conferences and brand activations to private celebrations and nationwide productions, our team brings heart, precision, and purpose to every detail.',
  secondaryCtaText = 'Explore Services',
  secondaryCtaLink = '/services',
  primaryCtaText = 'Get in Touch',
  primaryCtaLink = '#contact-form',
}: AboutCtaSectionProps) {
  const safeSecondaryLink = secondaryCtaLink ? sanitizeHref(secondaryCtaLink) : '';
  const safePrimaryLink = primaryCtaLink ? sanitizeHref(primaryCtaLink) : '';

  return (
    <section className="py-16 md:py-24 px-6 bg-[#EFEAD8]/50 border-y border-[#3A4F1C]/10 text-center relative overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-8 md:mb-10"
        />

        {(secondaryCtaText || primaryCtaText) && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {secondaryCtaText && safeSecondaryLink && (
              <Button href={safeSecondaryLink} variant="outline" size="md">
                {secondaryCtaText}
              </Button>
            )}
            {primaryCtaText && safePrimaryLink && (
              <Button
                href={safePrimaryLink}
                variant="primary"
                size="md"
                className="inline-flex items-center gap-2 shadow-md"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
