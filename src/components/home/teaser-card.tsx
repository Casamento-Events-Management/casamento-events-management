'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import type { TeaserVideo } from '@/types';
import { parseVideoSource } from '@/lib/utils/videoUtils';

interface TeaserCardProps {
  teaser: TeaserVideo;
}

// ─── Video Modal (portaled to document.body) ───────────────────────────────────
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  embedUrl?: string;
  directUrl?: string;
  isNative: boolean;
}

function VideoModal({ isOpen, onClose, title, description, embedUrl, directUrl, isNative }: VideoModalProps) {
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const videoSrc = embedUrl || directUrl || '';

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Playing: ${title}`}
    >
      {/* Modal Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-scale"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/60 text-white hover:text-[#BC6F07] hover:bg-black/80 transition-colors cursor-pointer"
          aria-label="Close Video"
        >
          <X size={22} />
        </button>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {isNative ? (
            // Native / Sanity CDN — use <video> tag with autoplay
            <video
              src={directUrl}
              className="w-full h-full"
              controls
              autoPlay
              playsInline
              title={title}
            />
          ) : (
            // YouTube / Vimeo — use iframe embed
            <iframe
              src={videoSrc}
              title={title}
              className="w-full h-full border-0"
              allow="autoplay; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Caption */}
        <div className="px-5 py-4 bg-[#3A4F1C] text-[#F7F3E8]">
          <h4 className="text-base font-serif font-semibold leading-snug">{title}</h4>
          {description && (
            <p className="text-xs text-[#F7F3E8]/75 font-light mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Teaser Card ───────────────────────────────────────────────────────────────
export function TeaserCard({ teaser }: TeaserCardProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const openModal = useCallback(() => setIsOpenModal(true), []);
  const closeModal = useCallback(() => setIsOpenModal(false), []);

  const parsedVideo = parseVideoSource(teaser.video);
  const isNative = parsedVideo.sourceType === 'native' || parsedVideo.sourceType === 'sanity';
  const embedUrl = parsedVideo.embedUrl;
  const directUrl = parsedVideo.directUrl;

  return (
    <>
      {/* Teaser Card */}
      <div className="group flex flex-col justify-between h-full flex-1 w-full bg-white rounded-2xl overflow-hidden border border-[#3A4F1C]/10 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        {/* Poster / Thumbnail */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#2A3A14]">
          <Image
            src={teaser.thumbnail.asset.url || ''}
            alt={teaser.thumbnail.alt || teaser.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

          {/* Play Button Overlay */}
          <button
            onClick={openModal}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            aria-label={`Play teaser video: ${teaser.title}`}
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#BC6F07] text-[#F7F3E8] shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Play size={24} className="ml-1" fill="currentColor" />
            </span>
          </button>
        </div>

        {/* Card Info */}
        <div className="p-6 flex flex-col justify-between flex-1 min-h-[110px]">
          <h3 className="text-lg font-serif font-semibold text-[#3A4F1C] mb-2 line-clamp-1 group-hover:text-[#BC6F07] transition-colors">
            {teaser.title}
          </h3>
          {teaser.description ? (
            <p className="text-sm text-[#3A4F1C]/75 font-light leading-relaxed line-clamp-2">
              {teaser.description}
            </p>
          ) : (
            <p className="text-sm opacity-0 pointer-events-none select-none font-light leading-relaxed line-clamp-2" aria-hidden="true">
              &nbsp;
            </p>
          )}
        </div>
      </div>

      {/* Portaled Video Modal */}
      <VideoModal
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
