import React from 'react';
import { Globe } from 'lucide-react';
import type { SocialLink } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';

interface ConnectSectionProps {
  socialLinks: SocialLink[];
}

export function ConnectSection({ socialLinks }: ConnectSectionProps) {
  const getSocialIcon = (platform: string) => {
    const iconClass = "w-3.5 h-3.5 md:w-4 md:h-4 text-[#BC6F07] group-hover:text-white transition-colors shrink-0";

    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
            <path d="m10 15 5-3-5-3z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        );
      default:
        return <Globe className={iconClass} />;
    }
  };


  const getSocialLabel = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'tiktok':
        return 'TikTok';
      case 'youtube':
        return 'YouTube';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return platform;
    }
  };

  return (
    <section className="py-20 md:py-28 bg-[#3A4F1C] text-[#F7F3E8] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-[#BC6F07]_1px,transparent_1px] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <SectionHeading
          eyebrow="Join Our Journey"
          title="Connect With Us"
          subtitle="Follow our latest event highlights, behind-the-scenes stories, and creative inspirations across our official channels."
          className="[&_h2]:text-[#F7F3E8] [&_p]:text-[#F7F3E8]/80"
        />

        {/* Social Media Link Buttons (Compact 2x2 Grid on Mobile, Flex on Desktop) */}
        <div className="grid grid-cols-2 gap-2 max-w-[240px] mx-auto md:max-w-none md:flex md:flex-wrap md:items-center md:justify-center md:gap-6 mb-12">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 md:px-6 md:py-3.5 rounded-full bg-[#F7F3E8]/10 hover:bg-[#BC6F07] border border-[#F7F3E8]/20 hover:border-[#BC6F07] text-[#F7F3E8] font-medium text-[9px] md:text-xs tracking-wider uppercase transition-all duration-300 transform hover:-translate-y-0.5 shadow-xs w-full md:w-auto"
            >
              {getSocialIcon(link.platform)}
              <span className="truncate">{getSocialLabel(link.platform)}</span>
            </a>
          ))}
        </div>



        {/* Direct Booking Callout */}
        <div className="p-8 md:p-12 rounded-3xl bg-[#2A3A14] border border-[#BC6F07]/40 max-w-3xl mx-auto shadow-xl">
          <h3 className="text-2xl font-serif font-semibold text-[#F7F3E8] mb-3">
            Ready to plan your milestone celebration?
          </h3>
          <p className="text-sm text-[#F7F3E8]/80 font-light mb-6">
            Schedule a personal consultation with our event director to discuss your vision and date availability.
          </p>
          <Button href="/book-now" size="lg" variant="primary">
            Book Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}

