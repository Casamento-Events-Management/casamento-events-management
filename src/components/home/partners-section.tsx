'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ClientBrand, Partner } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';

interface ClientsSectionProps {
  /** Array of client brand logos from Sanity */
  partners?: (ClientBrand | Partner)[];
  clients?: (ClientBrand | Partner)[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

function ClientLogo({ client }: { client: ClientBrand | Partner }) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = client.logo?.asset?.url;

  const inner = !imageError && logoUrl ? (
    <div className="relative w-full h-full cursor-pointer">
      <Image
        src={logoUrl}
        alt={client.logo.alt || client.name}
        fill
        sizes="(max-width: 640px) 120px, 220px"
        className="object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  ) : (
    <span className="text-xs sm:text-base font-serif font-semibold tracking-wide text-[#3A4F1C]/70 text-center leading-snug px-2">
      {client.name}
    </span>
  );

  const sharedClass =
    'flex items-center justify-center w-[120px] h-[56px] sm:w-[210px] sm:h-[92px] transition-opacity duration-300 hover:opacity-100 opacity-80 cursor-default';

  if (client.url) {
    return (
      <a
        href={client.url}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
        title={client.name}
      >
        {inner}
      </a>
    );
  }

  return <div className={sharedClass}>{inner}</div>;
}

export function ClientsSection({
  partners,
  clients,
  eyebrow = 'Trusted By',
  title = 'Brands & Organizations We’ve Served',
  description = 'Proud to have orchestrated milestone celebrations, brand activations, and turnkey corporate productions for distinguished companies and organizations across the Philippines.',
}: ClientsSectionProps) {
  const items = clients || partners || [];
  if (!items || items.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#F7F3E8]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/* Single flex-wrap container — logos center-align and wrap naturally */}
        <div className="mt-10 md:mt-14 flex flex-wrap justify-center gap-x-6 gap-y-6 sm:gap-x-14 sm:gap-y-10">
          {items.map((item) => (
            <ClientLogo key={item.name} client={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Backwards-compatible export alias */
export const PartnersSection = ClientsSection;

