'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { VlogGalleryProps, ArticleVlogItem } from '@/types';
import { VlogCategoryFilter } from './VlogCategoryFilter';
import { VlogItem } from './VlogItem';
import { VlogModal } from './vlog-modal';

interface VlogGalleryClientProps extends VlogGalleryProps {
  showViewMore: boolean;
}

export function VlogGallery({ items, categories, totalCount, onSelectVideo, showViewMore }: VlogGalleryClientProps) {
  const [activeSlug, setActiveSlug] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<ArticleVlogItem | null>(null);

  const filteredItems = useMemo<ArticleVlogItem[]>(() => {
    if (activeSlug === 'all') return items;
    return items.filter((item) => item.category?.slug === activeSlug);
  }, [items, activeSlug]);

  const handlePlayVideo = useCallback(
    (item: ArticleVlogItem) => {
      if (onSelectVideo) {
        onSelectVideo(item);
      } else {
        setSelectedVideo(item);
      }
    },
    [onSelectVideo]
  );

  return (
    <section>
      {/* Category Filter Bar */}
      <div className="mb-8 mt-2">
        <VlogCategoryFilter
          categories={categories}
          activeSlug={activeSlug}
          onSelect={setActiveSlug}
        />
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="px-6 sm:px-8 max-w-7xl mx-auto py-16 text-center">
          <p className="text-sm text-[#3A4F1C]/60 font-light">
            No vlogs found in this category.
          </p>
        </div>
      ) : (
        <div className="px-6 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 lg:gap-x-10 lg:gap-y-16">
          {filteredItems.map((item) => (
            <VlogItem
              key={item._id}
              item={item}
              onPlayVideo={handlePlayVideo}
            />
          ))}
        </div>
      )}

      {/* View More Vlogs CTA */}
      {showViewMore && activeSlug === 'all' && (
        <div className="flex justify-center mt-14 pb-14">
          <Link
            href="/articles/vlogs"
            className="text-sm font-medium text-[#3A4F1C] underline underline-offset-4 hover:text-[#BC6F07] transition-colors duration-200 tracking-wider uppercase"
          >
            View More Vlogs →
          </Link>
        </div>
      )}

      {/* Pop-up Video Modal */}
      <VlogModal
        item={selectedVideo}
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}

