'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

import { HomeHeroNavButtons } from '@/features/catalog/components/home-hero-nav-buttons';
import { HomeHeroNavProvider } from '@/features/catalog/components/home-hero-nav-context';
import { DEFAULT_HOME_HERO_IMAGE_SRC } from '@/features/catalog/constants/home-hero';
import { useHomeHeroRotation } from '@/features/catalog/hooks/use-home-hero-rotation';
import { cn } from '@/shared/ui/cn';

type HomeHeroBackdropProps = {
  imageUrls: readonly string[];
  children: ReactNode;
};

/**
 * Full-bleed hero backdrop — endless Ken Burns + dissolve, with manual prev/next.
 * Auto-advance honors `prefers-reduced-motion`; edge buttons still work.
 */
export const HomeHeroBackdrop = ({ imageUrls, children }: HomeHeroBackdropProps) => {
  const slides =
    imageUrls.length > 0 ? imageUrls : ([DEFAULT_HOME_HERO_IMAGE_SRC] as const);
  const { activeIndex, canRotate, goBy } = useHomeHeroRotation(slides.length);

  return (
    <HomeHeroNavProvider value={{ canRotate, goBy }}>
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
        {/* Dark scrim so on-dark text stays readable on any banner photo */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-black/30"
          aria-hidden
        />
      </div>
      {canRotate ? (
        <HomeHeroNavButtons
          placement="hero-edges"
          onPrevious={() => goBy(-1)}
          onNext={() => goBy(1)}
        />
      ) : null}
      {children}
    </HomeHeroNavProvider>
  );
};
