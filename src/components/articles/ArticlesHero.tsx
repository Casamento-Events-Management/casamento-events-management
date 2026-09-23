import React from 'react';
import type { ArticlesHeroProps } from '@/types';

export function ArticlesHero({ content }: ArticlesHeroProps) {
  if (!content) return null;

  return (
    <div id="vlog-gallery" className="pt-16 pb-8 px-6 sm:px-8 max-w-7xl mx-auto">
      {content.eyebrow && (
        <span className="block text-xs font-semibold tracking-[0.25em] text-[#BC6F07] uppercase mb-3">
          {content.eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-serif text-[#3A4F1C] font-medium leading-tight mb-4">
        {content.title}
      </h2>
      {content.description && (
        <p className="text-base text-[#3A4F1C]/70 font-light max-w-2xl leading-relaxed">
          {content.description}
        </p>
      )}
    </div>
  );
}
