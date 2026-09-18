// =============================================================================
// social-icon.tsx — Decoupled Social Media Icon Utility Component
//
// Returns SVG/Lucide social icons based on platform string using a switch-case
// statement. Renders ONLY the icon element — letting consuming components decide
// whether to display a label text or not.
// =============================================================================

import React from 'react';
import { Globe, Link as LinkIcon, Check, Share2 } from 'lucide-react';

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'x'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'vimeo'
  | 'link'
  | 'copylink'
  | 'check'
  | 'copied'
  | 'share'
  | string;

export interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  platform: SocialPlatform;
  className?: string;
}

export function SocialIcon({ platform, className = "w-4 h-4", ...props }: SocialIconProps) {
  const norm = platform.toLowerCase().trim();

  switch (norm) {
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'x':
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 1 1-2.896-2.892c.319 0 .63.05.923.148V9.43a6.34 6.34 0 1 0 5.418 6.242V9.014a8.216 8.216 0 0 0 4.77 1.521V7.086a4.787 4.787 0 0 1-1.000-.400z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'link':
    case 'copylink':
      return <LinkIcon className={className} {...props} />;
    case 'check':
    case 'copied':
      return <Check className={className} {...props} />;
    case 'share':
      return <Share2 className={className} {...props} />;
    default:
      return <Globe className={className} {...props} />;
  }
}
