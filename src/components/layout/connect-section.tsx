import React from 'react';
import Image from 'next/image';
import type { SocialLink } from '@/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { SocialIcon } from '@/components/ui/social-icon';
import { ContactForm } from '@/components/layout/contact-form';
import iconImg from '@/app/icon.png';

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
      {/* Subtle Dot Matrix Texture */}
      <div className="absolute inset-0 opacity-5 bg-[radial-[#BC6F07]_1px,transparent_1px] bg-size-[16px_16px] z-0" />

      {/* One Large Overlayed Watermark Logo Background */}
      <div className="absolute inset-0 flex items-start lg:items-center justify-center pt-2 sm:pt-4 md:pt-6 lg:pt-0 pointer-events-none z-0 overflow-hidden">
        <div className="relative w-[650px] h-[650px] sm:w-[750px] sm:h-[750px] md:w-[1000px] md:h-[1000px] lg:w-[1200px] lg:h-[1200px] opacity-20 lg:opacity-15 mix-blend-screen select-none">
          <Image
            src={iconImg}
            alt=""
            fill
            className="object-contain object-top lg:object-center"
            priority={false}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <SectionHeading
          eyebrow="Join Our Journey"
          title="Connect With Us"
          description="Follow our latest event highlights, behind-the-scenes stories, and creative inspirations across our official channels."
          theme="dark"
        />

        {/* Social Media Link Buttons (Compact 2x2 Grid on Mobile, Flex on Desktop) */}
        <div className="grid grid-cols-2 gap-2 max-w-60 mx-auto md:max-w-none md:flex md:flex-wrap md:items-center md:justify-center md:gap-6 mb-12" id="contact-form">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 md:px-6 md:py-3.5 rounded-full bg-[#F7F3E8]/10 hover:bg-[#BC6F07] border border-[#F7F3E8]/20 hover:border-[#BC6F07] text-[#F7F3E8] font-medium text-[9px] md:text-xs tracking-wider uppercase transition-all duration-300 transform hover:-translate-y-0.5 shadow-xs w-full md:w-auto"
            >
              <SocialIcon platform={link.platform} className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              <span className="truncate">{getSocialLabel(link.platform)}</span>
            </a>
          ))}
        </div>

        {/* Contact Us Form Callout */}
        <div className="p-8 md:p-12 rounded-3xl bg-[#2A3A14] border border-[#BC6F07]/40 max-w-3xl mx-auto shadow-xl relative z-10">
          <h3 className="text-2xl font-serif font-semibold text-[#F7F3E8] mb-6 text-center">
            Contact Us
          </h3>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
