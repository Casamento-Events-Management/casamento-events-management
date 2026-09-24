// =============================================================================
// social-icon.tsx — Decoupled Social Media Icon Utility Component
//
// Returns official PNG icon images (from public/) for Facebook, Instagram, TikTok,
// Twitter/X, and YouTube, or fallback SVG/Lucide social icons based on platform.
// =============================================================================

import React from 'react';
import { Globe, Link as LinkIcon, Check, Share2, type LucideProps } from 'lucide-react';

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

export interface SocialIconProps extends React.HTMLAttributes<HTMLElement> {
  platform: SocialPlatform;
  className?: string;
}

export function SocialIcon({ platform, className = "w-5 h-5", ...props }: SocialIconProps) {
  const norm = platform.toLowerCase().trim();

  switch (norm) {
    case 'facebook':
      return (
        <img
          src="/facebook.png"
          alt="Facebook"
          className={`object-contain shrink-0 ${className}`}
          {...props}
        />
      );
    case 'instagram':
      return (
        <img
          src="/instagram.png"
          alt="Instagram"
          className={`object-contain shrink-0 ${className}`}
          {...props}
        />
      );
    case 'tiktok':
      return (
        <img
          src="/tiktok.png"
          alt="TikTok"
          className={`object-contain shrink-0 ${className}`}
          {...props}
        />
      );
    case 'youtube':
      return (
        <img
          src="/youtube.png"
          alt="YouTube"
          className={`object-contain shrink-0 ${className}`}
          {...props}
        />
      );
    case 'x':
    case 'twitter':
      return (
        <img
          src="/twitter.png"
          alt="Twitter / X"
          className={`object-contain shrink-0 ${className}`}
          {...props}
        />
      );
    case 'linkedin':
      return (
        <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...(props as unknown as React.SVGProps<SVGSVGElement>)}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'link':
    case 'copylink':
      return <LinkIcon className={`shrink-0 ${className}`} {...(props as unknown as LucideProps)} />;
    case 'check':
    case 'copied':
      return <Check className={`shrink-0 ${className}`} {...(props as unknown as LucideProps)} />;
    case 'share':
      return <Share2 className={`shrink-0 ${className}`} {...(props as unknown as LucideProps)} />;
    default:
      return <Globe className={`shrink-0 ${className}`} {...(props as unknown as LucideProps)} />;
  }
}
