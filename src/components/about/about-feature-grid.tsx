import React from 'react';
import { SectionHeading } from '@/components/ui/section-heading';
import { AboutIcon } from './about-icon';
import type { AboutCardItem } from '@/types';

interface AboutFeatureGridProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: AboutCardItem[];
  columns?: 2 | 3;
  surface?: 'plain' | 'tinted';
  cardSize?: 'default' | 'large';
}

/**
 * Reusable icon-card grid section powered by the shared `SectionHeading` UI primitive.
 * Renders Mission & Vision (2 columns, large cards), Core Values (3 columns, tinted band),
 * and Why Choose Casamento (3 columns, plain band) with consistent visual hierarchy.
 */
export function AboutFeatureGrid({
  eyebrow,
  title,
  description,
  items,
  columns = 3,
  surface = 'plain',
  cardSize = 'default',
}: AboutFeatureGridProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const isTinted = surface === 'tinted';
  const isTwoCol = columns === 2;
  const isLarge = cardSize === 'large';

  const sectionClasses = isTinted
    ? 'py-16 md:py-24 px-6 bg-[#EFEAD8]/50 border-y border-[#3A4F1C]/10'
    : isTwoCol
      ? 'py-16 md:py-20 px-6 max-w-5xl mx-auto'
      : 'py-16 md:py-24 px-6 max-w-6xl mx-auto';

  const innerClasses = isTinted ? 'max-w-6xl mx-auto' : '';

  const gridClasses = isTwoCol
    ? 'grid grid-cols-1 md:grid-cols-2 gap-8'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8';

  const cardClasses = isLarge
    ? 'relative rounded-3xl p-8 sm:p-10 bg-white text-[#3A4F1C] shadow-xs border border-[#3A4F1C]/15 flex flex-col justify-between overflow-hidden group'
    : isTinted
      ? 'p-8 rounded-2xl bg-white border border-[#3A4F1C]/10 shadow-xs hover:border-[#BC6F07]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-start'
      : 'p-8 rounded-2xl bg-white/90 border border-[#3A4F1C]/10 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-start relative group';

  const titleClasses = isLarge
    ? 'text-xl sm:text-2xl font-serif font-semibold text-[#3A4F1C] mb-4 tracking-tight'
    : isTinted
      ? 'text-lg font-serif font-semibold text-[#3A4F1C] tracking-wide mb-3'
      : 'text-lg font-serif font-semibold text-[#3A4F1C] mb-3 leading-snug';

  const descClasses = isLarge
    ? 'text-base sm:text-lg text-[#3A4F1C]/80 leading-relaxed font-light'
    : 'text-sm sm:text-base text-[#3A4F1C]/75 leading-relaxed font-light';

  return (
    <section className={sectionClasses}>
      <div className={innerClasses}>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div className={gridClasses}>
          {items.map((item, index) => (
            <div key={item._key || `${item.title}-${index}`} className={cardClasses}>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#F7F3E8] border border-[#BC6F07]/30 flex items-center justify-center text-[#BC6F07] mb-6">
                  <AboutIcon name={item.icon} className="w-6 h-6" />
                </div>
                <h3 className={titleClasses}>{item.title}</h3>
                <p className={descClasses}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
