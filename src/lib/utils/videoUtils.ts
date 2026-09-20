import type { VideoSource } from '@/types';

export interface ParsedVideoInfo {
  sourceType: 'sanity' | 'external' | 'native';
  embedUrl?: string;
  directUrl?: string;
  provider?: 'youtube' | 'vimeo' | 'cloudflare' | 'sanity' | 'unknown';
}

/**
 * Normalizes YouTube video URLs (watch?v=, youtu.be/, embed/) into privacy-enhanced embed URLs.
 */
export function toYouTubeEmbedUrl(rawUrl: string, autoplay = true): string {
  if (!rawUrl) return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&rel=0';

  let videoId = '';
  if (rawUrl.includes('embed/')) {
    videoId = rawUrl.split('embed/')[1]?.split('?')[0] ?? '';
  } else if (rawUrl.includes('watch?v=')) {
    videoId = rawUrl.split('watch?v=')[1]?.split('&')[0] ?? '';
  } else if (rawUrl.includes('youtu.be/')) {
    videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0] ?? '';
  }

  if (!videoId) return rawUrl;

  const autoParam = autoplay ? '1' : '0';
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoParam}&controls=1&rel=0&modestbranding=1`;
}

/**
 * Normalizes Vimeo video URLs (player.vimeo.com/video/ or vimeo.com/) into embed URLs.
 */
export function toVimeoEmbedUrl(rawUrl: string, autoplay = true): string {
  if (!rawUrl) return rawUrl;

  let videoId = '';
  if (rawUrl.includes('player.vimeo.com/video/')) {
    videoId = rawUrl.split('player.vimeo.com/video/')[1]?.split('?')[0] ?? '';
  } else if (rawUrl.includes('vimeo.com/')) {
    videoId = rawUrl.split('vimeo.com/')[1]?.split('?')[0] ?? '';
  }

  if (!videoId) return rawUrl;

  const autoParam = autoplay ? '1' : '0';
  return `https://player.vimeo.com/video/${videoId}?autoplay=${autoParam}&color=BC6F07`;
}

/**
 * Parses any `VideoSource` (Sanity CDN asset or external link) into a normalized video object.
 */
export function parseVideoSource(source?: VideoSource | null): ParsedVideoInfo {
  if (!source) {
    return { sourceType: 'native', directUrl: '' };
  }

  const rawObj = source as unknown as Record<string, unknown>;
  const assetUrl = (typeof rawObj.asset === 'object' && rawObj.asset !== null && 'url' in rawObj.asset ? (rawObj.asset as { url?: string }).url : undefined) || (rawObj.assetUrl as string) || '';
  const rawUrl = (rawObj.url as string) || assetUrl || '';
  const rawType = (rawObj.sourceType as string) || (rawObj._type as string);

  // 1. Sanity CDN video file asset (if assetUrl exists or rawType === 'sanity')
  if (assetUrl || rawType === 'sanity' || rawObj._type === 'sanity') {
    return {
      sourceType: 'sanity',
      directUrl: assetUrl || rawUrl,
      provider: 'sanity',
    };
  }

  // 2. Direct MP4 / WebM / MOV file URL
  if (
    rawUrl.endsWith('.mp4') ||
    rawUrl.endsWith('.webm') ||
    rawUrl.endsWith('.mov') ||
    rawUrl.includes('.mp4?') ||
    rawUrl.includes('gtv-videos-bucket')
  ) {
    return {
      sourceType: 'native',
      directUrl: rawUrl,
      provider: 'sanity',
    };
  }

  // 3. YouTube Embed
  if (
    rawUrl.includes('youtube.com') ||
    rawUrl.includes('youtu.be') ||
    rawUrl.includes('youtube-nocookie.com')
  ) {
    return {
      sourceType: 'external',
      embedUrl: toYouTubeEmbedUrl(rawUrl),
      provider: 'youtube',
    };
  }

  // 4. Vimeo Embed
  if (rawUrl.includes('vimeo.com')) {
    return {
      sourceType: 'external',
      embedUrl: toVimeoEmbedUrl(rawUrl),
      provider: 'vimeo',
    };
  }

  // Fallback: external or native
  if (rawType === 'external') {
    return {
      sourceType: 'external',
      embedUrl: rawUrl,
      provider: (rawObj.provider as ParsedVideoInfo['provider']) || 'unknown',
    };
  }

  return {
    sourceType: 'native',
    directUrl: rawUrl,
  };
}
