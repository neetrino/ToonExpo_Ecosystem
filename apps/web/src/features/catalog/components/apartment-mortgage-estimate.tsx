'use client';

import type { PriceVisibility } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';

/** Figma estimate assumptions (`89:825`). */
const ESTIMATE_APR_PERCENT = 5.92;
const ESTIMATE_DOWN_PAYMENT_PERCENT = 20;
const ESTIMATE_TERM_YEARS = 30;
const MONTHS_PER_YEAR = 12;
const PERCENT_DIVISOR = 100;

type ApartmentMortgageEstimateProps = {
  apartmentId: string;
  amount: string | null;
  priceVisibility: PriceVisibility;
};

/**
 * Soft mortgage teaser under the inquire card — Figma `89:825`.
 */
export const ApartmentMortgageEstimate = ({
  apartmentId,
  amount,
  priceVisibility,
}: ApartmentMortgageEstimateProps) => {
  const t = useTranslations('Catalog.apartment');
  const locale = useLocale();
  const overlay = usePriceOverlay().getApartmentPrice(apartmentId);
  const effectiveAmount = amount ?? overlay?.price ?? null;
  const price = effectiveAmount != null ? Number(effectiveAmount) : null;

  if (price == null || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  const monthlyAmd = estimateMonthlyPaymentAmd(price);
  // Monthly is computed from AMD listing price; locale FX runs inside formatCatalogPrice.
  const monthlyLabel = formatCatalogPrice({
    amount: monthlyAmd,
    currency: 'AMD',
    locale,
    priceVisibility,
    onRequestLabel: '—',
    signInLabel: '—',
  });

  return (
    <div className="rounded-[20px] bg-band-mist/40 p-5 text-sm">
      <p className="text-sm font-semibold text-brand-deep">{t('mortgageEstimateLabel')}</p>
      <p className="mt-1.5 font-brand text-2xl font-bold leading-[30px] text-ink-navy">
        {t('mortgageEstimateMonthly', { amount: monthlyLabel })}
      </p>
      <p className="mt-1.5 text-xs leading-[15px] text-header-muted">
        {t('mortgageEstimateTerms')}
      </p>
      <Link
        href="/mortgage"
        className="mt-3.5 inline-block text-xs font-semibold leading-[15px] text-brand-secondary hover:underline"
      >
        {t('mortgageEstimateCta')}
      </Link>
    </div>
  );
};

const estimateMonthlyPaymentAmd = (propertyPriceAmd: number): number => {
  const downPayment = Math.round(
    (propertyPriceAmd * ESTIMATE_DOWN_PAYMENT_PERCENT) / PERCENT_DIVISOR,
  );
  const loanAmount = propertyPriceAmd - downPayment;
  if (loanAmount <= 0) {
    return 0;
  }

  const numberOfPayments = ESTIMATE_TERM_YEARS * MONTHS_PER_YEAR;
  const monthlyRate = ESTIMATE_APR_PERCENT / PERCENT_DIVISOR / MONTHS_PER_YEAR;
  const factor = (1 + monthlyRate) ** numberOfPayments;
  const rawMonthly = (loanAmount * monthlyRate * factor) / (factor - 1);
  return Math.round(rawMonthly);
};
