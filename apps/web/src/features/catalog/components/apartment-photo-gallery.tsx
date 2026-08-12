'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

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
 * Apartment mosaic — 1 large photo on the left, 4 equal thumbs on the right (2×2).
 * One shared CSS grid so top/bottom edges of both columns align exactly.
 */
export const ApartmentPhotoGallery = ({ images }: ApartmentPhotoGalleryProps) => {
  const t = useTranslations('Catalog.apartment');

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
      <div className={cn('relative aspect-[16/10] overflow-hidden bg-band-mist', GALLERY_ROUNDED)}>
        <Image
          src={only.src}
          alt={only.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
      </div>
    );
  }

  const [hero, ...rest] = images;
  const thumbs = rest.slice(0, GALLERY_THUMB_LIMIT);
  if (!hero) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3',
        'md:h-[460px] md:grid-cols-4 md:grid-rows-2 md:gap-3',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-band-mist max-md:aspect-[4/3]',
          'md:col-span-2 md:row-span-2 md:h-full md:min-h-0',
          GALLERY_ROUNDED,
        )}
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {thumbs.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={cn(
            'relative hidden overflow-hidden bg-band-mist md:block md:h-full md:min-h-0',
            GALLERY_ROUNDED,
          )}
        >
          <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="25vw" />
        </div>
      ))}
    </div>
  );
};
