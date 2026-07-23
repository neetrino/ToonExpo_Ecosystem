'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';

type PriceHistoryRow = {
  eventKey: 'listed' | 'priceChange';
  /** ISO date `YYYY-MM-DD` when known. */
  dateIso: string | null;
  /** AMD major units (or null when hidden). */
  amount: string | number | null;
  currency: string;
};

type ApartmentPriceHistoryProps = {
  apartmentId: string;
  priceVisibility: 'public' | 'by_request' | 'visible_after_login';
  rows: PriceHistoryRow[];
};

const formatDisplayDate = (dateIso: string | null, locale: string): string => {
  if (dateIso == null || dateIso === '') {
    return '—';
  }
  const date = new Date(`${dateIso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat(locale === 'hy' ? 'en-GB' : locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

/**
 * Figma price-history list — locale-converted amounts.
 */
export const ApartmentPriceHistory = ({
  apartmentId,
  priceVisibility,
  rows,
}: ApartmentPriceHistoryProps) => {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(apartmentId);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="py-10">
      <h2 className="font-brand text-2xl font-bold tracking-tight text-ink-navy">
        {t('apartment.priceHistoryTitle')}
      </h2>
      <ul className="mt-8 space-y-0">
        {rows.map((row, index) => {
          const amount = row.amount ?? overlay?.price ?? null;
          const priceLabel = formatCatalogPrice({
            amount,
            currency: overlay?.priceCurrency ?? row.currency,
            locale,
            priceVisibility,
            onRequestLabel: t('price.onRequest'),
            signInLabel: t('price.signInToSee'),
          });

          return (
            <li
              key={`${row.eventKey}-${row.dateIso ?? index}`}
              className="flex items-center justify-between gap-4 border-b border-header-border py-3"
            >
              <div>
                <p className="text-sm font-medium text-ink-navy">
                  {t(`apartment.priceHistory.${row.eventKey}`)}
                </p>
                <p className="mt-0.5 text-sm text-header-muted">
                  {formatDisplayDate(row.dateIso, locale)}
                </p>
              </div>
              <p className="shrink-0 font-brand text-lg font-bold text-ink-navy">{priceLabel}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
