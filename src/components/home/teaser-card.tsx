'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import type { TeaserVideo } from '@/types';

interface TeaserCardProps {
  teaser: TeaserVideo;
}

export function TeaserCard({ teaser }: TeaserCardProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const isExternal = teaser.video._type === 'external';
  const videoUrl =
    teaser.video._type === 'external'
      ? teaser.video.url
      : (teaser.video.asset.url || '');

  return (
    <>
      <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#3A4F1C]/10 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        {/* Poster Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#2A3A14]">
          <Image
            src={teaser.thumbnail.asset.url || ''}
            alt={teaser.thumbnail.alt || teaser.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

          {/* Click to Play Button Overlay */}
          <button
            onClick={() => setIsOpenModal(true)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            aria-label={`Play teaser video: ${teaser.title}`}
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#BC6F07] text-[#F7F3E8] shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Play size={24} className="ml-1" fill="currentColor" />
            </span>
          </button>
        </div>

        {/* Card Info */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-lg font-serif font-semibold text-[#3A4F1C] mb-2 line-clamp-1 group-hover:text-[#BC6F07] transition-colors">
            {teaser.title}
          </h3>
          {teaser.description && (
            <p className="text-sm text-[#3A4F1C]/75 font-light leading-relaxed line-clamp-2">
              {teaser.description}
            </p>
          )}
        </div>
      </div>

      {/* Video Playback Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            {/* Close Button */}
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:text-[#BC6F07] hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Close Video"
            >
              <X size={24} />
            </button>

            {/* Video Player */}
            <div className="relative aspect-video w-full">
              {isExternal ? (
                <iframe
                  src={videoUrl}
                  title={teaser.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Caption */}
            <div className="p-4 bg-[#3A4F1C] text-[#F7F3E8]">
              <h4 className="text-base font-serif font-medium">{teaser.title}</h4>
              {teaser.description && (
                <p className="text-xs text-[#F7F3E8]/80 font-light mt-1">
                  {teaser.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
