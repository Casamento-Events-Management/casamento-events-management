import { client } from '@/sanity/lib/client';
import { articlesHeroMock } from '@/data/articlesHeroMock';
import { articleVlogMockItems } from '@/data/articleVlogMock';
import type { ArticlesHeroContent, ArticleVlogItem, PortfolioCategory } from '@/types';

// Re-export so gallery page only needs one import
export { getPortfolioCategories } from '@/lib/services/portfolioService';

const ITEMS_PER_PAGE = 6;

// ---------------------------------------------------------------------------
// GROQ Queries
// ---------------------------------------------------------------------------

export const GROQ_ARTICLES_HERO = `
  *[_type == "articlesHero" && _id == "articlesHero"][0] {
    _id, _type, _createdAt, _updatedAt, _rev,
    eyebrow,
    title,
    description
  }
`;

/** Lean gallery projection — excludes full `content` portable text for performance */
const GALLERY_PROJECTION = `{
  _id, _type, _createdAt, _updatedAt, _rev,
  title,
  "slug": slug.current,
  "category": category-> {
    "id": _id,
    title,
    "slug": slug.current,
    priority
  },
  mediaType,
  thumbnail {
    "asset": { "_ref": asset._ref, "_type": "reference", "url": asset->url },
    alt,
    priority
  },
  videoSource {
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
  videoDuration,
  readTime,
  summary,
  description,
  socialBacklinks[] { platform, url },
  publishedAt,
  priority
}`;

/** Full projection — includes portable text `content` for detail page */
const DETAIL_PROJECTION = `{
  ${GALLERY_PROJECTION.slice(1, -1)},
  content
}`;

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Fetch the articlesHero singleton.
 * Falls back to local mock if CMS document is missing or fetch fails.
 */
export async function getArticlesHero(): Promise<ArticlesHeroContent> {
  try {
    const data = await client.fetch<ArticlesHeroContent | null>(
      GROQ_ARTICLES_HERO,
      {},
      { next: { revalidate: 3600, tags: ['articlesHero'] } }
    );
    if (data?.eyebrow) return data;
  } catch (err) {
    console.warn('[articleVlogService] Failed to fetch articlesHero:', err);
  }
  return articlesHeroMock;
}

/**
 * Fetch a paginated page of articleVlog items.
 * Default: page 1 = items [0...6]. Supports optional category filter.
 */
export async function getArticleVlogsForGallery(
  categorySlug?: string,
  page = 1
): Promise<ArticleVlogItem[]> {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  const categoryFilter = categorySlug && categorySlug !== 'all'
    ? `&& category->slug.current == $categorySlug`
    : '';

  const query = `
    *[_type == "articleVlog" ${categoryFilter}]
    | order(priority desc, publishedAt desc)
    [${start}...${end}]
    ${GALLERY_PROJECTION}
  `;

  try {
    const data = await client.fetch<ArticleVlogItem[]>(
      query,
      { categorySlug: categorySlug ?? '' },
      { next: { revalidate: 3600, tags: ['articleVlog'] } }
    );
    if (data && data.length > 0) {
      return data.map((item) => ({
        ...item,
        slug: typeof item.slug === 'string' ? { current: item.slug } : item.slug,
      }));
    }
  } catch (err) {
    console.warn('[articleVlogService] Failed to fetch gallery vlogs:', err);
  }

  // Fallback: slice mock data by page
  const filtered = categorySlug && categorySlug !== 'all'
    ? articleVlogMockItems.filter((v) => v.category.slug === categorySlug)
    : articleVlogMockItems;
  return filtered.slice(start, end);
}

/**
 * Fetch total count of articleVlog items (supports category filter).
 * Used to determine whether to show "View More Vlogs" CTA.
 */
export async function getArticleVlogTotalCount(categorySlug?: string): Promise<number> {
  const categoryFilter = categorySlug && categorySlug !== 'all'
    ? `&& category->slug.current == $categorySlug`
    : '';
  const query = `count(*[_type == "articleVlog" ${categoryFilter}])`;
  try {
    return await client.fetch<number>(
      query,
      { categorySlug: categorySlug ?? '' },
      { next: { revalidate: 3600, tags: ['articleVlog'] } }
    );
  } catch {
    const filtered = categorySlug && categorySlug !== 'all'
      ? articleVlogMockItems.filter((v) => v.category.slug === categorySlug)
      : articleVlogMockItems;
    return filtered.length;
  }
}

/**
 * Fetch a single articleVlog by slug — full projection for the detail page.
 */
export async function getArticleVlogBySlug(slug: string): Promise<ArticleVlogItem | null> {
  const query = `*[_type == "articleVlog" && slug.current == $slug][0] ${DETAIL_PROJECTION}`;
  try {
    const data = await client.fetch<ArticleVlogItem | null>(
      query,
      { slug },
      { next: { revalidate: 3600, tags: ['articleVlog'] } }
    );
    if (data) return { ...data, slug: { current: slug } };
  } catch (err) {
    console.warn('[articleVlogService] Failed to fetch vlog by slug:', err);
  }
  return articleVlogMockItems.find((v) => v.slug.current === slug) ?? null;
}

/**
 * Fetch all vlog slugs for generateStaticParams.
 */
export async function getAllArticleVlogSlugs(): Promise<string[]> {
  try {
    return await client.fetch<string[]>(
      `*[_type == "articleVlog"].slug.current`,
      {},
      { next: { revalidate: 3600 } }
    );
  } catch {
    return articleVlogMockItems.map((v) => v.slug.current);
  }
}
