import React from 'react';
import { ArrowRight } from 'lucide-react';
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
 * Editorial Call-to-Action band for /about, aligned to the site's max-w-7xl grid
 * on the warm cream base directly above the deep-olive ConnectSection.
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
    <section className="py-16 sm:py-24 bg-[#F7F3E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
          <div className="max-w-2xl">
            {eyebrow && (
              <span className="inline-block text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-semibold tracking-tight text-[#3A4F1C] leading-[1.15] [text-wrap:balance]">
              {title}
            </h2>
            {description && (
              <p className="mt-4 text-sm sm:text-base text-[#3A4F1C]/75 font-light leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {(secondaryCtaText || primaryCtaText) && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {secondaryCtaText && safeSecondaryLink && (
                <Button
                  href={safeSecondaryLink}
                  variant="outline"
                  size="sm"
                  className="active:scale-[0.98]"
                >
                  {secondaryCtaText}
                </Button>
              )}
              {primaryCtaText && safePrimaryLink && (
                <Button
                  href={safePrimaryLink}
                  variant="primary"
                  size="sm"
                  className="inline-flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
