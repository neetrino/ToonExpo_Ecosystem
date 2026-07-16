import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { TeButton } from '@/components/ui/te-button';

import { HOME_HERO_IMAGE_URL } from '@/lib/home/constants';

export async function HomeHero() {
  const t = await getTranslations('home');
  const tBrand = await getTranslations();

  return (
    <section className="relative isolate min-h-[min(100svh,40rem)] overflow-hidden">
      <Image
        src={HOME_HERO_IMAGE_URL}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[var(--te-fg)]/55" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-[min(100svh,40rem)] max-w-7xl flex-col justify-end gap-5 px-6 pb-16 pt-28 text-white sm:pb-20">
        <p className="text-4xl font-extrabold uppercase tracking-[0.18em] sm:text-5xl md:text-6xl">
          {tBrand('brand')}
        </p>
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('title')}
        </h1>
        <p className="max-w-xl text-base text-white/85 sm:text-lg">{t('subtitle')}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <TeButton href="/projects">{t('ctaPublic')}</TeButton>
          <TeButton
            href="/login"
            variant="secondary"
            className="border-white/40 bg-transparent text-white shadow-none hover:bg-white/10"
          >
            {t('ctaBuyer')}
          </TeButton>
        </div>
      </div>
    </section>
  );
}
