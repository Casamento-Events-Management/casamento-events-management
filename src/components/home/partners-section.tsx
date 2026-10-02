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
    <div className="relative w-full h-full">
      <Image
        src={logoUrl}
        alt={partner.logo.alt || partner.name}
        fill
        sizes="(max-width: 640px) 120px, 160px"
        className="object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  ) : (
    <span className="text-xs sm:text-sm font-serif font-semibold tracking-wide text-[#3A4F1C]/70 text-center leading-snug px-2">
      {partner.name}
    </span>
  );

  const sharedClass =
    'flex items-center justify-center w-[120px] h-[56px] sm:w-[148px] sm:h-[64px] transition-opacity duration-300 hover:opacity-100 opacity-80 cursor-default';

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

  // Split partners into rows matching the screenshot rhythm:
  // Row 1: up to 8, Row 2: up to 8, Row 3: up to 8, Row 4: remainder (centered)
  const rowSize = 8;
  const rows: Partner[][] = [];
  for (let i = 0; i < partners.length; i += rowSize) {
    rows.push(partners.slice(i, i + rowSize));
  }

  return (
    <section className="py-20 md:py-28 bg-[#F7F3E8]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          eyebrow="Collaborations"
          title="Trusted Industry Partners"
          description="We partner with elite artisans, luxury caterers, and renowned venue curators to deliver flawless experiences."
        />

        {/* Logo grid — rows of logos, last row centered */}
        <div className="mt-10 md:mt-14 flex flex-col gap-6 sm:gap-8">
          {rows.map((row, rowIdx) => {
            const isLastRow = rowIdx === rows.length - 1;
            return (
              <div
                key={rowIdx}
                className={`flex flex-wrap gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-8 ${
                  isLastRow ? 'justify-center' : 'justify-center lg:justify-between'
                }`}
              >
                {row.map((partner) => (
                  <PartnerLogo key={partner.name} partner={partner} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
