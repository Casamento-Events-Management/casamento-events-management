import React from 'react';
import type { Metadata } from 'next';
import {
  Heart,
  Sparkles,
  Award,
  ShieldCheck,
  Flame,
  Users,
  Clock3,
  Layers3,
  Lightbulb,
  Video,
  MapPin,
  Handshake,
  Target,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us | Our Story, Mission & Values',
  description:
    'Learn about Casamento Events Management — born from love and family, with over 14 years of creating meaningful, memorable events and full-scale productions across the Philippines.',
  keywords: [
    'about Casamento Events',
    'Casamento story',
    'events management Philippines',
    'wedding planner Manila',
    'corporate event production Philippines',
    'Casamento core values',
    'full service production company Manila',
  ],
  openGraph: {
    title: 'About Us | Casamento Events Management',
    description:
      'Born from a deeply personal story of love and purpose. Over 14 years of bringing meaningful celebrations and productions to life across the Philippines.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/about`,
    siteName: 'Casamento Events Management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Casamento Events Management',
    description:
      'Born from a deeply personal story of love and purpose. Over 14 years of bringing meaningful celebrations and productions to life across the Philippines.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/about`,
  },
};

const CORE_VALUES = [
  {
    title: 'LOVE',
    description:
      'We believe the most unforgettable experiences begin with genuine care—for our clients, our team, and the stories entrusted to us.',
    icon: Heart,
  },
  {
    title: 'CREATIVITY',
    description:
      'We continuously develop fresh concepts and tailored solutions that make every celebration and production distinctive.',
    icon: Sparkles,
  },
  {
    title: 'EXCELLENCE',
    description:
      'We pursue quality in every detail, from planning and preparation to execution and completion.',
    icon: Award,
  },
  {
    title: 'INTEGRITY',
    description:
      'We build lasting relationships through transparency, accountability, fairness, and respect.',
    icon: ShieldCheck,
  },
  {
    title: 'RESILIENCE',
    description:
      'We face every challenge with determination, adaptability, and a commitment to deliver.',
    icon: Flame,
  },
  {
    title: 'COLLABORATION',
    description:
      'We believe the best results come from working closely with clients, partners, suppliers, and our production team.',
    icon: Users,
  },
];

