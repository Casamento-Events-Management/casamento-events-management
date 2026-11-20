// =============================================================================
// lib/utils/securityUtils.ts — Centralized Security Sanitization & Validation Helpers
// =============================================================================

/**
 * Safely serializes an object for embedding inside `<script type="application/ld+json">`.
 * Escapes HTML-significant characters (`<`, `>`, `&`, line/paragraph separators) so
 * untrusted strings cannot break out of the script element (Stored XSS prevention).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Escapes HTML special characters for safe interpolation into HTML email templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * RFC 4180 CSV cell encoder with spreadsheet formula-injection neutralization
 * (prefixes leading `=`, `+`, `-`, `@`, tab, or CR with a single quote).
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Sanitizes a user search string before interpolation into a PostgREST `.or()` filter.
 * Strips PostgREST expression delimiters (`,`, `(`, `)`, `*`, `\`, `%`, `"`, `'`).
 */
export function sanitizePostgrestSearch(input: string): string {
  return input
    .trim()
    .replace(/[,()*\\"'%]/g, '')
    .slice(0, 120);
}

/**
 * Validates that a booking reference contains only safe alphanumeric and hyphen characters.
 */
export function isValidBookingReference(ref: string): boolean {
  return /^[A-Za-z0-9-]{3,40}$/.test(ref.trim());
}

/**
 * Returns the canonical trusted base site URL derived strictly from server environment
 * configuration rather than trusting arbitrary incoming `Host` or `X-Forwarded-Host` headers.
 */
export function getTrustedSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return `${parsed.protocol}//${parsed.host}`;
      }
    } catch {
      // Fall through to Vercel URL or localhost fallback
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const cleanHost = vercelUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return `https://${cleanHost}`;
  }

  return 'http://localhost:3000';
}

/**
 * Strictly validates an internal admin redirect path.
 * Prevents open redirects, protocol-relative URLs (`//evil.com`), and backslash bypasses (`/\evil.com`).
 */
export function isSafeAdminRedirectPath(path?: string | null): path is string {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('//') || path.includes('\\') || /[\r\n]/.test(path)) return false;
  return /^\/admin(\/[a-zA-Z0-9._~/-]*)?(\?[a-zA-Z0-9._~=&%-]*)?$/.test(path);
}

/**
 * Validates an external or internal link href to block `javascript:`, `data:`, and `vbscript:` URIs.
 */
export function sanitizeHref(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '#';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  if (trimmed.startsWith('#')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'mailto:' ||
      parsed.protocol === 'tel:'
    ) {
      return trimmed;
    }
  } catch {
    return '#';
  }

  return '#';
}

/**
 * Validates that an iframe video embed URL points strictly to an allowed HTTPS video provider.
 */
const ALLOWED_VIDEO_EMBED_HOSTS = new Set([
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com',
]);

export function sanitizeVideoEmbedUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:') return null;
    if (!ALLOWED_VIDEO_EMBED_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Verifies image file magic bytes against the declared MIME type (JPEG, PNG, WebP).
 */
export function validateImageMagicBytes(buffer: Buffer, declaredMime: string): boolean {
  if (buffer.length < 12) return false;

  switch (declaredMime) {
    case 'image/jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    case 'image/webp':
      return (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    default:
      return false;
  }
}
