import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = true,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`mb-12 md:mb-16 ${centered ? 'text-center' : 'text-left'} ${className}`}>
      {eyebrow && (
        <span className="block text-xs md:text-sm font-semibold tracking-widest text-[#BC6F07] uppercase mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-tight text-[#3A4F1C]">
        {title}
      </h2>
      <div
        className={`w-12 h-0.5 bg-[#BC6F07] mt-4 mb-4 ${centered ? 'mx-auto' : 'mr-auto'
          }`}
      />
      {subtitle && (
        <p
          className={`max-w-2xl text-base md:text-lg text-[#3A4F1C]/80 leading-relaxed font-light ${centered ? 'mx-auto' : ''
            }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
