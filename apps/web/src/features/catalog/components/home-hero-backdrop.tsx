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
 * Full-bleed hero backdrop — endless multi-direction Ken Burns + soft dissolve.
 * Multi-slide advances every {@link HOME_HERO_ROTATE_MS}; motion never “ends”.
 * Honors `prefers-reduced-motion`.
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
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {slides.map((src, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={`${src}-${index}`}
            className={cn(
              'absolute inset-0 home-hero-slide-fade',
              isActive ? 'home-hero-slide-active' : 'home-hero-slide-idle',
            )}
          >
            <div
              className={cn(
                'home-hero-ken-layer',
                index % 2 === 0 ? 'home-hero-ken-drift' : 'home-hero-ken-drift-alt',
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
