'use client';

import type { PublicMortgageOfferItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';

import { MortgageLoanSlider } from '@/features/mortgage/components/mortgage-loan-slider';
import { MortgageOfferCard } from '@/features/mortgage/components/mortgage-offer-card';
import { MortgagePrequalifyCta } from '@/features/mortgage/components/mortgage-prequalify-cta';
import { MortgageResultsPanel } from '@/features/mortgage/components/mortgage-results-panel';
import {
  MORTGAGE_SLIDER_DOWN_PAYMENT_MAX_PERCENT,
  MORTGAGE_SLIDER_DOWN_PAYMENT_STEP,
  MORTGAGE_SLIDER_PROPERTY_PRICE_MAX,
  MORTGAGE_SLIDER_PROPERTY_PRICE_MIN,
  MORTGAGE_SLIDER_PROPERTY_PRICE_STEP,
} from '@/features/mortgage/constants';
import { useMortgageCalculator } from '@/features/mortgage/hooks/use-mortgage-calculator';
import { estimateMortgagePayment } from '@/features/mortgage/utils/estimate-monthly-payment';
import { formatMortgageAmount } from '@/features/mortgage/utils/format-mortgage-amount';
import { cn } from '@/shared/ui/cn';

type MortgageCalculatorSectionProps = {
  offers: PublicMortgageOfferItem[];
};

/**
 * Two-column loan card + partner offers — Figma `105:2573` / Lovable mortgage.
 */
export const MortgageCalculatorSection = ({ offers }: MortgageCalculatorSectionProps) => {
  const t = useTranslations('Mortgage.calculator');
  const locale = useLocale();
  const {
    selectedOffer,
    selectedOfferId,
    propertyPrice,
    downPaymentPercent,
    downPaymentAmount,
    loanTermYears,
    termAdjustedHint,
    validationMessage,
    monthlyPaymentByOffer,
    handlePropertyPriceChange,
    handleDownPaymentPercentChange,
    handleSelectOffer,
    setLoanTermYears,
    setTermAdjustedHint,
  } = useMortgageCalculator({ offers });

  const lowestRateOfferId = useMemo(() => {
    let bestId: string | null = null;
    let bestRate = Number.POSITIVE_INFINITY;
    for (const offer of offers) {
      const rate = Number(offer.rate);
      if (Number.isFinite(rate) && rate < bestRate) {
        bestRate = rate;
        bestId = offer.id;
      }
    }
    return bestId;
  }, [offers]);

  const parsedPrice = Number(propertyPrice.replace(/\s/g, ''));
  const parsedDownPercent = Number(downPaymentPercent);
  const parsedDownAmount = Number(downPaymentAmount.replace(/\s/g, ''));
  const minDownPercent = selectedOffer ? Number(selectedOffer.minDownPaymentPercent) : 0;

  const liveEstimate = useMemo(() => {
    if (!selectedOffer || loanTermYears == null || validationMessage != null) {
      return null;
    }
    return estimateMortgagePayment({
      propertyPrice: parsedPrice,
      downPaymentPercent: parsedDownPercent,
      annualRatePercent: Number(selectedOffer.rate),
      loanTermYears,
    });
  }, [
    selectedOffer,
    loanTermYears,
    validationMessage,
    parsedPrice,
    parsedDownPercent,
  ]);

  const priceSliderValue = Number.isFinite(parsedPrice)
    ? Math.min(
        MORTGAGE_SLIDER_PROPERTY_PRICE_MAX,
        Math.max(MORTGAGE_SLIDER_PROPERTY_PRICE_MIN, parsedPrice),
      )
    : MORTGAGE_SLIDER_PROPERTY_PRICE_MIN;

  const downSliderValue = Number.isFinite(parsedDownPercent)
    ? Math.min(
        MORTGAGE_SLIDER_DOWN_PAYMENT_MAX_PERCENT,
        Math.max(minDownPercent, parsedDownPercent),
      )
    : minDownPercent;

  if (!selectedOffer) {
    return null;
  }

  return (
    <div
      id="calculator"
      className="grid scroll-mt-28 gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-12"
    >
      <aside className="rounded-[24px] bg-surface-elevated p-8 shadow-[0_0_0_1px_var(--color-header-border)] lg:sticky lg:top-24">
        <h2 className="font-brand text-xl font-bold tracking-tight text-ink-navy">
          {t('inputsTitle')}
        </h2>

        <LoanField
          label={t('propertyPrice')}
          valueLabel={
            Number.isFinite(parsedPrice) && parsedPrice > 0
              ? formatMortgageAmount(parsedPrice, locale)
              : '—'
          }
        >
          <MortgageLoanSlider
            id="propertyPrice"
            label={t('propertyPrice')}
            min={MORTGAGE_SLIDER_PROPERTY_PRICE_MIN}
            max={MORTGAGE_SLIDER_PROPERTY_PRICE_MAX}
            step={MORTGAGE_SLIDER_PROPERTY_PRICE_STEP}
            value={priceSliderValue}
            onChange={(value) => {
              handlePropertyPriceChange(String(value));
            }}
          />
        </LoanField>

        <LoanField
          label={t('downPayment')}
          valueLabel={
            Number.isFinite(parsedDownPercent) && Number.isFinite(parsedDownAmount)
              ? `${parsedDownPercent.toFixed(0)}% · ${formatMortgageAmount(parsedDownAmount, locale)}`
              : '—'
          }
        >
          <MortgageLoanSlider
            id="downPaymentPercent"
            label={t('downPaymentPercent')}
            min={minDownPercent}
            max={MORTGAGE_SLIDER_DOWN_PAYMENT_MAX_PERCENT}
            step={MORTGAGE_SLIDER_DOWN_PAYMENT_STEP}
            value={downSliderValue}
            onChange={(value) => {
              handleDownPaymentPercentChange(String(value));
            }}
          />
        </LoanField>
        {validationMessage ? <p className="mt-1 text-xs text-danger">{validationMessage}</p> : null}

        <LoanField
          label={t('loanTerm')}
          valueLabel={loanTermYears != null ? t('termYears', { years: loanTermYears }) : '—'}
        >
          <div className="mt-3 grid grid-cols-3 gap-2">
            {selectedOffer.termOptionsYears.map((years) => {
              const active = loanTermYears === years;
              return (
                <button
                  key={years}
                  type="button"
                  onClick={() => {
                    setTermAdjustedHint(null);
                    setLoanTermYears(years);
                  }}
                  className={cn(
                    'inline-flex h-9 items-center justify-center rounded-[15px] text-sm font-semibold',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
                    active
                      ? 'bg-brand-deep text-on-dark'
                      : 'bg-band-mist text-ink-navy hover:bg-band-mist/80',
                  )}
                >
                  {t('termShort', { years })}
                </button>
              );
            })}
          </div>
        </LoanField>
        {termAdjustedHint ? <p className="mt-2 text-xs text-warning">{termAdjustedHint}</p> : null}

        <div className="mt-8">
          <MortgageResultsPanel
            estimate={liveEstimate}
            bankName={selectedOffer.bank.name}
            hasValidationError={validationMessage != null}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <h2 className="font-brand text-2xl font-bold tracking-tight text-ink-navy">
          {t('offersTitle')}
        </h2>
        <div className="flex flex-col gap-4">
          {offers.map((offer) => (
            <MortgageOfferCard
              key={offer.id}
              offer={offer}
              selected={offer.id === selectedOfferId}
              monthlyPayment={monthlyPaymentByOffer.get(offer.id) ?? null}
              showLowestRateBadge={offer.id === lowestRateOfferId}
              onSelect={() => {
                handleSelectOffer(offer.id);
              }}
            />
          ))}
        </div>
        <MortgagePrequalifyCta bankName={selectedOffer.bank.name} />
      </div>
    </div>
  );
};

const LoanField = ({
  label,
  valueLabel,
  children,
}: {
  label: string;
  valueLabel: string;
  children: ReactNode;
}) => (
  <div className="mt-7 border-b border-header-border/60 pb-5 last:border-b-0">
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-[10px] font-bold tracking-widest text-header-muted uppercase">
        {label}
      </span>
      <span className="min-w-0 text-right font-brand text-lg font-bold text-ink-navy tabular-nums">
        {valueLabel}
      </span>
    </div>
    {children}
  </div>
);
