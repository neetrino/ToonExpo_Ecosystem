"use client";

import { useTranslations } from "next-intl";

import { MortgageCalculatorSection } from "@/features/mortgage/components/mortgage-calculator-section";
import { usePublicMortgageOffersQuery } from "@/features/mortgage/hooks/use-public-mortgage";

/**
 * Public mortgage page content: offers list and calculator.
 */
export const MortgagePageContent = () => {
  const t = useTranslations("Mortgage");
  const query = usePublicMortgageOffersQuery();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const offers = query.data.data;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </header>

      {offers.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <MortgageCalculatorSection offers={offers} />
      )}
    </div>
  );
};
