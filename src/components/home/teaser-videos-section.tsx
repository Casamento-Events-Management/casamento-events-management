import React from 'react';
import type { TeaserVideo } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { TeaserCard } from './teaser-card';

interface TeaserVideosSectionProps {
  teaserVideos: TeaserVideo[];
}

export function TeaserVideosSection({ teaserVideos }: TeaserVideosSectionProps) {
  if (!teaserVideos || teaserVideos.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#F7F3E8]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          eyebrow="Visual Stories"
          title="Featured Teaser Highlights"
          subtitle="Experience the emotional intensity and cinematic splendor of our handcrafted celebrations."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {teaserVideos.map((teaser, index) => (
            <TeaserCard key={teaser.title + index} teaser={teaser} />
          ))}
        </div>
      </div>
    </section>
  );
}
