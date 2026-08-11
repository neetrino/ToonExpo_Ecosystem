'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import {
  DEFAULT_HOME_HERO_IMAGE_SRC,
  HOME_HERO_ROTATE_MS,
} from '@/features/catalog/constants/home-hero';
import { cn } from '@/shared/ui/cn';

type HomeHeroBackdropProps = {
  imageUrls: readonly string[];
};

/**
 * Full-bleed hero backdrop — crossfades through slides every {@link HOME_HERO_ROTATE_MS}.
 * Respects `prefers-reduced-motion` (stays on the first slide).
 */
export const HomeHeroBackdrop = ({ imageUrls }: HomeHeroBackdropProps) => {
  const slides =
    imageUrls.length > 0 ? imageUrls : ([DEFAULT_HOME_HERO_IMAGE_SRC] as const);
  const [activeIndex, setActiveIndex] = useState(0);
  const canRotate = slides.length > 1;

  useEffect(() => {
    if (!canRotate) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, HOME_HERO_ROTATE_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [canRotate, slides.length]);

  return (
    <div className="absolute inset-0 -z-10 overflow-x-clip" aria-hidden>
      {slides.map((src, index) => (
        <Image
          key={`${src}-${index}`}
          src={src}
          alt=""
          fill
          priority={index === 0}
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          className={cn(
            'object-cover object-center transition-opacity duration-700 ease-out',
            'motion-reduce:transition-none',
            index === activeIndex ? 'opacity-100' : 'opacity-0',
          )}
          sizes="100vw"
        />
      ))}
    </div>
  );
};
