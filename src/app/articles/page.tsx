import React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Articles & Vlogs | Casamento Events',
  description: 'Read event planning guides, design trends, and behind-the-scenes vlogs.',
};

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-[#F7F3E8] pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <span className="text-xs font-semibold tracking-widest text-[#BC6F07] uppercase">
          Editorial Journal
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#3A4F1C]">
          Articles & Vlogs
        </h1>
        <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
        <p className="text-base sm:text-lg text-[#3A4F1C]/80 font-light leading-relaxed">
          Our articles and video journal feature is coming soon in the upcoming CMS phase.
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
