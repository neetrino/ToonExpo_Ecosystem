'use client';

import Image from 'next/image';

import { HomeHeroNavButtons } from '@/features/catalog/components/home-hero-nav-buttons';
import { DEFAULT_HOME_HERO_IMAGE_SRC } from '@/features/catalog/constants/home-hero';
import { useHomeHeroRotation } from '@/features/catalog/hooks/use-home-hero-rotation';
import { cn } from '@/shared/ui/cn';

type HomeHeroBackdropProps = {
  imageUrls: readonly string[];
};

/**
 * Full-bleed hero backdrop — endless Ken Burns + dissolve, with manual prev/next.
 * Auto-advance honors `prefers-reduced-motion`; edge buttons still work.
 */
export const HomeHeroBackdrop = ({ imageUrls }: HomeHeroBackdropProps) => {
  const slides =
    imageUrls.length > 0 ? imageUrls : ([DEFAULT_HOME_HERO_IMAGE_SRC] as const);
  const { activeIndex, canRotate, goBy } = useHomeHeroRotation(slides.length);

  return (
    <>
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
      {canRotate ? (
        <HomeHeroNavButtons onPrevious={() => goBy(-1)} onNext={() => goBy(1)} />
      ) : null}
    </>
  );
};
