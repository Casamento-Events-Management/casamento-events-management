import { client } from '@/sanity/lib/client';
import { articleBannerMockData } from '@/data/articleBannerMock';
import type { ArticleVlogBanner } from '@/types';

/**
 * GROQ query to retrieve the active Article Vlog Banner.
 */
export const GROQ_ARTICLE_VLOG_BANNER = `
  *[_type == "articleVlogBanner" && isActive == true][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    isActive,
    title,
    description,
    backgroundImage {
      "asset": {
        "_ref": asset._ref,
        "_type": "reference",
        "url": asset->url
      },
      alt,
      priority
    },
    ctaButton {
      label,
      href
    }
  }
`;

/**
 * Service function to retrieve the active Article Vlog Banner.
 * Fetches from Sanity CMS with ISR caching (3600s), falling back to mock data if empty or offline.
 */
export async function getArticleVlogBanner(): Promise<ArticleVlogBanner> {
  try {
    const cmsData = await client.fetch<ArticleVlogBanner | null>(
      GROQ_ARTICLE_VLOG_BANNER,
      {},
      { next: { revalidate: 3600, tags: ['articleVlogBanner'] } }
    );

    if (cmsData && cmsData.backgroundImage?.asset?.url) {
      return cmsData;
    }
  } catch (err) {
    console.warn('[articleBannerService] Failed to fetch articleVlogBanner from Sanity, using mock fallback:', err);
  }

  return articleBannerMockData;
}
