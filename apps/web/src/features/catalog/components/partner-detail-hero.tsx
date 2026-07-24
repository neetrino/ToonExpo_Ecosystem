import type { PublicPartnerDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

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
  const heroImageUrl = partner.logoUrl ?? partner.coverUrl ?? PARTNER_DEMO_PHOTO_SRC;
  const showMortgageRate = partner.type === 'bank' && partner.mortgageRate != null;

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
            <PartnerTypeLabel type={partner.type} />
          </p>

          <h1
            className={cn(
              'inline-flex flex-wrap items-center gap-3',
              'font-brand font-bold text-on-dark',
              'text-[clamp(2rem,1.05rem+3.8vw,3.75rem)]',
              'leading-none tracking-[-0.025em]',
            )}
          >
            <span className="text-balance">{partner.name}</span>
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

          {showMortgageRate ? (
            <p
              aria-label={tCatalog('detail.mortgageRate')}
              className={cn(
                'font-brand font-bold text-on-dark',
                'text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)]',
                'leading-none tracking-[-0.02em]',
              )}
            >
              {tCatalog('detail.mortgageRateValue', { rate: partner.mortgageRate })}
            </p>
          ) : null}

          <p
            className={cn(
              'max-w-xl text-on-dark/95',
              'text-[clamp(0.9375rem,0.82rem+0.45vw,1.125rem)]',
              'leading-[1.55]',
              'text-pretty',
            )}
          >
            {partner.shortDescription ?? tCatalog('metaFallback', { name: partner.name })}
          </p>
        </div>
      </div>
    </section>
  );
};
