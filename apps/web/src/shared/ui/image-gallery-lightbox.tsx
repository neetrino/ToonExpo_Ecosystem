'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { registerFloorPlanLightbox } from '@/shared/ui/floor-plan-lightbox-stack';

/** Above nested side sheets (`--z-modal` = 140). */
const IMAGE_GALLERY_LIGHTBOX_Z_INDEX = 150;

const navButtonClassName = cn(
  'inline-flex size-10 items-center justify-center rounded-full',
  'bg-brand text-on-brand transition-colors',
  'hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
);

export type GalleryLightboxImage = {
  src: string;
  alt: string;
};

type ImageGalleryLightboxProps = {
  open: boolean;
  images: readonly GalleryLightboxImage[];
  initialIndex?: number;
  onClose: () => void;
};

/**
 * Full-viewport multi-image viewer with prev/next (arrows / buttons / Escape).
 */
export const ImageGalleryLightbox = ({
  open,
  images,
  initialIndex = 0,
  onClose,
}: ImageGalleryLightboxProps) => {
  const t = useTranslations('Common');
  const tApartment = useTranslations('Catalog.apartment');
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!open) {
      return;
    }
    setIndex(Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)));
  }, [open, initialIndex, images.length]);

  useEffect(() => {
    if (!open || images.length === 0) {
      return;
    }

    const unregister = registerFloorPlanLightbox();
    lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        blurActiveElementAfterEscClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((current) => (current - 1 + images.length) % images.length);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((current) => (current + 1) % images.length);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      unregister();
      unlockBodyScroll();
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, images.length, onClose]);

  if (!open || images.length === 0 || typeof document === 'undefined') {
    return null;
  }

  const current = images[index] ?? images[0];
  if (!current) {
    return null;
  }

  const showNav = images.length > 1;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-ink/90 p-4"
      style={{ zIndex: IMAGE_GALLERY_LIGHTBOX_Z_INDEX }}
      role="dialog"
      aria-modal="true"
      aria-label={tApartment('galleryLightboxLabel')}
    >
      <button
        type="button"
        aria-label={t('close')}
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
      />
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        {showNav ? (
          <span className="rounded-full bg-brand px-3 py-1 text-sm text-on-brand">
            {tApartment('galleryPhotoCount', { current: index + 1, total: images.length })}
          </span>
        ) : null}
        <button
          type="button"
          aria-label={t('close')}
          title={t('close')}
          className={navButtonClassName}
          onClick={onClose}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      {showNav ? (
        <>
          <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2 sm:left-6">
            <button
              type="button"
              aria-label={tApartment('galleryPrevious')}
              title={tApartment('galleryPrevious')}
              className={navButtonClassName}
              onClick={() => {
                setIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
              }}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          </div>
          <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2 sm:right-6">
            <button
              type="button"
              aria-label={tApartment('galleryNext')}
              title={tApartment('galleryNext')}
              className={navButtonClassName}
              onClick={() => {
                setIndex((currentIndex) => (currentIndex + 1) % images.length);
              }}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </>
      ) : null}
      <img
        src={current.src}
        alt={current.alt}
        className="relative max-h-[min(100dvh-2rem,100%)] max-w-full object-contain"
        onClick={(event) => {
          event.stopPropagation();
        }}
      />
    </div>,
    document.body,
  );
};
