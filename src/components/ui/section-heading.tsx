import React from 'react';

export interface SectionHeadingProps {
  /** Small kicker tag displayed above the headline (e.g. "EVENT JOURNAL") */
  eyebrow?: string;
  /** Main section headline text. Accepts string or ReactNode for styled <span> highlights. */
  title: string | React.ReactNode;
  /** Subtitle paragraph / editorial description below headline. */
  description?: string;
  /** Legacy alias for description. */
  subtitle?: string;
  /** Text color theme mode: 'light' (dark text on light bg) or 'dark' (light text on dark bg). Defaults to 'light'. */
  theme?: 'light' | 'dark';
  /** Optional background color class wrapper e.g. "bg-[#3A4F1C]" or "bg-[#F7F3E8]". */
  bgColor?: string;
  /** Whether to center text alignment. Defaults to true. */
  centered?: boolean;
  /** Whether to display the signature gold divider accent line. Defaults to true. */
  showDivider?: boolean;
  /** Additional container classes. */
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  subtitle,
  theme = 'light',
  bgColor,
  centered = true,
  showDivider = true,
  className = '',
}: SectionHeadingProps) {
  const displayDescription = description || subtitle;
  const isDark = theme === 'dark';

  const titleColorClass = isDark ? 'text-[#F7F3E8]' : 'text-[#3A4F1C]';
  const descColorClass = isDark ? 'text-[#F7F3E8]/80' : 'text-[#3A4F1C]/80';

  return (
    <div
      className={`mb-10 md:mb-14 ${centered ? 'text-center' : 'text-left'} ${
        bgColor ? `${bgColor} p-6 sm:p-10 rounded-2xl` : ''
      } ${className}`}
    >
      {eyebrow && (
        <span className="block text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#BC6F07] uppercase mb-2 sm:mb-3">
          {eyebrow}
        </span>
      )}
      {typeof title === 'string' ? (
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-tight ${titleColorClass} leading-tight`}>
          {title}
        </h2>
      ) : (
        <div className={`text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-tight ${titleColorClass} leading-tight`}>
          {title}
        </div>
      )}

      {showDivider && (
        <div
          className={`w-12 h-0.5 bg-[#BC6F07] mt-3 sm:mt-4 mb-3 sm:mb-4 ${
            centered ? 'mx-auto' : 'mr-auto'
          }`}
        />
      )}

      {displayDescription && (
        <p
          className={`max-w-3xl text-sm sm:text-base md:text-lg ${descColorClass} leading-relaxed font-light ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {displayDescription}
        </p>
      )}
    </div>
  );
}

/** Re-export SectionHero alias for maximum clarity */
export const SectionHero = SectionHeading;
