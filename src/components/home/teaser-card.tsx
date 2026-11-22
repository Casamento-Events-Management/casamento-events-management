'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Play } from 'lucide-react';
import type { TeaserVideo } from '@/types';
import { parseVideoSource } from '@/lib/utils/videoUtils';
import { TeaserMediaModal } from './teaser-media-modal';

interface TeaserCardProps {
  teaser: TeaserVideo;
}

export function TeaserCard({ teaser }: TeaserCardProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const openModal = useCallback(() => setIsOpenModal(true), []);
  const closeModal = useCallback(() => setIsOpenModal(false), []);

  const parsedVideo = parseVideoSource(teaser.video);
  const isNative = parsedVideo.sourceType === 'native' || parsedVideo.sourceType === 'sanity';
  const embedUrl = parsedVideo.embedUrl;
  const directUrl = parsedVideo.directUrl;
  const thumbnailUrl = teaser.thumbnail?.asset?.url || '';

  return (
    <>
      <article className="h-full w-full flex flex-col">
        <button
          type="button"
          onClick={openModal}
          aria-label={`Play highlight video: ${teaser.title}`}
          className="group flex flex-col h-full w-full text-left rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#3A4F1C]/12 hover:border-[#BC6F07]/60 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFEAD8]"
        >
          {/* Poster / Thumbnail Frame — intentionally zero hover zoom */}
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#2A3A14]">
            {thumbnailUrl && (
              <Image
                src={thumbnailUrl}
                alt={teaser.thumbnail.alt || teaser.title}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 75vw, 50vw"
                className="object-cover"
              />
            )}

            {/* Subtle editorial scrim — deepens gently on hover without zooming */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E2810]/65 via-[#1E2810]/10 to-transparent group-hover:from-[#1E2810]/75 transition-colors duration-200" />

            {/* Compact corner play indicator keeps focal photography unobstructed */}
            <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A3A14]/90 group-hover:bg-[#BC6F07] text-[#F7F3E8] border border-[#F7F3E8]/20 group-hover:border-[#BC6F07] text-[11px] font-medium tracking-[0.14em] uppercase transition-colors duration-200">
              <Play
                className="w-3.5 h-3.5 fill-current shrink-0"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span>Watch</span>
            </span>
          </div>

          {/* Editorial Card Body */}
          <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-2 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base sm:text-lg font-medium tracking-tight text-[#3A4F1C] group-hover:text-[#BC6F07] transition-colors duration-200 line-clamp-1">
                {teaser.title}
              </h3>
              <ArrowUpRight
                className="w-4 h-4 shrink-0 mt-1 text-[#3A4F1C]/45 group-hover:text-[#BC6F07] transition-colors duration-200"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>

            {teaser.description && (
              <p className="text-xs sm:text-sm text-[#3A4F1C]/75 font-light leading-relaxed line-clamp-2">
                {teaser.description}
              </p>
            )}
          </div>
        </button>
      </article>

      <TeaserMediaModal
        isOpen={isOpenModal}
        onClose={closeModal}
        title={teaser.title}
        description={teaser.description}
        embedUrl={embedUrl}
        directUrl={directUrl}
        isNative={isNative}
      />
    </>
  );
}
