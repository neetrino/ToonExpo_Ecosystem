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

/**
 * Figma apartment mosaic — large hero + 2×2 thumbs when enough images.
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
  const thumbs = rest.slice(0, 4);
  if (!hero) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-3">
      <div
        className={cn(
          'relative aspect-[4/3] overflow-hidden bg-band-mist md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[460px]',
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
      {thumbs.map((image) => (
        <div
          key={image.src}
          className={cn(
            'relative hidden aspect-[4/3] overflow-hidden bg-band-mist md:block',
            GALLERY_ROUNDED,
          )}
        >
          <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="25vw" />
        </div>
      ))}
    </div>
  );
};
