import { client } from '@/sanity/lib/client';
import { homeMockData } from '@/data/homeMock';
import type { HomePageContent } from '@/types';

/**
 * GROQ Query targeting the `homePage` singleton document.
 * Projects resolved image URLs (`asset->url`) and normalizes `sourceType` for video fields.
 */
export const GROQ_HOME_PAGE = `
  *[_type == "homePage"][0] {
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
    },
    upcomingEvents[] | order(priority desc) {
      _key,
      title,
      slug,
      slug,
      date,
      location,
      status,
      priority,
      coverImage {
        "asset": {
          "url": asset->url
        },
        alt
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
    },
    socialLinks[] {
      _key,
      platform,
      url
    }
  }
`;

/**
 * Service module for retrieving Home Page content.
 * Queries Sanity CMS via GROQ with ISR caching (revalidate: 3600),
 * falling back to local mock data if the CMS query is empty or fails.
 */
export async function getHomePageContent(): Promise<HomePageContent> {
  try {
    const cmsData = await client.fetch<HomePageContent | null>(
      GROQ_HOME_PAGE,
      {},
      { next: { revalidate: 3600, tags: ['homePage'] } }
    );

    if (cmsData && cmsData.hero) {
      // Return populated CMS document
      return {
        ...cmsData,
        teaserVideos: cmsData.teaserVideos || [],
        upcomingEvents: cmsData.upcomingEvents || [],
        partners: cmsData.partners || [],
        socialLinks: cmsData.socialLinks || [],
      };
    }
  } catch (err) {
    console.warn('[homeService] Failed to fetch homePage from Sanity, using mock data fallback:', err);
  }

  // Fallback to local mock data if CMS content is not found or fetch fails
  const mockData: HomePageContent = JSON.parse(JSON.stringify(homeMockData));
  mockData.teaserVideos.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  mockData.upcomingEvents.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  mockData.partners.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return mockData;
}

