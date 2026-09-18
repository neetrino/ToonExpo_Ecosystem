import type { PublicPartnerDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import {
  CATALOG_OVERLAY_HERO_BODY_CLASS,
  CATALOG_OVERLAY_HERO_COPY_WIDTH_CLASS,
  CATALOG_OVERLAY_HERO_SCRIM_CLASS,
  CATALOG_OVERLAY_HERO_TITLE_CLASS,
} from '@/features/catalog/constants/catalog-overlay-hero';
import { PARTNER_DEMO_PHOTO_SRC } from '@/features/catalog/constants/partner-media';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { cn } from '@/shared/ui/cn';

type PartnerDetailHeroProps = {
  partner: PublicPartnerDetail;
};

/**
 * Full-bleed partner hero — Figma photo treatment with existing partner copy.
 */
export const PartnerDetailHero = async ({ partner }: PartnerDetailHeroProps) => {
  const t = await getTranslations('Partners');
  const tCatalog = await getTranslations('Catalog.partnersPage');
  const heroImageUrl = partner.coverUrl ?? PARTNER_DEMO_PHOTO_SRC;
  const mortgageRate = partner.type === 'bank' ? partner.mortgageRate : null;

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
        <div className={CATALOG_OVERLAY_HERO_SCRIM_CLASS} />
      </div>

      <div
        className={cn(
          'page-container relative flex w-full flex-1 flex-col justify-end',
          'pt-[clamp(6.25rem,4.75rem+3.5vw,9.5rem)] pb-[clamp(2.5rem,2rem+2vw,4rem)]',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-[clamp(0.75rem,0.4rem+1.2vw,1.25rem)]',
            CATALOG_OVERLAY_HERO_COPY_WIDTH_CLASS,
          )}
        >
          <p
            className={cn(
              'font-bold uppercase text-on-dark',
              'text-[clamp(0.625rem,0.55rem+0.2vw,0.6875rem)]',
              'tracking-[0.2em] leading-none',
            )}
          >
            <PartnerTypeLabel type={partner.type} />
          </p>

          <h1 className={cn('flex flex-wrap items-center gap-3', CATALOG_OVERLAY_HERO_TITLE_CLASS)}>
            <span className="min-w-0 break-words text-balance">{partner.name}</span>
            {partner.featured ? (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-[10px] bg-canvas/95 px-2 py-1',
                  'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
                )}
              >
                {t('featured')}
              </span>
            ) : null}
          </h1>

          {mortgageRate != null ? (
            <p
              aria-label={tCatalog('detail.mortgageRate')}
              className={cn(
                'font-brand font-bold text-on-dark',
                'text-[clamp(1.25rem,1rem+1.1vw,1.75rem)]',
                'leading-none tracking-[-0.02em]',
              )}
            >
              {tCatalog('detail.mortgageRateValue', { rate: mortgageRate })}
            </p>
          ) : null}

          <p className={CATALOG_OVERLAY_HERO_BODY_CLASS}>
            {partner.shortDescription ?? tCatalog('metaFallback', { name: partner.name })}
          </p>
        </div>
      </div>
    </section>
  );
};
