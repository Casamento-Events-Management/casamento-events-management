'use client';

import React, { useEffect, useId, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Calendar,
  MapPin,
  User,
  Tag,
  Sparkles,
  Film,
  Image as ImageIcon,
} from 'lucide-react';
import { formatDisplayDate } from '@/lib/utils/dateUtils';

export interface MediaLightboxImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface MediaLightboxVideo {
  isNative: boolean;
  directUrl?: string;
  embedUrl?: string;
  mimeType?: string;
  posterUrl?: string;
}

export interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'video' | 'image';
  title: string;
  badgeLabel: string;
  isFeatured?: boolean;
  featuredLabel?: string;
  description?: string;
  image?: MediaLightboxImage;
  video?: MediaLightboxVideo;
  clientName?: string;
  location?: string;
  eventDate?: string;
  tags?: string[];
  headerActions?: React.ReactNode;
}

let cachedDisplayTransitionSupport: boolean | undefined;

function canTransitionDisplay(): boolean {
  if (cachedDisplayTransitionSupport !== undefined) return cachedDisplayTransitionSupport;
  if (
    typeof window === 'undefined' ||
    !window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false;
  }

  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  void getComputedStyle(probe).display;
  probe.style.display = 'none';
  cachedDisplayTransitionSupport = getComputedStyle(probe).display === 'block';
  probe.remove();
  return cachedDisplayTransitionSupport;
}

function supportsTopLayerExit(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.CSS?.supports?.('overlay', 'auto')) && canTransitionDisplay();
}

/**
 * Shared native `<dialog>` media lightbox modal used by both Portfolio Gallery items
 * and Home's Featured Highlight cards.
 *
 * - Gallery-style editorial layout (header bar, media viewport, title, metadata, description, tags).
 * - Uses the lighter warm-olive backdrop blur opacity (`casamento-media-dialog` in globals.css).
 * - Native top-layer modal with Esc dismissal, `closedby="any"` + fallback outside-click dismiss,
 *   and `overscroll-behavior: contain` scroll containment.
 */
