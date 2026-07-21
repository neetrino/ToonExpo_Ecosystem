import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { HeroSearch } from '@/features/catalog/components/hero-search';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';

/**
 * Premium full-bleed hero with search and primary CTAs.
 * Header is rendered at page level (fixed) so it is never trapped under sections.
 */
export const HomeHero = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="relative min-h-[min(100svh,820px)] overflow-hidden">
      <div className="absolute inset-0 isolate">
        <Image
          src="/images/hero-variant-a.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_35%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-ink/40 to-ink/55" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-accent/15" />
        <div className="absolute inset-0 bg-ink/15" />
      </div>

      <div className="relative flex min-h-[min(100svh,820px)] flex-col pt-[4.25rem] sm:pt-[4.5rem]">
        <div className="page-container flex flex-1 flex-col items-center justify-center pb-28 pt-8 text-center sm:pt-12">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            {t('hero.eyebrow')}
          </p>
          <h1 className="font-display text-[clamp(2.85rem,11.5vw,6.75rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-on-dark drop-shadow-[0_8px_32px_rgb(0_0_0_/0.35)]">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-[clamp(1.05rem,2.4vw,1.4rem)] font-medium leading-snug tracking-[-0.015em] text-on-dark/92">
            {t('hero.findProject')}
          </p>

          <div className="mt-8 w-full">
            <HeroSearch className="mx-auto" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/projects">
              <Button variant="secondary" size="lg" className="min-w-40">
                {t('hero.explore')}
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="min-w-40 border-transparent bg-on-dark text-ink hover:bg-on-dark/90"
              >
                {t('hero.register')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
