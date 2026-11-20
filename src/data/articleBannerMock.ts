import type { ArticleVlogBanner } from '@/types';

export const articleBannerMockData: ArticleVlogBanner = {
  _id: 'articleVlogBanner',
  _type: 'articleVlogBanner',
  _createdAt: new Date().toISOString(),
  _updatedAt: new Date().toISOString(),
  _rev: 'mock-rev',
  title: 'Casamento Editorial Journal & Event Production Vlogs',
  description: 'Behind-the-scenes production insights, corporate activation strategies, styling guides, and event management highlights across the Philippines.',
  backgroundImage: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-mock-article-banner-1920x1080',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
    },
    alt: 'Casamento Events full-service event production and styling showcase banner',
    priority: 100,
  },
  ctaButton: {
    label: 'Explore Vlogs & Articles',
    href: '#vlog-gallery',
  },
};