export function MediaLightboxModal({
  isOpen,
  onClose,
  mediaType,
  title,
  badgeLabel,
  isFeatured = false,
  featuredLabel = 'Featured',
  description,
  image,
  video,
  clientName,
  location,
  eventDate,
  tags,
  headerActions,
}: MediaLightboxModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);
  const titleId = useId();

  const requestAnimatedClose = useCallback(async () => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open || isClosingRef.current) return;

    if (!supportsTopLayerExit()) {
      isClosingRef.current = true;
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((animation) => animation.finished)),
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]);
      }
      dialog.removeAttribute('data-closing');
      isClosingRef.current = false;
      if (dialog.open) {
        dialog.close();
      }
      return;
    }

    dialog.close();
  }, []);

  // Sync React `isOpen` state with native <dialog> showModal() / close()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.removeAttribute('data-closing');
      isClosingRef.current = false;
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Handle native cancel (Esc / back gesture), close, and light-dismiss fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      if (!supportsTopLayerExit()) {
        event.preventDefault();
        void requestAnimatedClose();
      }
    };

    const handleClose = () => {
      dialog.returnValue = '';
      dialog.removeAttribute('data-closing');
      isClosingRef.current = false;
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);

    const hasNativeClosedBy =
      typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

    if (hasNativeClosedBy) {
      return () => {
        dialog.removeEventListener('cancel', handleCancel);
        dialog.removeEventListener('close', handleClose);
      };
    }

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        void requestAnimatedClose();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onClose, requestAnimatedClose]);

  const formattedDate = eventDate ? formatDisplayDate(eventDate, 'long') : null;

  const hasMeta = Boolean(clientName || location || formattedDate);
  const hasTags = Boolean(tags && tags.length > 0);

  const renderMedia = () => {
    if (!isOpen) return null;

    if (mediaType === 'image' && image?.url) {
      return (
        <div className="relative w-full max-h-[60dvh] sm:max-h-[66dvh] flex items-center justify-center bg-[#161E0B] p-3 sm:p-5">
          <Image
            src={image.url}
            alt={image.alt || title}
            width={image.width || 1200}
            height={image.height || 900}
            className="max-h-[54dvh] sm:max-h-[60dvh] w-auto h-auto object-contain rounded-lg"
            priority
          />
        </div>
      );
    }

    if (mediaType === 'video' && video) {
      if (video.isNative) {
        if (!video.directUrl) {
          return (
            <div className="w-full aspect-video flex items-center justify-center bg-[#161E0B] text-[#EFEAD8]/65 text-sm">
              <span>Video preview unavailable</span>
            </div>
          );
        }

        return (
          <div className="relative aspect-video w-full bg-[#161E0B]">
            <video
              key={video.directUrl}
              src={video.directUrl}
              controls
              autoPlay
              playsInline
              poster={video.posterUrl}
              className="w-full h-full object-contain bg-[#161E0B]"
              title={title}
            >
              Your browser does not support HTML5 video streaming.
            </video>
          </div>
        );
      }

      const embedSrc = video.embedUrl || video.directUrl;
      if (embedSrc) {
        return (
          <div className="relative aspect-video w-full bg-[#161E0B]">
            <iframe
              src={embedSrc}
              title={title}
              className="w-full h-full border-0 bg-[#161E0B]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          </div>
        );
      }
    }

    return (
      <div className="w-full aspect-video flex items-center justify-center bg-[#161E0B] text-[#EFEAD8]/65 text-sm">
        <span>Media preview unavailable</span>
      </div>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="casamento-media-dialog rounded-2xl shadow-2xl"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="w-full max-h-[90dvh] flex flex-col rounded-2xl bg-[#1E2810] border border-[#F7F3E8]/15 text-[#F7F3E8]">
        {/* Header Bar — stays above media so dropdowns & close control remain clear */}
        <div className="relative z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-[#F7F3E8]/10 bg-[#2A3A14] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2810] border border-[#F7F3E8]/15 text-[#BC6F07] text-xs font-semibold shrink-0">
              {mediaType === 'video' ? (
                <Film className="w-3.5 h-3.5 text-[#BC6F07] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-[#BC6F07] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              )}
              <span className="truncate max-w-[160px] sm:max-w-[240px]">{badgeLabel}</span>
            </span>

            {isFeatured && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#BC6F07] font-medium shrink-0">
                <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>{featuredLabel}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {headerActions}

            <button
              type="button"
              onClick={() => void requestAnimatedClose()}
              autoFocus
              aria-label="Close media viewer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full inline-flex items-center justify-center bg-[#F7F3E8]/10 hover:bg-[#BC6F07] text-[#F7F3E8] transition-colors duration-200 active:scale-[0.97] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BC6F07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A3A14]"
            >
              <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Media + Editorial Details Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain rounded-b-2xl">
          {/* Media Stage */}
          <div className="w-full bg-[#161E0B]">{renderMedia()}</div>

          {/* Editorial Details */}
          <div className="p-5 sm:p-7 space-y-4 sm:space-y-5 bg-[#1E2810]">
            <div>
              <h2
                id={titleId}
                className="text-lg sm:text-2xl font-semibold text-[#F7F3E8] tracking-tight leading-snug"
              >
                {title}
              </h2>

              {hasMeta && (
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#EFEAD8]/80">
                  {clientName && (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#BC6F07] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <strong className="text-[#F7F3E8] font-medium">{clientName}</strong>
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#BC6F07] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span>{location}</span>
                    </span>
                  )}
                  {formattedDate && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#BC6F07] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span>{formattedDate}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {description && (
              <div className="pt-4 border-t border-[#F7F3E8]/10 text-sm sm:text-base text-[#EFEAD8]/85 font-light leading-relaxed">
                <p>{description}</p>
              </div>
            )}

            {hasTags && tags && (
              <div className="pt-4 border-t border-[#F7F3E8]/10 flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-[#BC6F07] mr-0.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-[#2A3A14] border border-[#F7F3E8]/12 text-[#EFEAD8]/90 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
