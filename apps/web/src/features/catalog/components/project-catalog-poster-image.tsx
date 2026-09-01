'use client';

import Image from 'next/image';
import { useState } from 'react';

/** Missing YouTube `maxresdefault` returns a 120×90 placeholder that still HTTP 200s. */
const YOUTUBE_INVALID_MAXRES_MAX_WIDTH = 120;
const POSTER_IMAGE_QUALITY = 90;
const POSTER_IMAGE_SIZES = '(max-width: 768px) 100vw, 960px';

type ProjectCatalogPosterImageProps = {
  src: string;
  fallbackSrc?: string;
  alt: string;
};

/**
 * High-res poster with optional fallback when the primary asset is missing/tiny.
 */
export const ProjectCatalogPosterImage = ({
  src,
  fallbackSrc,
  alt,
}: ProjectCatalogPosterImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  const switchToFallback = (): void => {
    if (fallbackSrc != null && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      quality={POSTER_IMAGE_QUALITY}
      sizes={POSTER_IMAGE_SIZES}
      className="object-cover"
      onError={switchToFallback}
      onLoadingComplete={(image) => {
        if (image.naturalWidth <= YOUTUBE_INVALID_MAXRES_MAX_WIDTH) {
          switchToFallback();
        }
      }}
    />
  );
};
