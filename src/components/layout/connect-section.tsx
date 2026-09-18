import React from 'react';
import type { SocialLink } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { SocialIcon } from '@/components/ui/social-icon';

interface ConnectSectionProps {
  socialLinks: SocialLink[];
}

export function ConnectSection({ socialLinks }: ConnectSectionProps) {
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
              <SocialIcon platform={link.platform} className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#BC6F07] group-hover:text-white transition-colors shrink-0" />
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/book-now" size="lg" variant="primary">
              Book Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

