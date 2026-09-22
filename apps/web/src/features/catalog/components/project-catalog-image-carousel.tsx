'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/shared/ui/cn';

type ProjectCatalogImageCarouselImage = {
  src: string;
  alt: string;
};

type ProjectCatalogImageCarouselProps = {
  images: ProjectCatalogImageCarouselImage[];
};

/**
 * Inline media carousel for project catalog image sets (video-like frame + switchers).
 */
export const ProjectCatalogImageCarousel = ({ images }: ProjectCatalogImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());

  if (images.length === 0) {
    return null;
  }

  const visibleImages = useMemo(
    () => images.filter((image) => !failedSrcs.has(image.src)),
    [images, failedSrcs],
  );

  useEffect(() => {
    if (activeIndex >= visibleImages.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleImages.length]);

  if (visibleImages.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-band-mist ring-1 ring-header-border">
        <p className="px-4 text-center text-sm text-ink-secondary">
          Preview is unavailable for these links.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(activeIndex, 0), visibleImages.length - 1);
  const activeImage = visibleImages[safeIndex] ?? visibleImages[0];
  if (!activeImage) {
    return null;
  }

  const canNavigate = visibleImages.length > 1;
  const goPrev = (): void => {
    setActiveIndex((current) => (current - 1 + visibleImages.length) % visibleImages.length);
  };
  const goNext = (): void => {
    setActiveIndex((current) => (current + 1) % visibleImages.length);
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-ink ring-1 ring-header-border">
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="size-full object-cover"
          onError={() => {
            setFailedSrcs((current) => {
              const next = new Set(current);
              next.add(activeImage.src);
              return next;
            });
          }}
        />

        {canNavigate ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className={cn(
                'absolute top-1/2 left-3 -translate-y-1/2 rounded-full p-2',
                'bg-surface-elevated/95 text-brand-deep shadow-md transition-colors',
                'hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
              )}
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className={cn(
                'absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-2',
                'bg-surface-elevated/95 text-brand-deep shadow-md transition-colors',
                'hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
              )}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="flex items-center justify-center">
          <p className="text-xs font-semibold text-ink-secondary">
            {safeIndex + 1} / {visibleImages.length}
          </p>
        </div>
      ) : null}
    </div>
  );
};
