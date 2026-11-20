// =============================================================================
// lib/utils/seoUtils.ts — Centralized SEO Metadata, Canonical & Schema Helpers
// =============================================================================

export const SITE_NAME = 'Casamento Events Management';
export const SITE_LEGAL_NAME = 'Casamento Events Management Inc.';
export const SITE_EMAIL = 'hello@casamentoevents.com';
export const SITE_PHONE = '+63 956 274 2962';
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image';
export const DEFAULT_OG_IMAGE_ALT =
  'Casamento Events Management — Full-Service Event Planning & Production Philippines';

/**
 * Returns the canonical public base URL with trailing slashes stripped.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://casamentoevents.com';
  return raw.replace(/\/+$/, '');
}

/**
 * Returns true unless NEXT_PUBLIC_ALLOW_INDEXING is explicitly set to 'false'.
 */
export function isIndexingAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';
}

/**
 * Builds an absolute canonical URL for any route path (e.g. '/services' -> 'https://casamentoevents.com/services').
 */
export function buildCanonicalUrl(path = ''): string {
  const baseUrl = getSiteUrl();
  if (!path || path === '/') return baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export interface OgImageDescriptor {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Builds a consistent OpenGraph/Twitter image array with a landscape 1200x630 fallback.
 */
export function buildOpenGraphImages(
  imageUrl?: string | null,
  alt = DEFAULT_OG_IMAGE_ALT,
  width = 1200,
  height = 630
): OgImageDescriptor[] {
  const cleanUrl = imageUrl?.trim();
  if (cleanUrl) {
    return [{ url: cleanUrl, width, height, alt }];
  }
  return [
    {
      url: buildCanonicalUrl(DEFAULT_OG_IMAGE_PATH),
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

export interface BreadcrumbItemInput {
  name: string;
  path: string;
}

/**
 * Generates a schema.org BreadcrumbList JSON-LD object.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItemInput[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

/**
 * Normalizes a date string (YYYY-MM-DD or ISO-8601) into an ISO-8601 timestamp string
 * acceptable by Google Rich Results (VideoObject.uploadDate, Article.datePublished).
 */
export function toIsoDateString(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

/**
 * Converts human-readable duration strings (e.g. "06:45" or "1:05:20") into ISO-8601 duration ("PT6M45S").
 */
export function toIsoDuration(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^PT(?:\d+H)?(?:\d+M)?(?:\d+S)?$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const parts = trimmed.split(':').map((part) => Number.parseInt(part, 10));
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return undefined;

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return `PT${minutes}M${seconds}S`;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return `PT${hours}H${minutes}M${seconds}S`;
  }
  return undefined;
}
