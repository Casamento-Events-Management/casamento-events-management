import React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Portfolio | Casamento Events',
  description: 'Explore our portfolio of bespoke weddings, debutante balls, and corporate galas.',
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <span className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
          Curated Showcase
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#3A4F1C]">
          Portfolio
        </h1>
        <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
        <p className="text-base sm:text-lg text-[#3A4F1C]/80 font-light leading-relaxed">
          Our full portfolio gallery experience is currently under scaffolding. Check out our featured events on the Home Page.
        </p>
        <div className="pt-6">
          <Button href="/" variant="primary" size="md">
            Return to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}
