'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Maximize2 } from 'lucide-react';
import type { ServiceItem } from '@/types';

interface InFormServiceCardProps {
  service: ServiceItem | null;
  onOpenModal: () => void;
}

export function InFormServiceCard({
  service,
  onOpenModal,
}: InFormServiceCardProps) {
  if (!service) return null;

  const mainPhoto = service.images && service.images.length > 0
    ? service.images[0].url
    : '/images/services/placeholder.jpg';

  return (
    <div
      onClick={onOpenModal}
      className="group bg-[#EFEAD8]/60 border border-[#3A4F1C]/15 rounded-xl p-3 sm:p-4 flex flex-row items-start gap-3 sm:gap-4 cursor-pointer transition-all duration-300 hover:border-[#BC6F07]/60 hover:shadow-md hover:bg-[#EFEAD8]/90"
      role="button"
      tabIndex={0}
      aria-label={`View ${service.title} details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal();
        }
      }}
    >
      {/* LEFT: Small Reduced Image Thumbnail */}
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-[#3A4F1C]/15 shadow-sm">
        <Image
          src={mainPhoto}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="112px"
        />
        <div className="absolute top-1 right-1 p-1 rounded-full bg-black/40 backdrop-blur text-white/80 group-hover:bg-[#BC6F07] group-hover:text-white transition-colors">
          <Maximize2 className="w-3 h-3" />
        </div>
      </div>

      {/* RIGHT: Category, Name (Title) */}
      <div className="flex-1 min-w-0 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#BC6F07] flex items-center gap-1">
          <span className="truncate">{service.category?.title || 'Service Package'}</span>
        </span>

        <h4 className="text-xs sm:text-sm font-serif font-bold text-[#3A4F1C] leading-snug line-clamp-2 group-hover:text-[#BC6F07] transition-colors">
          {service.title}
        </h4>

        <p className="text-[11px] text-[#3A4F1C]/80 line-clamp-2 leading-relaxed font-light">
          {service.shortDescription}
        </p>
      </div>
    </div>
  );
}
