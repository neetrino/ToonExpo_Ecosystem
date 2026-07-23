'use client';

import type { PublicMortgageOfferItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';

import { MortgageOfferCard } from '@/features/mortgage/components/mortgage-offer-card';
import { MortgagePrequalifyCta } from '@/features/mortgage/components/mortgage-prequalify-cta';
import { MortgageResultsPanel } from '@/features/mortgage/components/mortgage-results-panel';
import { useMortgageCalculator } from '@/features/mortgage/hooks/use-mortgage-calculator';
import { cn } from '@/shared/ui/cn';

type MortgageCalculatorSectionProps = {
  offers: PublicMortgageOfferItem[];
};

/**
 * Two-column loan card + partner offers — Figma `105:2573`.
 */
export const MortgageCalculatorSection = ({ offers }: MortgageCalculatorSectionProps) => {
  const t = useTranslations('Mortgage.calculator');
  const {
    selectedOffer,
    selectedOfferId,
    propertyPrice,
    downPaymentPercent,
    downPaymentAmount,
    loanTermYears,
    termAdjustedHint,
    validationMessage,
    calculationResult,
    isCalculating,
    monthlyPaymentByOffer,
    handlePropertyPriceChange,
    handleDownPaymentPercentChange,
    handleDownPaymentAmountChange,
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

  if (!selectedOffer) {
    return null;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <aside className="rounded-[24px] bg-surface-elevated p-8 shadow-[0_0_0_1px_var(--color-header-border)]">
        <h2 className="font-brand text-xl font-bold tracking-tight text-ink-navy">
          {t('inputsTitle')}
        </h2>

        <LoanRow label={t('propertyPrice')} htmlFor="propertyPrice">
          <input
            id="propertyPrice"
            inputMode="numeric"
            value={propertyPrice}
            placeholder={t('propertyPricePlaceholder')}
            onChange={(event) => {
              handlePropertyPriceChange(event.target.value);
            }}
            className={valueInputClassName}
          />
        </LoanRow>

        <LoanRow label={t('downPayment')} htmlFor="downPaymentPercent">
          <div className="flex items-center justify-end gap-2">
            <input
              id="downPaymentPercent"
              inputMode="decimal"
              value={downPaymentPercent}
              onChange={(event) => {
                handleDownPaymentPercentChange(event.target.value);
              }}
              className={cn(valueInputClassName, 'w-14')}
              aria-label={t('downPaymentPercent')}
            />
            <span className="font-brand text-lg font-bold text-ink-navy">%</span>
            <span className="text-header-muted" aria-hidden>
              ·
            </span>
            <input
              id="downPaymentAmount"
              inputMode="numeric"
              value={downPaymentAmount}
              onChange={(event) => {
                handleDownPaymentAmountChange(event.target.value);
              }}
              className={cn(valueInputClassName, 'w-[7.5rem]')}
              aria-label={t('downPaymentAmount')}
            />
          </div>
        </LoanRow>
        {validationMessage ? <p className="mt-1 text-xs text-danger">{validationMessage}</p> : null}

        <LoanRow label={t('loanTerm')}>
          <span className="font-brand text-lg font-bold text-ink-navy">
            {loanTermYears != null ? t('termYears', { years: loanTermYears }) : '—'}
          </span>
        </LoanRow>

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
        {termAdjustedHint ? <p className="mt-2 text-xs text-warning">{termAdjustedHint}</p> : null}

        <div className="mt-8">
          <MortgageResultsPanel
            result={calculationResult}
            bankName={selectedOffer.bank.name}
            isCalculating={isCalculating}
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

const valueInputClassName = cn(
  'min-w-0 border-0 bg-transparent p-0 text-right',
  'font-brand text-lg font-bold text-ink-navy tabular-nums',
  'placeholder:font-medium placeholder:text-header-muted',
  'focus-visible:outline-none',
);

const LoanRow = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) => (
  <div className="mt-7 flex items-center justify-between gap-4 border-b border-header-border/60 pb-4">
    {htmlFor ? (
      <label
        htmlFor={htmlFor}
        className="shrink-0 text-[10px] font-bold tracking-widest text-header-muted uppercase"
      >
        {label}
      </label>
    ) : (
      <span className="shrink-0 text-[10px] font-bold tracking-widest text-header-muted uppercase">
        {label}
      </span>
    )}
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
