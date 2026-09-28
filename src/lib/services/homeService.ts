import { client } from '@/sanity/lib/client';
import { homeMockData } from '@/data/homeMock';
import type { FeaturedTeaserContent, HomeHeroContent, HomePageContent } from '@/types';

/**
 * GROQ Query targeting the `homeHero` singleton document.
 */
export const GROQ_HOME_HERO = `
  *[_type in ["homeHero", "homePage"]][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    hero {
      autoPlayInterval,
      slides[] {
        _key,
        heading,
        description,
        ctaText,
        ctaLink,
        mediaType,
        "serviceCategorySlug": serviceCategory->slug.current,
        image {
          "asset": {
            "url": asset->url
          },
          alt,
          priority
        },
        video {
          "sourceType": select(
            defined(asset) => "sanity",
            defined(sourceType) => sourceType,
            "external"
          ),
          url,
          provider,
          mimeType,
          "asset": {
            "_ref": coalesce(asset.asset._ref, asset._ref),
            "_type": "reference",
            "url": coalesce(asset.asset->url, asset->url)
          }
        },
        videoPoster {
          "asset": {
            "url": asset->url
          },
          alt,
          priority
        }
      }
    },
    partners[] | order(priority desc) {
      _key,
      name,
      url,
      priority,
      logo {
        "asset": {
          "url": asset->url
        },
        alt
      }
    }
  }
`;

/**
 * GROQ Query targeting the `featuredTeaser` singleton document.
 */
export const GROQ_FEATURED_TEASER = `
  *[_type in ["featuredTeaser", "homePage"]][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    teaserVideosEyebrow,
    teaserVideosTitle,
    teaserVideosDescription,
    "eyebrow": coalesce(eyebrow, teaserVideosEyebrow),
    "title": coalesce(title, teaserVideosTitle),
    "description": coalesce(description, teaserVideosDescription),
    teaserVideos[] | order(priority desc) {
      _key,
      title,
      description,
      priority,
      video {
        "sourceType": select(
          defined(asset) => "sanity",
          defined(sourceType) => sourceType,
          "external"
        ),
        url,
        provider,
        mimeType,
        "asset": {
          "_ref": coalesce(asset.asset._ref, asset._ref),
          "_type": "reference",
          "url": coalesce(asset.asset->url, asset->url)
        }
      },
      thumbnail {
        "asset": {
          "url": asset->url
        },
        alt,
        priority
      }
    }
  }
`;

/**
 * Service function to retrieve Home Page Hero & Partners content.
 */
export async function getHomeHeroContent(): Promise<HomeHeroContent> {
  try {
    const cmsData = await client.fetch<HomeHeroContent | null>(
      GROQ_HOME_HERO,
      {},
      { next: { revalidate: 3600, tags: ['homeHero'] } }
    );

    if (cmsData && cmsData.hero) {
      return {
        ...cmsData,
        partners: cmsData.partners || [],
      };
    }
  } catch (err) {
    console.warn('[homeService] Failed to fetch homeHero from Sanity, using mock data fallback:', err);
  }

  return {
    _id: homeMockData._id,
    _type: 'homeHero',
    _createdAt: homeMockData._createdAt,
    _updatedAt: homeMockData._updatedAt,
    hero: homeMockData.hero,
    partners: homeMockData.partners,
  };
}

/**
 * Service function to retrieve Featured Teaser content.
 */
export async function getFeaturedTeaserContent(): Promise<FeaturedTeaserContent> {
  try {
    const cmsData = await client.fetch<FeaturedTeaserContent | null>(
      GROQ_FEATURED_TEASER,
      {},
      { next: { revalidate: 3600, tags: ['featuredTeaser'] } }
    );

    if (cmsData && cmsData.teaserVideos) {
      return {
        ...cmsData,
        teaserVideosEyebrow: cmsData.teaserVideosEyebrow || cmsData.eyebrow || 'Visual Stories',
        teaserVideosTitle: cmsData.teaserVideosTitle || cmsData.title || 'Featured Teaser Highlights',
        teaserVideosDescription: cmsData.teaserVideosDescription || cmsData.description || 'Experience the emotional intensity and cinematic splendor of our handcrafted celebrations.',
        teaserVideos: cmsData.teaserVideos || [],
      };
    }
  } catch (err) {
    console.warn('[homeService] Failed to fetch featuredTeaser from Sanity, using mock data fallback:', err);
  }

  return {
    _id: homeMockData._id,
    _type: 'featuredTeaser',
    _createdAt: homeMockData._createdAt,
    _updatedAt: homeMockData._updatedAt,
    teaserVideosEyebrow: homeMockData.teaserVideosEyebrow,
    teaserVideosTitle: homeMockData.teaserVideosTitle,
    teaserVideosDescription: homeMockData.teaserVideosDescription,
    teaserVideos: homeMockData.teaserVideos,
  };
}

/**
 * Composite legacy helper function for backward compatibility.
 */
export async function getHomePageContent(): Promise<HomePageContent> {
  const [heroContent, teaserContent] = await Promise.all([
    getHomeHeroContent(),
    getFeaturedTeaserContent(),
  ]);

  return {
    _id: heroContent._id,
    _type: 'homePage',
    _createdAt: heroContent._createdAt,
    _updatedAt: heroContent._updatedAt,
    hero: heroContent.hero,
    teaserVideosEyebrow: teaserContent.teaserVideosEyebrow,
    teaserVideosTitle: teaserContent.teaserVideosTitle,
    teaserVideosDescription: teaserContent.teaserVideosDescription,
    teaserVideos: teaserContent.teaserVideos,
    partners: heroContent.partners,
  };
}
