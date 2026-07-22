'use client';

import type { PublicPartnerListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { PARTNER_DEMO_PHOTO_SRC } from '@/features/catalog/constants/partner-media';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type PartnerCardProps = {
  partner: PublicPartnerListItem;
  className?: string | undefined;
};

/**
 * Public partner card — same chrome as home featured project cards.
 */
export const PartnerCard = ({ partner, className }: PartnerCardProps) => {
  const t = useTranslations('Partners');
  const tCatalog = useTranslations('Catalog.partnersPage');
  const photoSrc = partner.logoUrl ?? PARTNER_DEMO_PHOTO_SRC;

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[15px] bg-surface">
        <Link href={`/partners/${partner.slug}`} className="absolute inset-0 block">
          <Image
            src={photoSrc}
            alt={partner.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Link>

        {partner.featured ? (
          <span
            className={cn(
              'pointer-events-none absolute top-3 left-3 rounded-sm bg-canvas/95 px-2 py-1',
              'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
            )}
          >
            {t('featured')}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate font-brand text-base font-semibold tracking-[-0.02em] text-ink-navy">
            <Link
              href={`/partners/${partner.slug}`}
              className="transition-colors hover:text-brand-deep"
            >
              {partner.name}
            </Link>
          </h3>
          <p className="shrink-0 font-brand text-sm font-bold leading-7 text-brand-deep uppercase">
            <PartnerTypeLabel type={partner.type} />
          </p>
        </div>

        {partner.shortDescription ? (
          <p className="mb-4 line-clamp-2 text-xs leading-4 text-header-muted">
            {partner.shortDescription}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        <div
          className={cn(
            'mt-auto flex flex-wrap items-center gap-4 border-t border-header-border pt-3',
            'text-[11px] font-medium tracking-tight text-header-muted uppercase',
          )}
        >
          <span>{tCatalog('actions.details')}</span>
        </div>
      </div>
    </article>
  );
};
