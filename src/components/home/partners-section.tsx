'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Partner } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';

interface PartnersSectionProps {
  partners: Partner[];
}

function PartnerItem({ partner }: { partner: Partner }) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = partner.logo?.asset?.url;

  const content = (
    <div className="group relative flex flex-col items-center justify-center px-6 py-4 min-w-[160px] md:min-w-[200px] transition-all duration-300">
      {!imageError && logoUrl ? (
        <div className="relative w-36 h-16 md:w-44 md:h-20 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <Image
            src={logoUrl}
            alt={partner.logo.alt || partner.name}
            fill
            sizes="200px"
            className="object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="h-16 md:h-20 flex items-center justify-center text-center px-4 border border-dashed border-[#3A4F1C]/20 rounded-xl bg-white/40">
          <span className="text-sm font-serif font-semibold tracking-wider text-[#3A4F1C]/80 group-hover:text-[#BC6F07] transition-colors">
            {partner.name}
          </span>
        </div>
      )}
    </div>
  );

  if (partner.url) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}

export function PartnersSection({ partners }: PartnersSectionProps) {
  if (!partners || partners.length === 0) return null;

  // Duplicate list to ensure a seamless infinite scrolling track across all screen sizes
  const marqueePartners = [...partners, ...partners, ...partners];

  return (
    <section className="py-20 md:py-28 bg-[#F7F3E8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          eyebrow="Collaborations"
          title="Trusted Industry Partners"
          subtitle="We partner with elite artisans, luxury caterers, and renowned venue curators to deliver flawless experiences."
        />
      </div>

      {/* Infinite Logo Marquee Track (Applies across all screen sizes) */}
      <div className="relative w-full overflow-hidden pt-4 pb-2">
        {/* Soft edge gradient fades */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#F7F3E8] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#F7F3E8] to-transparent" />

        <div className="animate-marquee items-center gap-8 md:gap-16">
          {marqueePartners.map((partner, index) => (
            <PartnerItem key={`${partner.name}-${index}`} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}

