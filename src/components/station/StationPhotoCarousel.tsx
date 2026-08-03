'use client';

import { useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import type { Photo } from '@/lib/data/types';

function gradientFromUrl(url: string): string {
  const [category] = url.replace('gradient://', '').split('/');
  const gradients: Record<string, string> = {
    urban: 'linear-gradient(135deg, #1E3A5F 0%, #0F2340 100%)',
    highway: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    retail: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
    parkside: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  };
  return gradients[category] ?? gradients.urban;
}

interface StationPhotoCarouselProps {
  photos: Photo[];
}

export function StationPhotoCarousel({ photos }: StationPhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) return null;

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth * 0.85;
    const index = Math.round(el.scrollLeft / (cardWidth + 12));
    setActiveIndex(Math.min(Math.max(index, 0), photos.length - 1));
  }

  return (
    <div className="relative flex-shrink-0 px-4 pt-3">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="
          scrollbar-hide flex gap-3 overflow-x-auto pb-3
          snap-x snap-mandatory scroll-smooth
        "
        style={{ scrollbarWidth: 'none' }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="
              relative h-[220px] w-[85%] flex-shrink-0
              snap-center overflow-hidden rounded-2xl
            "
            style={{ background: gradientFromUrl(photo.url) }}
          >
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {photo.caption}
            </div>
            <div className="absolute bottom-3 right-3 text-white/70">
              <Zap size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-center gap-1.5">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className={`h-1.5 w-1.5 rounded-full ${
              i === activeIndex ? 'bg-brand-500' : 'bg-neutral-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
