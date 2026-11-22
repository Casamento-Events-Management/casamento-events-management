import React from 'react';

interface AboutStorySectionProps {
  paragraphs: string[];
  closingStatement?: string;
  mantras?: string[];
}

export function AboutStorySection({
  paragraphs,
  closingStatement,
  mantras = [],
}: AboutStorySectionProps) {
  if (!paragraphs.length && !closingStatement && !mantras.length) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 px-6 max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-8 sm:p-12 md:p-14 border border-[#3A4F1C]/10 shadow-xs space-y-6 text-[#3A4F1C]/85 text-base sm:text-lg leading-relaxed font-light">
        {paragraphs.map((paragraph, index) => (
          <p key={`story-p-${index}`}>{paragraph}</p>
        ))}

        {closingStatement && (
          <p className="text-[#3A4F1C] font-normal">{closingStatement}</p>
        )}

        {mantras.length > 0 && (
          <div className="pt-6 border-t border-[#3A4F1C]/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {mantras.map((mantra, index) => (
              <div
                key={`mantra-${index}`}
                className="p-5 rounded-2xl bg-[#F7F3E8] border border-[#BC6F07]/20"
              >
                <span className="block font-serif text-lg font-semibold text-[#3A4F1C]">
                  {mantra}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
