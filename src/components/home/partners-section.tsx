import React from 'react';
import Image from 'next/image';
import type { Partner } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';

interface PartnersSectionProps {
  partners: Partner[];
}

export function PartnersSection({ partners }: PartnersSectionProps) {
  if (!partners || partners.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#F7F3E8]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading
          eyebrow="Collaborations"
          title="Trusted Industry Partners"
          subtitle="We partner with elite artisans, luxury caterers, and renowned venue curators to deliver flawless experiences."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 items-center justify-center">
          {partners.map((partner) => {
            const content = (
              <div className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-white/60 border border-[#3A4F1C]/10 shadow-xs hover:shadow-md hover:bg-white transition-all duration-300">
                <div className="relative w-full h-20 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 flex items-center justify-center">
                  <Image
                    src={partner.logo.asset.url || ''}
                    alt={partner.logo.alt || partner.name}
                    fill
                    sizes="200px"
                    className="object-contain"
                  />
                </div>
                <span className="mt-4 text-xs font-serif font-semibold tracking-wider text-[#3A4F1C]/80 group-hover:text-[#BC6F07] transition-colors">
                  {partner.name}
                </span>
              </div>
            );

            if (partner.url) {
              return (
                <a
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none"
                >
                  {content}
                </a>
              );
            }

            return <div key={partner.name}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
