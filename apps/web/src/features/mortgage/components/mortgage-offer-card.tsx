'use client';

import type { PublicMortgageOfferItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { formatMortgageAmount } from '@/features/mortgage/utils/format-mortgage-amount';
import { cn } from '@/shared/ui/cn';

type MortgageOfferCardProps = {
  offer: PublicMortgageOfferItem;
  selected: boolean;
  monthlyPayment?: number | null;
  showLowestRateBadge?: boolean;
  onSelect: () => void;
};

/**
 * Horizontal partner bank offer row — Figma `105:2598`.
 */
export const MortgageOfferCard = ({
  offer,
  selected,
  monthlyPayment,
  showLowestRateBadge = false,
  onSelect,
}: MortgageOfferCardProps) => {
  const t = useTranslations('Mortgage.offers');
  const locale = useLocale();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full flex-col gap-4 rounded-[20px] bg-surface-elevated p-5 text-left',
        'transition-[box-shadow,background-color] duration-[var(--duration-fast)]',
        'sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        selected
          ? 'shadow-[0_0_0_2px_var(--color-brand-secondary),0_10px_15px_-3px_rgba(42,102,123,0.1)]'
          : 'shadow-[0_0_0_1px_var(--color-header-border)] hover:shadow-[0_0_0_1px_var(--color-brand-secondary)/40]',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-brand text-lg font-bold tracking-tight text-ink-navy">
            {offer.bank.name}
          </h3>
          {offer.featured ? (
            <span className="rounded-[10px] bg-band-mist px-2 py-0.5 text-[10px] font-bold tracking-widest text-brand-deep uppercase">
              {t('featured')}
            </span>
          ) : null}
          {showLowestRateBadge && !offer.featured ? (
            <span className="rounded-[10px] bg-band-mist px-2 py-0.5 text-[10px] font-bold tracking-widest text-brand-deep uppercase">
              {t('lowestRate')}
            </span>
          ) : null}
        </div>
        {offer.shortDescription ? (
          <p className="mt-1 text-sm leading-5 text-header-muted">{offer.shortDescription}</p>
        ) : (
          <p className="mt-1 text-sm leading-5 text-header-muted">{offer.title}</p>
        )}
      </div>

      <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 sm:gap-x-8">
        <Metric label={t('rate')} value={`${offer.rate}%`} />
        <Metric label={t('apr')} value={offer.apr != null ? `${offer.apr}%` : '—'} />
        <Metric label={t('minDown')} value={`${offer.minDownPaymentPercent}%`} />
        <Metric
          label={t('monthly')}
          value={monthlyPayment != null ? formatMortgageAmount(monthlyPayment, locale) : '—'}
          emphasize
        />
      </dl>
    </button>
  );
};

const Metric = ({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) => (
  <div>
    <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</dt>
    <dd
      className={cn(
        'mt-0.5 font-brand text-lg font-bold leading-7',
        emphasize ? 'text-brand-deep' : 'text-ink-navy',
      )}
    >
      {value}
    </dd>
  </div>
);
