'use client';

import React from 'react';
import { MediaLightboxModal } from '@/components/ui/media-lightbox-modal';

export interface TeaserMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  embedUrl?: string;
  directUrl?: string;
  isNative: boolean;
}

/**
 * Home Featured Highlight modal — delegates to the shared Gallery-style
 * native `<dialog>` MediaLightboxModal primitive for unified UX across Home & Portfolio.
 */
export function TeaserMediaModal({
  isOpen,
  onClose,
  title,
  description,
  embedUrl,
  directUrl,
  isNative,
}: TeaserMediaModalProps) {
  return (
    <MediaLightboxModal
      isOpen={isOpen}
      onClose={onClose}
      mediaType="video"
      title={title}
      badgeLabel="Featured Highlight"
      isFeatured
      featuredLabel="Signature Film"
      description={description}
      video={{
        isNative,
        directUrl,
        embedUrl,
      }}
    />
  );
}
