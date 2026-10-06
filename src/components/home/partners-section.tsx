'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Partner } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';

interface PartnersSectionProps {
  partners: Partner[];
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = partner.logo?.asset?.url;

  const inner = !imageError && logoUrl ? (
    <div className="relative w-full h-full cursor-pointer">
      <Image
        src={logoUrl}
        alt={partner.logo.alt || partner.name}
        fill
        sizes="(max-width: 640px) 120px, 220px"
        className="object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  ) : (
    <span className="text-xs sm:text-base font-serif font-semibold tracking-wide text-[#3A4F1C]/70 text-center leading-snug px-2">
      {partner.name}
    </span>
  );

  const sharedClass =
    'flex items-center justify-center w-[120px] h-[56px] sm:w-[210px] sm:h-[92px] transition-opacity duration-300 hover:opacity-100 opacity-80 cursor-default';

  if (partner.url) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
        title={partner.name}
      >
        {inner}
      </a>
    );
  }

  return <div className={sharedClass}>{inner}</div>;
}

export function PartnersSection({ partners }: PartnersSectionProps) {
  if (!partners || partners.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#F7F3E8]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          eyebrow="Collaborations"
          title="Trusted Industry Partners"
          description="We partner with elite artisans, luxury caterers, and renowned venue curators to deliver flawless experiences."
        />

        {/* Single flex-wrap container — logos center-align and wrap naturally */}
        <div className="mt-10 md:mt-14 flex flex-wrap justify-center gap-x-6 gap-y-6 sm:gap-x-14 sm:gap-y-10">
          {partners.map((partner) => (
            <PartnerLogo key={partner.name} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}

