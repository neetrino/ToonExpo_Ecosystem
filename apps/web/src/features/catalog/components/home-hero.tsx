import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { HeroSearch } from '@/features/catalog/components/hero-search';
import { Link } from '@/i18n/navigation';
import { SiteHeader } from '@/shared/ui/site-header';
import { Button } from '@/shared/ui/button';

/**
 * Premium full-bleed hero with search and primary CTAs.
 */
export const HomeHero = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="relative isolate min-h-[min(100svh,820px)] overflow-hidden">
      <Image
        src="/images/hero-variant-a.png"
        alt=""
        fill
        priority
        className="object-cover object-[center_35%]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-ink/35 to-ink/45" />
      <div className="absolute inset-0 bg-ink/20" />

      <div className="relative flex min-h-[min(100svh,820px)] flex-col">
        <SiteHeader variant="transparent" />

        <div className="page-container flex flex-1 flex-col items-center justify-center pb-28 pt-8 text-center sm:pt-12">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-dark/80">
            {t('hero.eyebrow')}
          </p>
          <h1 className="font-display text-[clamp(2.75rem,11vw,6.5rem)] font-semibold leading-[0.95] tracking-tight text-on-dark">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-[clamp(1.05rem,2.4vw,1.35rem)] font-medium leading-snug text-on-dark/90">
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
