import React from 'react';
import type { ArticlesHeroProps } from '@/types';
import { SectionHero } from '@/components/ui/section-heading';

export function ArticlesHero({ content }: ArticlesHeroProps) {
  if (!content) return null;

  return (
    <div id="vlog-gallery" className="pt-12 pb-4 px-6 sm:px-8 max-w-7xl mx-auto">
      <SectionHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        centered={true}
      />
    </div>
  );
}
