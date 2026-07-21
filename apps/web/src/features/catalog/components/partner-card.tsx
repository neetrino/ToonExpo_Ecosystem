'use client';

import type { PublicPartnerListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { FeaturedBadge } from '@/features/partners/components/partner-badges';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type PartnerCardProps = {
  partner: PublicPartnerListItem;
  className?: string | undefined;
};

/**
 * Public partner card with logo, type, and short description.
 */
export const PartnerCard = ({ partner, className }: PartnerCardProps) => {
  const t = useTranslations('Catalog.partnersPage');

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-md border border-border/80 bg-surface-elevated shadow-xs transition-[box-shadow,transform] duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-md',
        partner.featured && 'ring-1 ring-brand/30',
        className,
      )}
    >
      <div className="relative flex aspect-[3/2] items-center justify-center bg-surface">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-sm bg-brand-soft font-brand text-lg font-bold text-brand">
            {partner.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {partner.featured ? (
          <span className="absolute top-3 left-3">
            <FeaturedBadge featured />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h3 className="font-brand text-sm font-semibold text-ink">{partner.name}</h3>
        <p className="text-xs text-ink-muted">
          <PartnerTypeLabel type={partner.type} />
        </p>
        {partner.shortDescription ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-ink-secondary">
            {partner.shortDescription}
          </p>
        ) : null}
        <Link
          href={`/partners/${partner.slug}`}
          className="mt-auto inline-flex h-9 items-center justify-center rounded-sm bg-cta-dark text-sm font-medium text-on-dark transition-colors hover:bg-cta-dark/90"
        >
          {t('actions.details')}
        </Link>
      </div>
    </article>
  );
};
