import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { HeroSearch } from '@/features/catalog/components/hero-search';
import { cn } from '@/shared/ui/cn';

/** Figma photo node `89:1399`. */
const HERO_IMAGE_SRC = '/images/hero-building.jpg';

/**
 * Figma `81:495`: section 829px; photo 803px at top −75 → covers 0…728,
 * leaving a light canvas band at the bottom where the market pulse sits.
 */
const HERO_HEIGHT_CLASS = 'min-h-[100svh] md:min-h-0 md:h-[829px]';
const HERO_IMAGE_FRAME_CLASS = 'absolute inset-x-0 -top-[75px] -z-10 h-[803px]';

/**
 * Public home hero — full-bleed skyline with marketplace search.
 * Matches Figma section `81:495` (photo node `89:1399`).
 */
export const HomeHero = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className={cn('relative isolate overflow-hidden bg-canvas', HERO_HEIGHT_CLASS)}>
      <div className={HERO_IMAGE_FRAME_CLASS} aria-hidden>
        <Image
          src={HERO_IMAGE_SRC}
          alt=""
          fill
          priority
          className="object-cover object-bottom"
          sizes="100vw"
        />
      </div>

      <div
        className={cn(
          'page-container relative flex h-full flex-col',
          'pt-24 pb-36 md:pt-32 md:pb-40',
        )}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-dark">
          {t('hero.eyebrow')}
        </p>
        <h1 className="mt-3 max-w-3xl font-brand text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-on-dark">
          {t('hero.title')}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-7 text-on-dark/95">{t('hero.subtitle')}</p>

        <div className="mt-10 w-full max-w-4xl">
          <HeroSearch />
        </div>
      </div>
    </section>
  );
};
