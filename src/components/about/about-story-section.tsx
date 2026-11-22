import React from 'react';

interface AboutStorySectionProps {
  paragraphs: string[];
  closingStatement?: string;
  mantras?: string[];
}

/**
 * Editorial narrative section for /about.
 * Uses an asymmetric 12-column magazine layout with a sticky pull-quote rail,
 * airy prose column, and an open 3-column hairline mantra strip — zero wrapper cards.
 */
export function AboutStorySection({
  paragraphs,
  closingStatement,
  mantras = [],
}: AboutStorySectionProps) {
  if (!paragraphs.length && !closingStatement && !mantras.length) {
    return null;
  }

  const [leadParagraph, ...bodyParagraphs] = paragraphs;

  return (
    <section
      aria-labelledby="about-story-heading"
      className="py-16 sm:py-24 md:py-28 bg-[#F7F3E8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Sticky Rail: Section Kicker & Editorial Pull-Quote */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
            <div>
              <span className="inline-block text-xs font-semibold tracking-[0.2em] text-[#BC6F07] uppercase">
                Our Story
              </span>
              <h2
                id="about-story-heading"
                className="mt-2.5 text-2xl sm:text-3xl font-semibold tracking-tight text-[#3A4F1C] leading-tight [text-wrap:balance]"
              >
                Rooted in Family, Built for Every Stage
              </h2>
              <div className="mt-4 w-12 h-0.5 bg-[#BC6F07]" aria-hidden="true" />
            </div>

            {closingStatement && (
              <blockquote className="border-l-2 border-[#BC6F07] pl-5 py-1 text-base sm:text-lg font-medium text-[#3A4F1C] leading-relaxed">
                {closingStatement}
              </blockquote>
            )}
          </div>

          {/* Right Narrative Column: Clean Editorial Prose */}
          <div className="lg:col-span-8 max-w-2xl space-y-6">
            {leadParagraph && (
              <p className="text-lg sm:text-xl text-[#3A4F1C] font-normal leading-relaxed">
                {leadParagraph}
              </p>
            )}

            {bodyParagraphs.map((paragraph, index) => (
              <p
                key={`story-p-${index}`}
                className="text-base sm:text-lg text-[#3A4F1C]/80 font-light leading-[1.8]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Open 3-Column Hairline Mantra Cadence */}
        {mantras.length > 0 && (
          <div className="mt-14 sm:mt-20 pt-10 sm:pt-12 border-t border-[#3A4F1C]/15 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-[#3A4F1C]/15">
            {mantras.map((mantra, index) => (
              <div
                key={`mantra-${index}`}
                className="pt-4 first:pt-0 border-t border-[#3A4F1C]/10 first:border-t-0 md:pt-0 md:border-t-0 md:px-8 md:first:pl-0 md:last:pr-0"
              >
                <p className="text-lg sm:text-xl font-medium tracking-tight text-[#3A4F1C] leading-snug">
                  {mantra}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
