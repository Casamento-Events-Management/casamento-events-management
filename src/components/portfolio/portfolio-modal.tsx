// =============================================================================
// portfolio-modal.tsx — Portfolio Gallery Lightbox Modal
//
// Thin adapter over the shared native `<dialog>` MediaLightboxModal primitive,
// providing Portfolio item media resolution, metadata, and social sharing.
// =============================================================================

'use client';

import React from 'react';
import type { PortfolioItem } from '@/types';
import { MediaLightboxModal } from '@/components/ui/media-lightbox-modal';
import { ShareDropdown } from '@/components/ui/share-dropdown';
import type { SharePayload } from '@/lib/utils/shareUtils';
import { parseVideoSource } from '@/lib/utils/videoUtils';

interface PortfolioModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PortfolioModal({ item, isOpen, onClose }: PortfolioModalProps) {
  const parsedVideo = item?.mediaType === 'video' ? parseVideoSource(item.video) : null;
  const isNativeVideo =
    parsedVideo?.sourceType === 'sanity' || parsedVideo?.sourceType === 'native';

  const rawVideo = item?.video as { asset?: { url?: string }; mimeType?: string } | undefined;
  const directVideoUrl = parsedVideo?.directUrl || rawVideo?.asset?.url;
  const mimeType = rawVideo?.mimeType;

  const sharePayload: SharePayload | null = item
    ? {
        title: item.title,
        description: item.description,
        url: `/portfolio/${item.category.slug}?item=${item.slug}`,
        categorySlug: item.category.slug,
        location: item.location,
        clientName: item.clientName,
        hashtags: item.tags,
      }
    : null;

  return (
    <MediaLightboxModal
      isOpen={isOpen && Boolean(item)}
      onClose={onClose}
      mediaType={item?.mediaType ?? 'image'}
      title={item?.title ?? ''}
      badgeLabel={item?.category.title ?? 'Portfolio'}
      isFeatured={Boolean(item?.featured)}
      featuredLabel="Featured Project"
      description={item?.description}
      image={
        item?.mediaType === 'image'
          ? {
              url: item.thumbnail.url,
              alt: item.thumbnail.alt || item.title,
              width: item.thumbnail.width,
              height: item.thumbnail.height,
            }
          : undefined
      }
      video={
        item?.mediaType === 'video'
          ? {
              isNative: isNativeVideo,
              directUrl: directVideoUrl,
              embedUrl: parsedVideo?.embedUrl,
              mimeType,
              posterUrl: item.thumbnail.url,
            }
          : undefined
      }
      clientName={item?.clientName}
      location={item?.location}
      eventDate={item?.eventDate}
      tags={item?.tags}
      headerActions={
        sharePayload ? (
          <ShareDropdown payload={sharePayload} direction="down" theme="dark" />
        ) : undefined
      }
    />
  );
}
