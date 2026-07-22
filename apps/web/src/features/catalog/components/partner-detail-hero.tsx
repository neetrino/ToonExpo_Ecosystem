import type { PublicPartnerDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { cn } from '@/shared/ui/cn';

type PartnerDetailHeroProps = {
  partner: PublicPartnerDetail;
};

/**
 * Full-bleed partner media + overlapping summary card — matches project detail hero.
 */
export const PartnerDetailHero = async ({ partner }: PartnerDetailHeroProps) => {
  const t = await getTranslations('Partners');
  const tCatalog = await getTranslations('Catalog.partnersPage');
  const heroImageUrl = partner.logoUrl ?? partner.coverUrl;

  return (
    <section className="relative">
      <div className="relative h-[min(72vh,48rem)] w-full overflow-hidden bg-surface">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={partner.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-band-mist font-brand text-6xl font-bold text-brand-deep">
            {partner.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20" />
      </div>

      <div className="page-container relative z-[1] -mt-24 pb-4 sm:-mt-28">
        <div
          className={cn(
            'rounded-[24px] bg-surface-elevated p-6 ring-1 ring-header-border sm:p-8',
            'shadow-lg shadow-brand/5',
          )}
        >
          <p className="text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
            <PartnerTypeLabel type={partner.type} />
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-brand text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
              {partner.name}
            </h1>
            {partner.featured ? (
              <span
                className={cn(
                  'rounded-[10px] bg-band-mist px-2 py-1',
                  'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
                )}
              >
                {t('featured')}
              </span>
            ) : null}
          </div>
          <p className="mt-3 max-w-2xl text-lg leading-6 text-header-muted">
            {partner.shortDescription ?? tCatalog('metaFallback', { name: partner.name })}
          </p>
        </div>
      </div>
    </section>
  );
};
