'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { PortableText, type PortableTextComponents } from 'next-sanity';
import { urlFor } from '@/sanity/lib/image';

interface CustomPortableTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any[];
  className?: string;
}

/**
 * Click-to-Play YouTube / Vimeo Embed component following workspace Rule 2:
 * 1. Automatically uses YouTube high-res thumbnail.
 * 2. No heavy iframe script loading until user clicks play.
 * 3. Zero impact on initial page load / LCP.
 */
function ClickToPlayVideoEmbed({
  url,
  caption,
}: {
  url: string;
  caption?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  let embedUrl = url;
  let thumbnailSrc = '';

  // Auto-extract YouTube video ID and high-res thumbnail
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) {
    const videoId = ytMatch[1];
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    thumbnailSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }

  if (isPlaying) {
    return (
      <figure className="my-8">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A2310] shadow-lg">
          <iframe
            src={embedUrl}
            title={caption || 'Embedded video player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
        {caption && (
          <figcaption className="text-xs text-center text-[#3A4F1C]/60 mt-2 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="my-8">
      <div
        onClick={() => setIsPlaying(true)}
        className="group relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A2310] cursor-pointer shadow-md transition-all duration-300 hover:shadow-xl"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsPlaying(true)}
        aria-label={`Play embedded video: ${caption || 'Video'}`}
      >
        {thumbnailSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbnailSrc}
            alt={caption || 'Video thumbnail poster'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A2310] via-[#2A3818] to-[#1A2310] flex items-center justify-center text-white/40" />
        )}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Signature Casamento Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#BC6F07]/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#BC6F07] transition-all duration-300">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className="text-xs text-center text-[#3A4F1C]/60 mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Uploaded Video File component:
 * Uses HTML5 <video controls preload="metadata" poster={posterUrl}>.
 * - preload="metadata" ensures zero video binary download until user hits play.
 * - poster attribute displays the poster thumbnail image provided in Sanity.
 */
function NativeUploadedVideoFile({
  cdnUrl,
  caption,
  posterValue,
  mimeType = 'video/mp4',
}: {
  cdnUrl: string;
  caption?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posterValue?: any;
  mimeType?: string;
}) {
  let posterUrl = '';
  if (posterValue?.asset) {
    try {
      posterUrl = urlFor(posterValue).url();
    } catch {
      posterUrl = posterValue.asset?.url || '';
    }
  }

  return (
    <figure className="my-8">
      <div className="rounded-xl overflow-hidden bg-[#1A2310] shadow-lg">
        <video
          controls
          preload="metadata"
          poster={posterUrl || undefined}
          className="w-full h-auto block"
          playsInline
        >
          <source src={cdnUrl} type={mimeType} />
          Your browser does not support the video tag.
        </video>
      </div>
      {caption && (
        <figcaption className="text-xs text-center text-[#3A4F1C]/60 mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-3xl sm:text-4xl font-serif text-[#3A4F1C] font-semibold mt-8 mb-4 tracking-tight leading-snug">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl sm:text-3xl font-serif text-[#3A4F1C] font-semibold mt-8 mb-4 tracking-tight leading-snug">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl sm:text-2xl font-serif text-[#3A4F1C] font-semibold mt-6 mb-3 tracking-tight leading-snug">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-serif text-[#3A4F1C] font-semibold mt-4 mb-2">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-base text-[#3A4F1C]/85 font-light leading-relaxed mb-6">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[#BC6F07] pl-5 py-2 my-6 italic text-[#3A4F1C]/90 font-serif text-lg bg-[#EFEAD8]/40 rounded-r-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-base text-[#3A4F1C]/85 font-light pl-2">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-base text-[#3A4F1C]/85 font-light pl-2">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-[#3A4F1C]">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded bg-[#3A4F1C]/10 text-[#3A4F1C] text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = value?.href || '#';
      const isExternal = href.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#BC6F07] underline underline-offset-4 hover:text-[#3A4F1C] transition-colors"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      let imageUrl = '';
      try {
        imageUrl = urlFor(value).url();
      } catch {
        imageUrl = value.asset?.url || '';
      }

      if (!imageUrl) return null;

      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={value.alt || 'Article embedded image'}
            className="w-full h-auto rounded-xl block"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="text-xs text-center text-[#3A4F1C]/60 mt-2 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    videoEmbed: ({ value }) => {
      if (!value?.url) return null;
      return (
        <ClickToPlayVideoEmbed
          url={value.url}
          caption={value.caption}
        />
      );
    },
    videoFile: ({ value }) => {
      if (!value) return null;

      let cdnUrl = '';
      const assetRef: string = value.asset?.asset?._ref || value.asset?._ref || '';

      if (assetRef) {
        const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
        const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
        const refParts = assetRef.replace('file-', '').split('-');
        const ext = refParts.pop();
        const id = refParts.join('-');
        cdnUrl = `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;
      } else if (value.asset?.url) {
        cdnUrl = value.asset.url;
      }

      if (!cdnUrl) return null;

      return (
        <NativeUploadedVideoFile
          cdnUrl={cdnUrl}
          caption={value.caption}
          posterValue={value.poster}
        />
      );
    },
    videoSource: ({ value }) => {
      if (!value) return null;

      if (value.sourceType === 'sanity' && value.asset?.asset?._ref) {
        const assetRef: string = value.asset.asset._ref;
        const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
        const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
        const refParts = assetRef.replace('file-', '').split('-');
        const ext = refParts.pop();
        const id = refParts.join('-');
        const cdnUrl = `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;

        return (
          <NativeUploadedVideoFile
            cdnUrl={cdnUrl}
            mimeType={value.mimeType || 'video/mp4'}
          />
        );
      }

      if (value.sourceType === 'external' && value.url) {
        return <ClickToPlayVideoEmbed url={value.url} />;
      }

      return null;
    },
  },
};

export function CustomPortableText({ value, className = '' }: CustomPortableTextProps) {
  if (!value || !Array.isArray(value) || value.length === 0) return null;

  return (
    <div className={`portable-text-content max-w-none ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
