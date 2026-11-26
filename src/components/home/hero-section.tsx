import React from 'react';
import type { HeroSection } from '@/types';
import { HeroCarousel } from './hero-carousel';

interface HeroSectionProps {
  hero: HeroSection;
}

export function HeroSectionComponent({ hero }: HeroSectionProps) {
  return (
    <section className="relative w-full pt-[72px] bg-[#F7F3E8]">
      <HeroCarousel hero={hero} />
    </section>
  );
}

