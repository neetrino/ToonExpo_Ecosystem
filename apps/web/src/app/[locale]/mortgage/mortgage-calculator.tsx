'use client';

import { useMemo, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { formatPriceAmd } from '@/lib/catalog/format-price';
import { MONTHS_PER_YEAR, calculateMortgagePayment } from '@/lib/mortgage/calc';
import {
  DEFAULT_DOWN_PAYMENT_AMD,
  DEFAULT_MANUAL_RATE_PERCENT,
  DEFAULT_PROPERTY_PRICE_AMD,
  DEFAULT_TERM_YEARS,
} from '@/lib/mortgage/defaults';
import type { PublicBankOfferListing } from '@/lib/partners/queries';

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

function parsePositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePositiveFloat(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function MortgageCalculator({ offers, locale, labels }: MortgageCalculatorProps) {
  const defaultOffer = offers[0];
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(defaultOffer?.id ?? null);
  const [propertyPriceInput, setPropertyPriceInput] = useState(String(DEFAULT_PROPERTY_PRICE_AMD));
  const [downPaymentInput, setDownPaymentInput] = useState(String(DEFAULT_DOWN_PAYMENT_AMD));
  const [termYearsInput, setTermYearsInput] = useState(String(DEFAULT_TERM_YEARS));
  const [manualRateInput, setManualRateInput] = useState(String(DEFAULT_MANUAL_RATE_PERCENT));

  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId);
  const propertyPriceAmd = parsePositiveInt(propertyPriceInput, DEFAULT_PROPERTY_PRICE_AMD);
  const downPaymentAmd = parsePositiveInt(downPaymentInput, DEFAULT_DOWN_PAYMENT_AMD);
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

  return (
    <div className="catalog-mortgage">
      <section className="catalog-mortgage__calculator" aria-labelledby="mortgage-calculator-title">
        <h2 id="mortgage-calculator-title" className="catalog-section-title">
          {labels.title}
        </h2>

        <form className="catalog-mortgage__form" onSubmit={(event) => event.preventDefault()}>
          <label className="catalog-mortgage__field">
            <span>{labels.propertyPrice}</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={propertyPriceInput}
              onChange={(event) => setPropertyPriceInput(event.target.value)}
            />
          </label>

          <label className="catalog-mortgage__field">
            <span>{labels.downPayment}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={downPaymentInput}
              onChange={(event) => setDownPaymentInput(event.target.value)}
            />
          </label>

          <label className="catalog-mortgage__field">
            <span>{labels.termYears}</span>
            <input
              type="number"
              min={1}
              max={50}
              inputMode="numeric"
              value={termYearsInput}
              onChange={(event) => setTermYearsInput(event.target.value)}
            />
          </label>

          {!selectedOffer ? (
            <label className="catalog-mortgage__field">
              <span>{labels.manualRate}</span>
              <input
                type="number"
                min={0}
                step={0.1}
                inputMode="decimal"
                value={manualRateInput}
                onChange={(event) => setManualRateInput(event.target.value)}
              />
            </label>
          ) : (
            <p className="catalog-mortgage__selected-rate">
              {labels.interestRate}: {selectedOffer.interestRate}%
            </p>
          )}
        </form>

        <dl className="catalog-mortgage__results">
          <div>
            <dt>{labels.monthlyPayment}</dt>
            <dd className="catalog-mortgage__highlight">
              {formatPriceAmd(result.monthlyPaymentAmd, locale)}
            </dd>
          </div>
          <div>
            <dt>{labels.loanAmount}</dt>
            <dd>{formatPriceAmd(result.loanAmountAmd, locale)}</dd>
          </div>
          <div>
            <dt>{labels.totalPayment}</dt>
            <dd>{formatPriceAmd(result.totalPaymentAmd, locale)}</dd>
          </div>
          <div>
            <dt>{labels.overpayment}</dt>
            <dd>{formatPriceAmd(result.overpaymentAmd, locale)}</dd>
          </div>
        </dl>

        <p className="catalog-mortgage__disclaimer">{labels.disclaimer}</p>
      </section>

      <section className="catalog-mortgage__offers" aria-labelledby="mortgage-offers-title">
        <h2 id="mortgage-offers-title" className="catalog-section-title">
          {labels.offersTitle}
        </h2>

        {offers.length === 0 ? (
          <p className="catalog-empty">{labels.emptyOffers}</p>
        ) : (
          <ul className="catalog-mortgage__offer-list">
            {offers.map((offer) => {
              const isSelected = offer.id === selectedOfferId;
              const termYearsLabel = Math.round(offer.maxTermMonths / MONTHS_PER_YEAR);

              return (
                <li key={offer.id}>
                  <button
                    type="button"
                    className={
                      isSelected
                        ? 'catalog-mortgage-offer catalog-mortgage-offer--selected'
                        : 'catalog-mortgage-offer'
                    }
                    onClick={() => setSelectedOfferId(offer.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="catalog-mortgage-offer__header">
                      <div>
                        <p className="catalog-mortgage-offer__bank">{offer.partnerName}</p>
                        <h3 className="catalog-mortgage-offer__title">{offer.title}</h3>
                      </div>
                      {offer.featured ? (
                        <span className="catalog-badge catalog-badge--featured">
                          {labels.featured}
                        </span>
                      ) : null}
                    </div>
                    <p className="catalog-mortgage-offer__rate">
                      {offer.interestRate}% · {labels.maxTerm}: {termYearsLabel} {labels.yearsUnit}
                    </p>
                    {offer.description ? (
                      <p className="catalog-mortgage-offer__description">{offer.description}</p>
                    ) : null}
                    <Link
                      href={`/partners/${offer.partnerSlug}`}
                      className="catalog-mortgage-offer__bank-link"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {labels.viewBank}
                    </Link>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {offers.length > 0 ? (
          <button
            type="button"
            className="catalog-mortgage__manual-toggle"
            onClick={() => setSelectedOfferId(null)}
          >
            {labels.selectOffer}
          </button>
        ) : null}
      </section>
    </div>
  );
}
