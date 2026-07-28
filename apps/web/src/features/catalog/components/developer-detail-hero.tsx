import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import type { DeveloperProfile } from '@/features/catalog/data/developer-profiles';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

const DEVELOPER_HERO_FALLBACK_SRC = staticAssetUrl('/demo/building-a.webp');

type DeveloperDetailHeroProps = {
  profile: DeveloperProfile;
};

/**
 * Full-bleed developer hero — same chrome as partner / builder detail.
 */
export const DeveloperDetailHero = async ({ profile }: DeveloperDetailHeroProps) => {
  const t = await getTranslations('Catalog.developersPage');
  const heroImageUrl = profile.logoUrl ?? DEVELOPER_HERO_FALLBACK_SRC;

  return (
    <section className="relative isolate flex min-h-[min(72vh,42rem)] flex-col bg-canvas">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src={heroImageUrl}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-ink/25" />
      </div>

      <div
        className={cn(
          'page-container relative flex w-full flex-1 flex-col justify-end',
          'pt-[clamp(6.25rem,4.75rem+3.5vw,9.5rem)] pb-[clamp(2.5rem,2rem+2vw,4rem)]',
        )}
      >
        <div className="flex max-w-3xl flex-col gap-[clamp(0.75rem,0.4rem+1.2vw,1.25rem)]">
          <p
            className={cn(
              'font-bold uppercase text-on-dark',
              'text-[clamp(0.625rem,0.55rem+0.2vw,0.6875rem)]',
              'tracking-[0.2em] leading-none',
            )}
          >
            {t('eyebrow')}
          </p>

          <h1
            className={cn(
              'font-brand font-bold text-on-dark',
              'text-[clamp(2rem,1.05rem+3.8vw,3.75rem)]',
              'leading-none tracking-[-0.025em]',
            )}
          >
            <span className="text-balance">{profile.name}</span>
          </h1>

          <p
            className={cn(
              'font-brand font-bold text-on-dark',
              'text-[clamp(1.25rem,1rem+1vw,1.75rem)]',
              'leading-none tracking-[-0.02em]',
            )}
          >
            {t('projectCount', { count: profile.projectCount })}
          </p>

          <p
            className={cn(
              'max-w-xl text-on-dark/95',
              'text-[clamp(0.9375rem,0.82rem+0.45vw,1.125rem)]',
              'leading-[1.55]',
              'text-pretty',
            )}
          >
            {profile.region}
            {' · '}
            {profile.address}
          </p>
        </div>
      </div>
    </section>
  );
};
