'use client';

import React, { useEffect, useId, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export interface TeaserMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  embedUrl?: string;
  directUrl?: string;
  isNative: boolean;
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

export function TeaserMediaModal({
  isOpen,
  onClose,
  title,
  description,
  embedUrl,
  directUrl,
  isNative,
}: TeaserMediaModalProps) {
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

  // Handle native cancel (Esc / back gesture), close, and light-dismiss fallback for browsers without `closedBy`
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

    // Fallback light-dismiss: require both pointerdown & pointerup outside dialog bounds
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

  const videoSrc = embedUrl || directUrl || '';

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="casamento-media-dialog rounded-2xl overflow-hidden shadow-2xl"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="w-full overflow-hidden rounded-2xl bg-[#1E2810] border border-[#F7F3E8]/15 flex flex-col max-h-[90dvh]">
        {/* Dedicated Modal Header — keeps close button clear of video player controls */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 bg-[#2A3A14] border-b border-[#F7F3E8]/10 shrink-0">
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#BC6F07]">
              Featured Highlight
            </span>
            <h2
              id={titleId}
              className="text-sm sm:text-base font-medium text-[#F7F3E8] truncate mt-0.5"
            >
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-[#F7F3E8]/15 text-[10px] font-mono tracking-wider text-[#F7F3E8]/55 uppercase">
              Esc
            </span>
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

        {/* Media Frame — mounts only when open so playback stops immediately on close */}
        <div className="relative aspect-video w-full bg-[#161E0B] shrink-0">
          {isOpen &&
            (isNative ? (
              <video
                src={directUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
                width={1280}
                height={720}
                title={title}
              />
            ) : (
              <iframe
                src={videoSrc}
                title={title}
                className="w-full h-full border-0"
                allow="autoplay; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ))}
        </div>

        {/* Optional Editorial Caption Footer */}
        {description && (
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#2A3A14] border-t border-[#F7F3E8]/10 overflow-y-auto">
            <p className="text-xs sm:text-sm text-[#F7F3E8]/80 font-light leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
