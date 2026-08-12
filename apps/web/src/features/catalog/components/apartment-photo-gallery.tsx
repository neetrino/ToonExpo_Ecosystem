'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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

/**
 * Apartment mosaic — 1 large photo on the left, up to 4 thumbs on the right.
 * Click any photo to open the fullscreen gallery lightbox.
 */
export const ApartmentPhotoGallery = ({ images }: ApartmentPhotoGalleryProps) => {
  const t = useTranslations('Catalog.apartment');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openAt = (index: number): void => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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
        <ImageGalleryLightbox
          open={lightboxOpen}
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => {
            setLightboxOpen(false);
          }}
        />
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
      <div
        className={cn(
          'grid grid-cols-1 gap-3',
          'md:h-[460px] md:grid-cols-4 md:grid-rows-2 md:gap-3',
        )}
      >
        <button
          type="button"
          className={cn(
            'relative overflow-hidden bg-band-mist max-md:aspect-[4/3]',
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
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </button>
        {thumbs.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            className={cn(
              'relative hidden overflow-hidden bg-band-mist md:block md:h-full md:min-h-0',
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

      <ImageGalleryLightbox
        open={lightboxOpen}
        images={images}
        initialIndex={lightboxIndex}
        onClose={() => {
          setLightboxOpen(false);
        }}
      />
    </>
  );
};