const WHY_CHOOSE_ITEMS = [
  {
    title: '14 Years of Experience',
    description:
      'More than a decade of planning, producing, and managing meaningful events and brand experiences.',
    icon: Clock3,
  },
  {
    title: 'Complete Event and Production Solutions',
    description:
      'One dependable team for planning, creative direction, styling, technical production, livestreaming, and on-ground management.',
    icon: Layers3,
  },
  {
    title: 'Customized Concepts',
    description:
      'Every event is thoughtfully developed around the client’s story, objectives, audience, and working budget.',
    icon: Lightbulb,
  },
  {
    title: 'Experienced Production Team',
    description:
      'Our team understands the demands of live events, large-scale roadshows, corporate programs, and digital broadcasts.',
    icon: Video,
  },
  {
    title: 'Nationwide Capability',
    description:
      'We are equipped to manage events and productions across Luzon, Visayas, and Mindanao.',
    icon: MapPin,
  },
  {
    title: 'Heart in Every Detail',
    description:
      'Casamento was founded on a meaningful family story. That same heart continues to guide how we care for every client and every project.',
    icon: Handshake,
  },
];

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Casamento Events Management',
    description:
      'The story, mission, vision, core values, and capabilities of Casamento Events Management.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com'}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Casamento Events Management',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com',
      foundingDate: '2012',
      description:
        'A full-service events, creative, and production company offering social and corporate event management, creative production, event styling, digital advertising, livestreaming, and e-commerce production management across the Philippines.',
      knowsAbout: [
        'Event Management',
        'Creative Production',
        'Wedding Planning',
        'Corporate Events',
        'Livestreaming Production',
        'Event Styling',
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-[#F7F3E8] text-[#3A4F1C]">
        {/* Hero Banner */}
        <header className="pt-32 pb-16 md:pt-40 md:pb-20 px-6 bg-linear-to-b from-[#EFEAD8]/60 via-[#F7F3E8] to-[#F7F3E8] text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#BC6F07_1px,transparent_1px)] bg-size-[16px_16px]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-block text-xs md:text-sm font-semibold tracking-widest text-[#BC6F07] uppercase mb-3">
              About Us
            </span>
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-[#3A4F1C] mb-4 sm:mb-6 leading-tight [text-wrap:balance]">
              Our Story: A Legacy Born from Love
            </h1>
            <div className="w-16 h-0.5 bg-[#BC6F07] mx-auto mb-6" />
            <p className="text-lg md:text-xl text-[#3A4F1C]/80 font-serif italic max-w-2xl mx-auto">
              “Casamento” is the Portuguese word for “wedding”—a name rooted in a deeply personal story of love, family, and purpose.
            </p>
          </div>
        </header>

        {/* Section 1: Our Story */}
        <section className="py-12 md:py-16 px-6 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-8 sm:p-12 md:p-14 border border-[#3A4F1C]/10 shadow-xs space-y-6 text-[#3A4F1C]/85 text-base sm:text-lg leading-relaxed font-light">
            <p>
              The founders dreamed of organizing their parents’ renewal of vows and witnessing them walk down the aisle together for the first time. When their father passed away from cancer before that dream could be fulfilled, their loss became a meaningful mission: to help other people celebrate life, honor love, and create memories that will endure for generations.
            </p>
            <p>
              From that beautiful yet bittersweet story, Casamento Events Management was born.
            </p>
            <p>
              For over 14 years, Casamento has helped individuals, families, companies, and brands bring their visions to life. From intimate gatherings to major productions and nationwide campaigns, we approach every project with creativity, precision, professionalism, and genuine care.
            </p>
            <p>
              Today, Casamento has grown beyond traditional event management. We have evolved into a full-service events, creative, and production company offering social and corporate event management, creative production, event styling, digital advertising, livestreaming, and e-commerce production management.
            </p>
            <p className="text-[#3A4F1C] font-normal">
              While our capabilities continue to expand, the heart of our company remains unchanged.
            </p>

            {/* Core Mantras */}
            <div className="pt-6 border-t border-[#3A4F1C]/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-[#F7F3E8] border border-[#BC6F07]/20">
                <span className="block font-serif text-lg font-semibold text-[#3A4F1C]">
                  We create with purpose.
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-[#F7F3E8] border border-[#BC6F07]/20">
                <span className="block font-serif text-lg font-semibold text-[#3A4F1C]">
                  We produce with passion.
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-[#F7F3E8] border border-[#BC6F07]/20">
                <span className="block font-serif text-lg font-semibold text-[#3A4F1C]">
                  We celebrate every story.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Mission & Vision */}
        <section className="py-16 md:py-20 px-6 max-w-5xl mx-auto">
          <SectionHeading
            eyebrow="Our North Star"
            title="Mission & Vision"
            subtitle="Guiding every concept, production, and celebration we deliver."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="relative rounded-3xl p-8 sm:p-10 bg-white text-[#3A4F1C] shadow-xs border border-[#3A4F1C]/15 flex flex-col justify-between overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#F7F3E8] border border-[#BC6F07]/30 flex items-center justify-center text-[#BC6F07] mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#3A4F1C] mb-4 tracking-tight">
                  Mission
                </h3>
                <p className="text-base sm:text-lg text-[#3A4F1C]/80 leading-relaxed font-light">
                  To transform our clients’ ideas into meaningful and memorable experiences through creative thinking, thoughtful planning, innovative production, and dependable execution.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="relative rounded-3xl p-8 sm:p-10 bg-white text-[#3A4F1C] shadow-xs border border-[#3A4F1C]/15 flex flex-col justify-between overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#F7F3E8] border border-[#BC6F07]/30 flex items-center justify-center text-[#BC6F07] mb-6">
                  <Eye className="w-6 h-6 text-[#BC6F07]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#3A4F1C] mb-4 tracking-tight">
                  Vision
                </h3>
                <p className="text-base sm:text-lg text-[#3A4F1C]/80 leading-relaxed font-light">
                  To become one of the Philippines’ most trusted and forward-thinking events and production companies—recognized for creating experiences that connect people, strengthen brands, and leave lasting memories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Our Core Values */}
        <section className="py-16 md:py-24 px-6 bg-[#EFEAD8]/50 border-y border-[#3A4F1C]/10">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              eyebrow="Our Foundation"
              title="Our Core Values"
              subtitle="The guiding principles that shape how we work, create, and build lasting relationships."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {CORE_VALUES.map((value) => {
                const IconComponent = value.icon;
                return (
                  <div
                    key={value.title}
                    className="p-8 rounded-2xl bg-white border border-[#3A4F1C]/10 shadow-xs hover:border-[#BC6F07]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-start"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#F7F3E8] border border-[#BC6F07]/30 flex items-center justify-center text-[#BC6F07] mb-6">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-[#3A4F1C] tracking-wide mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#3A4F1C]/75 leading-relaxed font-light">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Why Choose Casamento? */}
        <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="The Casamento Distinction"
            title="Why Choose Casamento?"
            subtitle="From deep family roots to comprehensive nationwide production, discover what sets us apart."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {WHY_CHOOSE_ITEMS.map((item, _) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-8 rounded-2xl bg-white/90 border border-[#3A4F1C]/10 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-start relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#F7F3E8] border border-[#BC6F07]/30 flex items-center justify-center text-[#BC6F07] mb-6">
                      <IconComponent className="w-6 h-6 text-[#BC6F07]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-[#3A4F1C] mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#3A4F1C]/75 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Call to Action */}
        <section className="py-16 md:py-20 px-6 bg-[#3A4F1C] text-[#F7F3E8] text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#BC6F07_1px,transparent_1px)] bg-size-[16px_16px]" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="text-xs md:text-sm font-semibold tracking-widest text-[#BC6F07] uppercase">
              Begin Your Journey
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#F7F3E8] tracking-tight">
              Ready to Celebrate Your Story?
            </h2>
            <div className="w-12 h-0.5 bg-[#BC6F07] mx-auto" />
            <p className="text-base sm:text-lg text-[#F7F3E8]/80 leading-relaxed font-light max-w-xl mx-auto">
              From intimate celebrations to grand nationwide productions, our team brings heart, precision, and purpose to every detail.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button href="/services" variant="secondary" size="md">
                Explore Services
              </Button>
              <Button
                href="/#contact-form"
                variant="primary"
                size="md"
                className="bg-[#BC6F07] hover:bg-[#9E5B04] text-white border-none inline-flex items-center gap-2"
              >
                <span>Get in Touch</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

