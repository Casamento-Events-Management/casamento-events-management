import React from 'react';
import type { HeroSection } from '@/types';
import { HeroPlayer } from './hero-player';

interface HeroSectionProps {
  hero: HeroSection;
}

export function HeroSectionComponent({ hero }: HeroSectionProps) {
  return (
    <section className="relative w-full pt-16 md:pt-20">
      <HeroPlayer hero={hero} />
    </section>
  );
}
