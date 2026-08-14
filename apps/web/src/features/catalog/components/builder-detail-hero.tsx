import type { BuilderDetail } from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { resolveBuilderHeroAddress } from '@/features/catalog/utils/resolve-builder-hero-address';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

const BUILDER_HERO_LOGO_CLASS = 'relative size-14 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-white/35 sm:size-16';

type BuilderDetailHeroProps = {
  builder: BuilderDetail;
};

/**
 * Full-bleed builder hero — cover image from admin company profile.
 */
export const BuilderDetailHero = async ({ builder }: BuilderDetailHeroProps) => {
  const t = await getTranslations('Catalog');
  const heroImageUrl = resolvePublicAssetUrl(builder.coverUrl);
  const logoUrl = resolvePublicAssetUrl(builder.logoUrl);
  const logoInitials = builder.name.trim().slice(0, 2).toUpperCase() || '—';
  const companyLocation = [builder.address, builder.region]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' · ');
  const heroAddress = companyLocation || resolveBuilderHeroAddress(builder.projects);

  return (
    <section className="relative isolate flex min-h-[min(72vh,42rem)] flex-col bg-canvas">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover object-center"
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-2 bg-surface text-ink-muted">
            <Building2 className="size-16 opacity-40" />
          </span>
        )}
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
            {t('buildersPage.detail.heroEyebrow')}
          </p>

          <div className="flex items-center gap-4">
            {logoUrl ? (
              <span className={BUILDER_HERO_LOGO_CLASS}>
                <img src={logoUrl} alt="" className="absolute inset-0 size-full object-cover" />
              </span>
            ) : (
              <span
                className={cn(
                  BUILDER_HERO_LOGO_CLASS,
                  'grid place-items-center font-brand text-lg font-bold text-ink-navy',
                )}
                aria-hidden
              >
                {logoInitials}
              </span>
            )}
            <h1
              className={cn(
                'min-w-0 font-brand font-bold text-on-dark',
                'text-[clamp(2rem,1.05rem+3.8vw,3.75rem)]',
                'leading-none tracking-[-0.025em]',
              )}
            >
              <span className="text-balance">{builder.name}</span>
            </h1>
          </div>

          <p
            className={cn(
              'font-brand font-bold text-on-dark',
              'text-[clamp(1.25rem,1rem+1vw,1.75rem)]',
              'leading-none tracking-[-0.02em]',
            )}
          >
            {t('builders.projectCount', { count: builder.publishedProjectCount })}
          </p>

          {heroAddress ? (
            <p
              className={cn(
                'max-w-xl text-on-dark/95',
                'text-[clamp(1.125rem,0.95rem+0.7vw,1.5rem)]',
                'leading-[1.45]',
                'text-pretty',
              )}
            >
              {heroAddress}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};
