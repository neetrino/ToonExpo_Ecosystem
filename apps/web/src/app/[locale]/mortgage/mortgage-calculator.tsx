'use client';

import { useMemo, useState } from 'react';

import { MONTHS_PER_YEAR, calculateMortgagePayment } from '@/lib/mortgage/calc';
import {
  DEFAULT_MANUAL_RATE_PERCENT,
  DEFAULT_PROPERTY_PRICE_AMD,
  DEFAULT_TERM_YEARS,
} from '@/lib/mortgage/defaults';
import {
  MORTGAGE_INPUT_DEFAULTS,
  parsePositiveFloat,
  parsePositiveInt,
} from '@/lib/mortgage/input-parsers';
import type { PublicBankOfferListing } from '@/lib/partners/queries';

import { MortgageCalculatorForm } from './mortgage-calculator-form';
import { MortgageCalculatorResults } from './mortgage-calculator-results';
import { MortgageOffersSection } from './mortgage-offers-section';

type MortgageCalculatorLabels = {
  title: string;
  propertyPrice: string;
  downPayment: string;
  termYears: string;
  interestRate: string;
  manualRate: string;
  monthlyPayment: string;
  loanAmount: string;
  totalPayment: string;
  overpayment: string;
  disclaimer: string;
  offersTitle: string;
  featured: string;
  maxTerm: string;
  viewBank: string;
  emptyOffers: string;
  selectOffer: string;
  yearsUnit: string;
};

type MortgageCalculatorProps = {
  offers: PublicBankOfferListing[];
  locale: string;
  labels: MortgageCalculatorLabels;
};

function useMortgageInputs(
  offers: PublicBankOfferListing[],
  labels: Pick<MortgageCalculatorLabels, 'interestRate'>,
) {
  const defaultOffer = offers[0];
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(defaultOffer?.id ?? null);
  const [propertyPriceInput, setPropertyPriceInput] = useState(
    MORTGAGE_INPUT_DEFAULTS.propertyPrice,
  );
  const [downPaymentInput, setDownPaymentInput] = useState(MORTGAGE_INPUT_DEFAULTS.downPayment);
  const [termYearsInput, setTermYearsInput] = useState(MORTGAGE_INPUT_DEFAULTS.termYears);
  const [manualRateInput, setManualRateInput] = useState(MORTGAGE_INPUT_DEFAULTS.manualRate);

  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId);
  const propertyPriceAmd = parsePositiveInt(propertyPriceInput, DEFAULT_PROPERTY_PRICE_AMD);
  const downPaymentAmd = parsePositiveInt(downPaymentInput, 0);
  const termYears = parsePositiveInt(termYearsInput, DEFAULT_TERM_YEARS);
  const termMonths = termYears * MONTHS_PER_YEAR;
  const annualRate = selectedOffer
    ? selectedOffer.interestRate
    : parsePositiveFloat(manualRateInput, DEFAULT_MANUAL_RATE_PERCENT);

  const result = useMemo(
    () =>
      calculateMortgagePayment({
        propertyPriceAmd,
        downPaymentAmd,
        termMonths,
        annualInterestRatePercent: annualRate,
      }),
    [propertyPriceAmd, downPaymentAmd, termMonths, annualRate],
  );

  const selectedRateLabel = selectedOffer
    ? `${labels.interestRate}: ${selectedOffer.interestRate}%`
    : null;

  return {
    result,
    selectedOfferId,
    setSelectedOfferId,
    propertyPriceInput,
    downPaymentInput,
    termYearsInput,
    manualRateInput,
    selectedRateLabel,
    setPropertyPriceInput,
    setDownPaymentInput,
    setTermYearsInput,
    setManualRateInput,
  };
}

export function MortgageCalculator({ offers, locale, labels }: MortgageCalculatorProps) {
  const inputs = useMortgageInputs(offers, labels);

  return (
    <div className="catalog-mortgage">
      <section className="catalog-mortgage__calculator" aria-labelledby="mortgage-calculator-title">
        <h2 id="mortgage-calculator-title" className="catalog-section-title">
          {labels.title}
        </h2>

        <MortgageCalculatorForm
          labels={labels}
          propertyPriceInput={inputs.propertyPriceInput}
          downPaymentInput={inputs.downPaymentInput}
          termYearsInput={inputs.termYearsInput}
          manualRateInput={inputs.manualRateInput}
          selectedRateLabel={inputs.selectedRateLabel}
          onPropertyPriceChange={inputs.setPropertyPriceInput}
          onDownPaymentChange={inputs.setDownPaymentInput}
          onTermYearsChange={inputs.setTermYearsInput}
          onManualRateChange={inputs.setManualRateInput}
        />

        <MortgageCalculatorResults
          result={inputs.result}
          locale={locale}
          labels={labels}
          disclaimer={labels.disclaimer}
        />
      </section>

      <MortgageOffersSection
        offers={offers}
        selectedOfferId={inputs.selectedOfferId}
        labels={labels}
        onSelectOffer={inputs.setSelectedOfferId}
        onClearSelection={() => inputs.setSelectedOfferId(null)}
      />
    </div>
  );
}
