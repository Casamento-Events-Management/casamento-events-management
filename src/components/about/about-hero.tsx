import React from 'react';

interface AboutHeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * AboutHero Component
 *
 * Renders the editorial hero banner for the /about route, aligned with the
 * site-wide typography and spacing scale used across Portfolio, Services, and Booking.
 */
export function AboutHero({
  eyebrow = 'About Us',
  title = 'Our Story & Production Legacy',
  description = 'Delivering thoughtful planning, creative direction, and dependable full-scale event productions across the Philippines.',
}: AboutHeroProps) {
  return (
    <header className="pt-32 pb-16 md:pt-40 md:pb-20 px-6 bg-linear-to-b from-[#EFEAD8]/60 via-[#F7F3E8] to-[#F7F3E8] text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#BC6F07_1px,transparent_1px)] bg-size-[16px_16px]" />
      <div className="relative z-10 max-w-4xl mx-auto">
        {eyebrow && (
          <span className="inline-block text-xs md:text-sm font-semibold tracking-widest text-[#BC6F07] uppercase mb-3">
            {eyebrow}
          </span>
        )}
        {title && (
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-[#3A4F1C] mb-4 sm:mb-6 leading-tight [text-wrap:balance]">
            {title}
          </h1>
        )}
        <div className="w-16 h-0.5 bg-[#BC6F07] mx-auto mb-6" />
        {description && (
          <p className="text-lg md:text-xl text-[#3A4F1C]/80 font-serif italic max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
