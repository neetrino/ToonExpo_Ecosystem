"use client";

import type { MortgageCalculatorResult } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { formatMortgageAmount } from "@/features/mortgage/utils/format-mortgage-amount";

type MortgageResultsPanelProps = {
  result: MortgageCalculatorResult | null;
  selectedTermYears: number | null;
  isCalculating: boolean;
  hasValidationError: boolean;
};

/**
 * Displays mortgage calculator output or loading / validation states.
 */
export const MortgageResultsPanel = ({
  result,
  selectedTermYears,
  isCalculating,
  hasValidationError,
}: MortgageResultsPanelProps) => {
  const t = useTranslations("Mortgage.calculator");
  const locale = useLocale();

  if (hasValidationError) {
    return (
      <div className="rounded-sm border border-border bg-surface p-4">
        <p className="text-sm text-ink-secondary">{t("fixInputs")}</p>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="rounded-sm border border-border bg-surface p-4">
        <p className="text-sm text-ink-secondary">{t("calculating")}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-sm border border-border bg-surface p-4">
        <p className="text-sm text-ink-secondary">{t("enterInputs")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      <h2 className="text-base font-semibold text-ink">{t("resultsTitle")}</h2>
      <p className="mt-1 text-2xl font-bold text-brand">
        {formatMortgageAmount(result.monthlyPayment, locale)}
        <span className="ml-1 text-sm font-normal text-ink-muted">
          {t("perMonth")}
        </span>
      </p>
      <dl className="mt-4 grid gap-2 text-sm">
        <Row
          label={t("loanAmount")}
          value={formatMortgageAmount(result.loanAmount, locale)}
        />
        <Row
          label={t("downPayment")}
          value={formatMortgageAmount(result.downPaymentAmount, locale)}
        />
        <Row
          label={t("totalPayment")}
          value={formatMortgageAmount(result.totalPayment, locale)}
        />
        <Row
          label={t("totalInterest")}
          value={formatMortgageAmount(result.totalInterest, locale)}
        />
        <Row label={t("selectedBank")} value={result.offer.bankName} />
        <Row label={t("selectedRate")} value={`${result.offer.rate}%`} />
        {selectedTermYears != null ? (
          <Row
            label={t("selectedTerm")}
            value={t("termYears", { years: selectedTermYears })}
          />
        ) : null}
      </dl>
      <p className="mt-4 text-xs text-ink-muted">{t("disclaimer")}</p>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <dt className="text-ink-muted">{label}</dt>
    <dd className="font-medium text-ink">{value}</dd>
  </div>
);
