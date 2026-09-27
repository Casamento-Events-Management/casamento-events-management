'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, CheckCircle, Sparkles } from 'lucide-react';
import type { ServiceItem } from '@/types';

interface ServicesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
}

export function ServicesDetailModal({
  isOpen,
  onClose,
  service,
}: ServicesDetailModalProps) {
  // Prevent background scrolling and handle Escape (ESC) key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const primaryImage = service.images && service.images.length > 0
    ? service.images[0].url
    : '/images/services/placeholder.jpg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#F7F3E8] border border-[#3A4F1C]/20 rounded-2xl shadow-2xl overflow-y-auto flex flex-col text-[#3A4F1C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#F7F3E8]/95 backdrop-blur border-b border-[#3A4F1C]/15">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#BC6F07] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {service.category.title}
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#3A4F1C]">
              {service.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#3A4F1C]/70 hover:text-[#3A4F1C] hover:bg-[#3A4F1C]/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Main Image Banner */}
          <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden shadow-inner border border-[#3A4F1C]/10">
            <Image
              src={primaryImage}
              alt={service.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider block">
                  {service.serviceType}
                </span>
                <p className="text-sm sm:text-base font-serif font-medium text-white">
                  {service.title}
                </p>
              </div>
              <div className="bg-[#3A4F1C]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-white/20 text-right">
                <span className="text-[10px] uppercase text-white/70 block">Base Rate</span>
                <span className="text-sm font-bold text-[#F7F3E8]">
                  {service.priceFormatted || (service.startingPrice ? `₱${service.startingPrice.toLocaleString()}` : '')}
                </span>
              </div>
            </div>
          </div>

          {/* Service Full / Short Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70">
              Overview & Package Details
            </h4>
            <p className="text-xs sm:text-sm text-[#3A4F1C]/90 font-light leading-relaxed">
              {service.fullDescription || service.shortDescription}
            </p>
          </div>

          {/* Full Deliverables & Inclusions List */}
          {service.defaultInclusions && service.defaultInclusions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#3A4F1C]/15">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70">
                Complete Deliverables & Inclusions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#EFEAD8]/60 p-4 rounded-xl border border-[#3A4F1C]/10">
                {service.defaultInclusions.map((inclusion, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-[#3A4F1C]">
                    <CheckCircle className="w-4 h-4 text-[#BC6F07] shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{inclusion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Thumbnails if available (Horizontal Side Scroll) */}
          {service.images && service.images.length > 1 && (
            <div className="space-y-3 pt-2 border-t border-[#3A4F1C]/15">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70">
                Photo Gallery
              </h4>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-[#3A4F1C]/20 snap-x snap-mandatory">
                {service.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-36 sm:w-44 h-24 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-[#3A4F1C]/15 snap-start shadow-sm group"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${service.title} photo ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="176px"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Overview */}
          {service.addOns && service.addOns.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#3A4F1C]/15">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3A4F1C]/70">
                Available Add-On Upgrades
              </h4>
              <div className="space-y-2">
                {service.addOns.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#EFEAD8]/40 border border-[#3A4F1C]/10 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#3A4F1C] block">{addon.title}</span>
                      {addon.description && (
                        <span className="text-[10px] text-[#3A4F1C]/70 font-light block">
                          {addon.description}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#BC6F07] ml-2 shrink-0">
                      {addon.priceFormatted || (addon.price ? `+ ₱${addon.price.toLocaleString()}` : '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#F7F3E8]/95 backdrop-blur border-t border-[#3A4F1C]/15 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-[#F7F3E8] bg-[#3A4F1C] hover:bg-[#3A4F1C]/90 rounded-lg transition-colors shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
