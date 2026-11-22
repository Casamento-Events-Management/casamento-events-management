// =============================================================================
// data/aboutMock.ts — About Us Seed & Fallback Content
//
// Canonical content migrated from the original static `/about` page.
// Used as the seed payload for `scripts/seeders/seedAboutUsPage.ts` and as a
// resilient fallback in `src/lib/services/aboutService.ts`.
// =============================================================================

import type {
  AboutCoreValuesContent,
  AboutCtaContent,
  AboutHeroContent,
  AboutMissionVisionContent,
  AboutPageContent,
  AboutStoryContent,
  AboutWhyChooseContent,
} from '@/types';

export const ABOUT_HERO_MOCK: AboutHeroContent = {
  eyebrow: 'About Us',
  title: 'Our Story: A Legacy Born from Love',
  description:
    '“Casamento” is the Portuguese word for “wedding”—a name rooted in a deeply personal story of love, family, and purpose.',
};

export const ABOUT_STORY_MOCK: AboutStoryContent = {
  paragraphs: [
    'The founders dreamed of organizing their parents’ renewal of vows and witnessing them walk down the aisle together for the first time. When their father passed away from cancer before that dream could be fulfilled, their loss became a meaningful mission: to help other people celebrate life, honor love, and create memories that will endure for generations.',
    'From that beautiful yet bittersweet story, Casamento Events Management was born.',
    'For over 14 years, Casamento has helped individuals, families, companies, and brands bring their visions to life. From intimate gatherings to major productions and nationwide campaigns, we approach every project with creativity, precision, professionalism, and genuine care.',
    'Today, Casamento has grown beyond traditional event management. We have evolved into a full-service events, creative, and production company offering social and corporate event management, creative production, event styling, digital advertising, livestreaming, and e-commerce production management.',
  ],
  closingStatement:
    'While our capabilities continue to expand, the heart of our company remains unchanged.',
  mantras: [
    'We create with purpose.',
    'We produce with passion.',
    'We celebrate every story.',
  ],
};

export const ABOUT_MISSION_VISION_MOCK: AboutMissionVisionContent = {
  eyebrow: 'Our North Star',
  title: 'Mission & Vision',
  description: 'Guiding every concept, production, and celebration we deliver.',
  mission: {
    title: 'Mission',
    description:
      'To transform our clients’ ideas into meaningful and memorable experiences through creative thinking, thoughtful planning, innovative production, and dependable execution.',
    icon: 'Target',
  },
  vision: {
    title: 'Vision',
    description:
      'To become one of the Philippines’ most trusted and forward-thinking events and production companies—recognized for creating experiences that connect people, strengthen brands, and leave lasting memories.',
    icon: 'Eye',
  },
};

export const ABOUT_CORE_VALUES_MOCK: AboutCoreValuesContent = {
  eyebrow: 'Our Foundation',
  title: 'Our Core Values',
  description:
    'The guiding principles that shape how we work, create, and build lasting relationships.',
  items: [
    {
      title: 'LOVE',
      description:
        'We believe the most unforgettable experiences begin with genuine care—for our clients, our team, and the stories entrusted to us.',
      icon: 'Heart',
    },
    {
      title: 'CREATIVITY',
      description:
        'We continuously develop fresh concepts and tailored solutions that make every celebration and production distinctive.',
      icon: 'Sparkles',
    },
    {
      title: 'EXCELLENCE',
      description:
        'We pursue quality in every detail, from planning and preparation to execution and completion.',
      icon: 'Award',
    },
    {
      title: 'INTEGRITY',
      description:
        'We build lasting relationships through transparency, accountability, fairness, and respect.',
      icon: 'ShieldCheck',
    },
    {
      title: 'RESILIENCE',
      description:
        'We face every challenge with determination, adaptability, and a commitment to deliver.',
      icon: 'Flame',
    },
    {
      title: 'COLLABORATION',
      description:
        'We believe the best results come from working closely with clients, partners, suppliers, and our production team.',
      icon: 'Users',
    },
  ],
};

export const ABOUT_WHY_CHOOSE_MOCK: AboutWhyChooseContent = {
  eyebrow: 'The Casamento Distinction',
  title: 'Why Choose Casamento?',
  description:
    'From deep family roots to comprehensive nationwide production, discover what sets us apart.',
  items: [
    {
      title: '14 Years of Experience',
      description:
        'More than a decade of planning, producing, and managing meaningful events and brand experiences.',
      icon: 'Clock3',
    },
    {
      title: 'Complete Event and Production Solutions',
      description:
        'One dependable team for planning, creative direction, styling, technical production, livestreaming, and on-ground management.',
      icon: 'Layers3',
    },
    {
      title: 'Customized Concepts',
      description:
        'Every event is thoughtfully developed around the client’s story, objectives, audience, and working budget.',
      icon: 'Lightbulb',
    },
    {
      title: 'Experienced Production Team',
      description:
        'Our team understands the demands of live events, large-scale roadshows, corporate programs, and digital broadcasts.',
      icon: 'Video',
    },
    {
      title: 'Nationwide Capability',
      description:
        'We are equipped to manage events and productions across Luzon, Visayas, and Mindanao.',
      icon: 'MapPin',
    },
    {
      title: 'Heart in Every Detail',
      description:
        'Casamento was founded on a meaningful family story. That same heart continues to guide how we care for every client and every project.',
      icon: 'Handshake',
    },
  ],
};

export const ABOUT_CTA_MOCK: AboutCtaContent = {
  eyebrow: 'Begin Your Journey',
  title: 'Ready to Celebrate Your Story?',
  description:
    'From intimate celebrations to grand nationwide productions, our team brings heart, precision, and purpose to every detail.',
  secondaryCtaText: 'Explore Services',
  secondaryCtaLink: '/services',
  primaryCtaText: 'Get in Touch',
  primaryCtaLink: '#contact-form',
};

export const ABOUT_PAGE_MOCK: AboutPageContent = {
  hero: ABOUT_HERO_MOCK,
  story: ABOUT_STORY_MOCK,
  missionVision: ABOUT_MISSION_VISION_MOCK,
  coreValues: ABOUT_CORE_VALUES_MOCK,
  whyChoose: ABOUT_WHY_CHOOSE_MOCK,
  cta: ABOUT_CTA_MOCK,
};
