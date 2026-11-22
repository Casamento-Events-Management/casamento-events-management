import React from 'react';
import type { AboutCardItem } from '@/types';

export type AboutFeatureVariant = 'split' | 'ledger' | 'rows';

interface AboutFeatureGridProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: AboutCardItem[];
  columns?: 2 | 3;
  surface?: 'plain' | 'tinted';
  cardSize?: 'default' | 'large';
  /**
   * Editorial layout variant:
   * - `split`: 2-column architectural statement split separated by a hairline (Mission & Vision).
   * - `ledger`: Open 3-column hairline-topped typographic grid (Core Values).
   * - `rows`: Sticky left header + indexed horizontal editorial rows (Why Choose Casamento).
   */
  variant?: AboutFeatureVariant;
}

/**
 * Editorial typography-led section renderer for /about.
 * Eliminates repetitive icon-in-a-box cards in favor of structured hairlines
 * and distinct section rhythms aligned to the brand's cream/olive/gold palette.
 */
export function AboutFeatureGrid({
  eyebrow,
  title,
  description,
  items,
  columns = 3,
  surface = 'plain',
  cardSize = 'default',
  variant,
}: AboutFeatureGridProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const resolvedVariant: AboutFeatureVariant =
    variant ?? (columns === 2 || cardSize === 'large' ? 'split' : 'ledger');

  const isTinted = surface === 'tinted';
  const sectionBg = isTinted
    ? 'bg-[#EFEAD8]/65 border-y border-[#3A4F1C]/10'
    : 'bg-[#F7F3E8]';

  // 1. Sticky Intro Left + Structured Horizontal Rows Right (Why Choose Casamento)
  if (resolvedVariant === 'rows') {
    return (
      <section className={`py-16 sm:py-24 md:py-28 ${sectionBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              {eyebrow && (
                <span className="inline-block text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
                  {eyebrow}
                </span>
              )}
              <h2 className="mt-2.5 text-3xl sm:text-4xl font-semibold tracking-tight text-[#3A4F1C] leading-[1.15] [text-wrap:balance]">
                {title}
              </h2>
              <div className="mt-4 w-12 h-0.5 bg-[#BC6F07]" aria-hidden="true" />
              {description && (
                <p className="mt-5 text-sm sm:text-base text-[#3A4F1C]/75 font-light leading-relaxed max-w-md">
                  {description}
                </p>
              )}
            </div>

            <ul className="lg:col-span-8 divide-y divide-[#3A4F1C]/15 border-y border-[#3A4F1C]/15">
              {items.map((item, index) => (
                <li
                  key={item._key || `${item.title}-${index}`}
                  className="py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline"
                >
                  <h3 className="sm:col-span-5 text-base sm:text-lg font-semibold tracking-tight text-[#3A4F1C] leading-snug">
                    {item.title}
                  </h3>
                  <p className="sm:col-span-7 text-sm sm:text-base text-[#3A4F1C]/75 font-light leading-relaxed">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  // 2. Monumental 2-Column Architectural Statement Split (Mission & Vision)
  if (resolvedVariant === 'split') {
    return (
      <section className={`py-16 sm:py-24 md:py-28 ${sectionBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-14">
            {eyebrow && (
              <span className="inline-block text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-semibold tracking-tight text-[#3A4F1C] leading-[1.15] [text-wrap:balance]">
              {title}
            </h2>
            {description && (
              <p className="mt-3 text-sm sm:text-base text-[#3A4F1C]/75 font-light leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="border-t border-[#3A4F1C]/15 pt-10 sm:pt-12 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 md:divide-x md:divide-[#3A4F1C]/15">
            {items.map((item, index) => (
              <div
                key={item._key || `${item.title}-${index}`}
                className="pt-8 first:pt-0 border-t border-[#3A4F1C]/15 first:border-t-0 md:pt-0 md:border-t-0 md:pr-12 md:last:pr-0 md:last:pl-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-0.5 bg-[#BC6F07]" aria-hidden="true" />
                  <h3 className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-[#BC6F07]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl text-[#3A4F1C]/90 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. Open 3-Column Hairline-Topped Editorial Ledger (Core Values)
  return (
    <section className={`py-16 sm:py-24 md:py-28 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-12 sm:mb-16">
          <div className="lg:col-span-6">
            {eyebrow && (
              <span className="inline-block text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-semibold tracking-tight text-[#3A4F1C] leading-[1.15] [text-wrap:balance]">
              {title}
            </h2>
          </div>
          {description && (
            <p className="lg:col-span-6 text-sm sm:text-base text-[#3A4F1C]/75 font-light leading-relaxed max-w-xl lg:justify-self-end">
              {description}
            </p>
          )}
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-14 gap-y-10 sm:gap-y-12">
          {items.map((item, index) => (
            <li
              key={item._key || `${item.title}-${index}`}
              className="border-t border-[#3A4F1C]/20 pt-5 flex flex-col"
            >
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#3A4F1C]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-[#3A4F1C]/75 font-light leading-relaxed">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
