import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { getPublicHomeHero } from '@/features/catalog/api/home-hero-api';
import { HeroSearch } from '@/features/catalog/components/hero-search';
import { DEFAULT_HOME_HERO_IMAGE_SRC } from '@/features/catalog/constants/home-hero';
import { cn } from '@/shared/ui/cn';

type HomeHeroProps = {
  locations?: readonly string[] | undefined;
};

/**
 * Public home hero — full-bleed skyline with marketplace search.
 * Image comes from platform settings when set; otherwise the default R2 asset.
 */
export const HomeHero = async ({ locations = [] }: HomeHeroProps) => {
  const t = await getTranslations('HomePage');
  const hero = await getPublicHomeHero().catch(() => null);
  const imageSrc =
    hero?.imageUrl && hero.imageUrl.trim().length > 0
      ? hero.imageUrl
      : DEFAULT_HOME_HERO_IMAGE_SRC;

  return (
    <section className="relative isolate flex min-h-fluid-screen flex-col bg-canvas">
      <div className="absolute inset-0 -z-10 overflow-x-clip" aria-hidden>
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          loading="eager"
          fetchPriority="high"
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div
        className={cn(
          'page-container relative flex w-full flex-1 flex-col justify-center',
          'pt-[clamp(6.25rem,4.75rem+3.5vw,9.5rem)] pb-[clamp(3rem,2rem+3vw,6rem)]',
        )}
      >
        <div className="flex max-w-3xl flex-col gap-[clamp(0.75rem,0.4rem+1.2vw,1.5rem)]">
          <p
            className={cn(
              'font-bold uppercase text-on-dark',
              'text-[clamp(0.625rem,0.55rem+0.2vw,0.6875rem)]',
              'tracking-[0.2em] leading-none',
            )}
          >
            {t('hero.eyebrow')}
          </p>
          <h1
            className={cn(
              'font-brand font-bold text-on-dark',
              'text-[clamp(2rem,1.05rem+3.8vw,4.5rem)]',
              'leading-[1.05] tracking-[-0.025em]',
              'text-balance',
            )}
          >
            {t('hero.title')}
          </h1>
          <p
            className={cn(
              'max-w-xl text-on-dark/95',
              'text-[clamp(0.9375rem,0.82rem+0.45vw,1.125rem)]',
              'leading-[1.55]',
              'text-pretty',
            )}
          >
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="mt-[clamp(1.5rem,1rem+2vw,2.5rem)] w-full">
          <HeroSearch locations={locations} />
        </div>
      </div>
    </section>
  );
};
