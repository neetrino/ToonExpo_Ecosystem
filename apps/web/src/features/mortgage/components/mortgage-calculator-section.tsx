"use client";

import type { PublicMortgageOfferItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { MortgageOfferCard } from "@/features/mortgage/components/mortgage-offer-card";
import { MortgageResultsPanel } from "@/features/mortgage/components/mortgage-results-panel";
import { useMortgageCalculator } from "@/features/mortgage/hooks/use-mortgage-calculator";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type MortgageCalculatorSectionProps = {
  offers: PublicMortgageOfferItem[];
};

/**
 * Interactive mortgage calculator with synced down payment fields and debounced API.
 */
export const MortgageCalculatorSection = ({
  offers,
}: MortgageCalculatorSectionProps) => {
  const t = useTranslations("Mortgage.calculator");
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

  if (!selectedOffer) {
    return null;
  }

  const resultsPanel = (
    <MortgageResultsPanel
      result={calculationResult}
      selectedTermYears={loanTermYears}
      isCalculating={isCalculating}
      hasValidationError={validationMessage != null}
    />
  );

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
      <div className="order-1 lg:hidden">{resultsPanel}</div>

      <section className="order-2 flex flex-col gap-4 lg:order-1">
        <h2 className="text-base font-semibold text-ink">{t("inputsTitle")}</h2>

        <FormField id="propertyPrice" label={t("propertyPrice")}>
          <Input
            id="propertyPrice"
            inputMode="numeric"
            value={propertyPrice}
            onChange={(event) => {
              handlePropertyPriceChange(event.target.value);
            }}
            placeholder={t("propertyPricePlaceholder")}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="downPaymentPercent"
            label={t("downPaymentPercent")}
            error={validationMessage ?? undefined}
          >
            <Input
              id="downPaymentPercent"
              inputMode="decimal"
              value={downPaymentPercent}
              onChange={(event) => {
                handleDownPaymentPercentChange(event.target.value);
              }}
            />
          </FormField>
          <FormField id="downPaymentAmount" label={t("downPaymentAmount")}>
            <Input
              id="downPaymentAmount"
              inputMode="numeric"
              value={downPaymentAmount}
              onChange={(event) => {
                handleDownPaymentAmountChange(event.target.value);
              }}
            />
          </FormField>
        </div>

        <FormField id="loanTermYears" label={t("loanTerm")}>
          <select
            id="loanTermYears"
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
            value={loanTermYears ?? ""}
            onChange={(event) => {
              setTermAdjustedHint(null);
              setLoanTermYears(Number(event.target.value));
            }}
          >
            {selectedOffer.termOptionsYears.map((term) => (
              <option key={term} value={term}>
                {t("termYears", { years: term })}
              </option>
            ))}
          </select>
          {termAdjustedHint ? (
            <p className="mt-1 text-xs text-warning">{termAdjustedHint}</p>
          ) : null}
        </FormField>

        <div className="hidden lg:block">{resultsPanel}</div>
      </section>

      <section className="order-3 flex flex-col gap-3 lg:order-2">
        <h2 className="text-base font-semibold text-ink">{t("offersTitle")}</h2>
        <div className="flex flex-col gap-3">
          {offers.map((offer) => (
            <MortgageOfferCard
              key={offer.id}
              offer={offer}
              selected={offer.id === selectedOfferId}
              monthlyPayment={monthlyPaymentByOffer.get(offer.id) ?? null}
              onSelect={() => {
                handleSelectOffer(offer.id);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
