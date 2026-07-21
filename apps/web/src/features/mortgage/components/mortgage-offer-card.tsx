'use client';

import type { PublicMortgageOfferItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { formatMortgageAmount } from '@/features/mortgage/utils/format-mortgage-amount';
import { cn } from '@/shared/ui/cn';

type MortgageOfferCardProps = {
  offer: PublicMortgageOfferItem;
  selected: boolean;
  monthlyPayment?: number | null;
  onSelect: () => void;
};

/**
 * Public bank offer card for comparison and selection.
 */
export const MortgageOfferCard = ({
  offer,
  selected,
  monthlyPayment,
  onSelect,
}: MortgageOfferCardProps) => {
  const t = useTranslations('Mortgage.offers');
  const locale = useLocale();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full flex-col gap-3 rounded-sm border p-4 text-left transition-colors',
        selected
          ? 'border-brand bg-brand/5 ring-1 ring-brand'
          : 'border-border bg-surface hover:border-border-strong',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-surface-elevated">
            {offer.bank.logoUrl ? (
              <Image
                src={offer.bank.logoUrl}
                alt={offer.bank.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-xs font-semibold text-ink-muted">
                {offer.bank.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {offer.bank.name}
            </p>
            <h3 className="text-base font-semibold text-ink">{offer.title}</h3>
          </div>
        </div>
        {offer.featured ? (
          <span className="rounded-pill bg-cta-dark/10 px-2.5 py-0.5 text-xs font-medium text-cta-dark">
            {t('featured')}
          </span>
        ) : null}
      </div>

      {offer.shortDescription ? (
        <p className="text-sm text-ink-secondary">{offer.shortDescription}</p>
      ) : null}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-ink-muted">{t('rate')}</dt>
          <dd className="font-medium text-ink">{offer.rate}%</dd>
        </div>
        {offer.apr ? (
          <div>
            <dt className="text-ink-muted">{t('apr')}</dt>
            <dd className="font-medium text-ink">{offer.apr}%</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-ink-muted">{t('minDownPayment')}</dt>
          <dd className="font-medium text-ink">{offer.minDownPaymentPercent}%</dd>
        </div>
        <div>
          <dt className="text-ink-muted">{t('terms')}</dt>
          <dd className="font-medium text-ink">
            {offer.termOptionsYears.join(', ')} {t('years')}
          </dd>
        </div>
      </dl>

      {monthlyPayment != null ? (
        <p className="text-sm font-semibold text-brand">
          {t('estimatedMonthly', {
            amount: formatMortgageAmount(monthlyPayment, locale),
          })}
        </p>
      ) : null}
    </button>
  );
};
