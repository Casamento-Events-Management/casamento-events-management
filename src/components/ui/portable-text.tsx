'use client';

import React from 'react';
import { PortableText, type PortableTextComponents } from 'next-sanity';
import { urlFor } from '@/sanity/lib/image';

interface CustomPortableTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any[];
  className?: string;
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
      const url: string = value.url;
      let embedUrl = url;

      const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
      if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;

      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;

      return (
        <figure className="my-8">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A2310]">
            <iframe
              src={embedUrl}
              title={value.caption || 'Embedded video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
            />
          </div>
          {value.caption && (
            <figcaption className="text-xs text-center text-[#3A4F1C]/60 mt-2 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
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
        <figure className="my-8">
          <div className="rounded-xl overflow-hidden bg-[#1A2310]">
            <video
              controls
              preload="metadata"
              className="w-full h-auto block"
              playsInline
            >
              <source src={cdnUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {value.caption && (
            <figcaption className="text-xs text-center text-[#3A4F1C]/60 mt-2 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    videoSource: ({ value }) => {
      if (!value) return null;

      // Sanity CDN direct file upload
      if (value.sourceType === 'sanity' && value.asset?.asset?._ref) {
        const assetRef: string = value.asset.asset._ref;
        const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
        const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
        const refParts = assetRef.replace('file-', '').split('-');
        const ext = refParts.pop();
        const id = refParts.join('-');
        const cdnUrl = `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;

        return (
          <div className="my-8 rounded-xl overflow-hidden bg-[#1A2310]">
            <video
              controls
              preload="metadata"
              className="w-full h-auto block"
              playsInline
            >
              <source src={cdnUrl} type={value.mimeType || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      // External provider: YouTube, Vimeo, Cloudflare Stream
      if (value.sourceType === 'external' && value.url) {
        const url: string = value.url;
        let embedUrl = url;

        const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
        if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;

        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;

        return (
          <div className="my-8 relative w-full aspect-video rounded-xl overflow-hidden bg-[#1A2310]">
            <iframe
              src={embedUrl}
              title="Embedded video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
            />
          </div>
        );
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
