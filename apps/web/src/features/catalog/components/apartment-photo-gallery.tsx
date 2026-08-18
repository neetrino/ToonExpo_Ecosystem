'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type UIEvent } from 'react';

import { ImageGalleryLightbox } from '@/shared/ui/image-gallery-lightbox';
import { cn } from '@/shared/ui/cn';

type GalleryImage = {
  src: string;
  alt: string;
};

type ApartmentPhotoGalleryProps = {
  images: GalleryImage[];
};

const GALLERY_ROUNDED = 'rounded-[20px]';
const GALLERY_THUMB_LIMIT = 4;
const MOBILE_SLIDE_ASPECT = 'aspect-[4/3]';

type MobileGalleryCarouselProps = {
  images: GalleryImage[];
  onOpenAt: (index: number) => void;
};

/**
 * Compact full-bleed snap carousel — swipe to see every apartment photo on mobile.
 */
const MobileGalleryCarousel = ({ images, onOpenAt }: MobileGalleryCarouselProps) => {
  const t = useTranslations('Catalog.apartment');
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [images]);

  const onScroll = (event: UIEvent<HTMLDivElement>): void => {
    const el = event.currentTarget;
    const width = el.clientWidth;
    if (width <= 0) {
      return;
    }
    const nextIndex = Math.round(el.scrollLeft / width);
    const clamped = Math.min(Math.max(nextIndex, 0), images.length - 1);
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  };

  return (
    <div className={cn('relative overflow-hidden md:hidden', GALLERY_ROUNDED)}>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className={cn(
          'no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
        )}
        aria-label={t('galleryLightboxLabel')}
      >
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            className={cn(
              'relative w-full shrink-0 snap-center overflow-hidden bg-band-mist',
              MOBILE_SLIDE_ASPECT,
              'cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
            )}
            aria-label={t('viewAllPhotos')}
            onClick={() => {
              onOpenAt(index);
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </button>
        ))}
      </div>

      {images.length > 1 ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-3 flex justify-center',
          )}
        >
          <span
            className={cn(
              'rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold',
              'tracking-wide text-on-dark backdrop-blur-[2px]',
            )}
          >
            {t('galleryPhotoCount', {
              current: activeIndex + 1,
              total: images.length,
            })}
          </span>
        </div>
      ) : null}
    </div>
  );
};

/**
 * Apartment mosaic — 1 large photo on the left, up to 4 thumbs on the right (md+).
 * Mobile: swipeable carousel so every photo is reachable. Click opens lightbox.
 */
export const ApartmentPhotoGallery = ({ images }: ApartmentPhotoGalleryProps) => {
  const t = useTranslations('Catalog.apartment');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openAt = (index: number): void => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightbox = (
    <ImageGalleryLightbox
      open={lightboxOpen}
      images={images}
      initialIndex={lightboxIndex}
      onClose={() => {
        setLightboxOpen(false);
      }}
    />
  );

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'flex aspect-[16/10] items-center justify-center bg-band-mist text-sm text-header-muted',
          GALLERY_ROUNDED,
        )}
      >
        {t('noPlan')}
      </div>
    );
  }

  if (images.length === 1) {
    const only = images[0];
    if (!only) {
      return null;
    }
    return (
      <>
        <button
          type="button"
          className={cn(
            'relative block aspect-[16/10] w-full overflow-hidden bg-band-mist',
            'cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
            GALLERY_ROUNDED,
          )}
          aria-label={t('viewAllPhotos')}
          onClick={() => {
            openAt(0);
          }}
        >
          <Image
            src={only.src}
            alt={only.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </button>
        {lightbox}
      </>
    );
  }

  const [hero, ...rest] = images;
  const thumbs = rest.slice(0, GALLERY_THUMB_LIMIT);
  if (!hero) {
    return null;
  }

  return (
    <>
      <MobileGalleryCarousel images={images} onOpenAt={openAt} />

      <div
        className={cn(
          'hidden grid-cols-1 gap-3 md:grid',
          'md:h-[460px] md:grid-cols-4 md:grid-rows-2 md:gap-3',
        )}
      >
        <button
          type="button"
          className={cn(
            'relative overflow-hidden bg-band-mist',
            'cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
            'md:col-span-2 md:row-span-2 md:h-full md:min-h-0',
            GALLERY_ROUNDED,
          )}
          aria-label={t('viewAllPhotos')}
          onClick={() => {
            openAt(0);
          }}
        >
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
        </button>
        {thumbs.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            className={cn(
              'relative overflow-hidden bg-band-mist md:h-full md:min-h-0',
              'cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
              GALLERY_ROUNDED,
            )}
            aria-label={t('viewAllPhotos')}
            onClick={() => {
              openAt(index + 1);
            }}
          >
            <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="25vw" />
          </button>
        ))}
      </div>

      {lightbox}
    </>
  );
};
