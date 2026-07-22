'use client';

import type { PublicPartnerListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type PartnerCardProps = {
  partner: PublicPartnerListItem;
  className?: string | undefined;
};

/**
 * Public partner listing card — matches marketplace project/apartment card chrome.
 */
export const PartnerCard = ({ partner, className }: PartnerCardProps) => {
  const t = useTranslations('Partners');

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        partner.featured && 'ring-brand/40',
        className,
      )}
    >
      <Link
        href={`/partners/${partner.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-[15px] bg-surface"
      >
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            fill
            className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-brand text-2xl font-bold text-brand-deep">
            {partner.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        {partner.featured ? (
          <span
            className={cn(
              'pointer-events-none absolute top-3 left-3 rounded-[10px] bg-canvas/95 px-2 py-1',
              'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
            )}
          >
            {t('featured')}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <h3 className="mb-1 min-w-0 truncate font-brand text-base font-semibold tracking-[-0.02em] text-ink-navy">
          <Link
            href={`/partners/${partner.slug}`}
            className="transition-colors hover:text-brand-deep"
          >
            {partner.name}
          </Link>
        </h3>

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
          <PartnerTypeLabel type={partner.type} />
        </div>
      </div>
    </article>
  );
};
