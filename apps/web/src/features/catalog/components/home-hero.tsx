import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { HeroSearch } from '@/features/catalog/components/hero-search';
import { cn } from '@/shared/ui/cn';

const HERO_IMAGE_SRC = '/images/hero-skyline.jpg';

/**
 * Public home hero — full-bleed skyline with marketplace search.
 * Matches Figma section `81:495` (photo node `89:1399`, top offset −75px).
 */
export const HomeHero = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="relative isolate min-h-[min(100svh,829px)] overflow-hidden bg-canvas">
      <div className="absolute inset-x-0 -top-[75px] bottom-0 -z-10" aria-hidden>
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
          'page-container flex flex-col justify-center',
          'pt-24 pb-28 md:pt-32 md:pb-32',
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
