"use client";

import type { PublicMortgageOfferItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { MortgageOfferCard } from "@/features/mortgage/components/mortgage-offer-card";
import { MortgageResultsPanel } from "@/features/mortgage/components/mortgage-results-panel";
import { MORTGAGE_CALCULATOR_DEBOUNCE_MS } from "@/features/mortgage/constants";
import { useMortgageCalculateMutation } from "@/features/mortgage/hooks/use-public-mortgage";
import { mortgageCalculatorSchema } from "@/features/mortgage/schemas/mortgage-calculator.schema";
import { pickNearestLoanTerm } from "@/features/mortgage/utils/mortgage-term";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type MortgageCalculatorSectionProps = {
  offers: PublicMortgageOfferItem[];
};

type DownPaymentField = "percent" | "amount";

const DEFAULT_TERM_YEARS = 20;

/**
 * Interactive mortgage calculator with synced down payment fields and debounced API.
 */
export const MortgageCalculatorSection = ({
  offers,
}: MortgageCalculatorSectionProps) => {
  const t = useTranslations("Mortgage.calculator");
  const { mutate, data, isPending } = useMortgageCalculateMutation();

  const [selectedOfferId, setSelectedOfferId] = useState(offers[0]?.id ?? "");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPaymentPercent, setDownPaymentPercent] = useState("");
  const [downPaymentAmount, setDownPaymentAmount] = useState("");
  const [loanTermYears, setLoanTermYears] = useState<number | null>(null);
  const [termAdjustedHint, setTermAdjustedHint] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const lastDownPaymentField = useRef<DownPaymentField>("percent");

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? offers[0],
    [offers, selectedOfferId],
  );

  useEffect(() => {
    if (!selectedOffer) {
      return;
    }

    const minPercent = Number(selectedOffer.minDownPaymentPercent);
    if (downPaymentPercent === "") {
      setDownPaymentPercent(String(minPercent));
    }

    const defaultTerm =
      selectedOffer.termOptionsYears[selectedOffer.termOptionsYears.length - 1] ??
      DEFAULT_TERM_YEARS;

    setLoanTermYears((current) => {
      if (current == null) {
        return defaultTerm;
      }
      const nearest = pickNearestLoanTerm(current, selectedOffer.termOptionsYears);
      if (nearest !== current) {
        setTermAdjustedHint(t("termAdjusted", { years: nearest }));
      }
      return nearest;
    });
  }, [selectedOffer, downPaymentPercent, t]);

  const parsedPropertyPrice = Number(propertyPrice.replace(/\s/g, ""));
  const parsedDownPaymentPercent = Number(downPaymentPercent);

  const syncDownPaymentFromPercent = (price: number, percent: number) => {
    const amount = Math.round((price * percent) / 100);
    setDownPaymentAmount(amount > 0 ? String(amount) : "");
  };

  const syncDownPaymentFromAmount = (price: number, amount: number) => {
    if (price <= 0) {
      return;
    }
    const percent = (amount / price) * 100;
    setDownPaymentPercent(percent.toFixed(2).replace(/\.?0+$/, ""));
  };

  const handlePropertyPriceChange = (value: string) => {
    setPropertyPrice(value);
    const price = Number(value.replace(/\s/g, ""));
    if (!Number.isFinite(price) || price <= 0) {
      return;
    }
    if (lastDownPaymentField.current === "percent") {
      const percent = Number(downPaymentPercent);
      if (Number.isFinite(percent)) {
        syncDownPaymentFromPercent(price, percent);
      }
    } else {
      const amount = Number(downPaymentAmount.replace(/\s/g, ""));
      if (Number.isFinite(amount)) {
        syncDownPaymentFromAmount(price, amount);
      }
    }
  };

  const handleDownPaymentPercentChange = (value: string) => {
    lastDownPaymentField.current = "percent";
    setDownPaymentPercent(value);
    const price = Number(propertyPrice.replace(/\s/g, ""));
    const percent = Number(value);
    if (Number.isFinite(price) && price > 0 && Number.isFinite(percent)) {
      syncDownPaymentFromPercent(price, percent);
    }
  };

  const handleDownPaymentAmountChange = (value: string) => {
    lastDownPaymentField.current = "amount";
    setDownPaymentAmount(value);
    const price = Number(propertyPrice.replace(/\s/g, ""));
    const amount = Number(value.replace(/\s/g, ""));
    if (Number.isFinite(price) && price > 0 && Number.isFinite(amount)) {
      syncDownPaymentFromAmount(price, amount);
    }
  };

  const handleSelectOffer = (offerId: string) => {
    const offer = offers.find((item) => item.id === offerId);
    if (!offer) {
      return;
    }

    setSelectedOfferId(offerId);
    setTermAdjustedHint(null);

    const minPercent = Number(offer.minDownPaymentPercent);
    setDownPaymentPercent(String(minPercent));

    const price = Number(propertyPrice.replace(/\s/g, ""));
    if (Number.isFinite(price) && price > 0) {
      syncDownPaymentFromPercent(price, minPercent);
    }

    setLoanTermYears((current) => {
      const base = current ?? offer.termOptionsYears[0] ?? DEFAULT_TERM_YEARS;
      const nearest = pickNearestLoanTerm(base, offer.termOptionsYears);
      if (current != null && nearest !== current) {
        setTermAdjustedHint(t("termAdjusted", { years: nearest }));
      }
      return nearest;
    });
  };

  useEffect(() => {
    if (!selectedOffer || loanTermYears == null) {
      return;
    }

    const validation = mortgageCalculatorSchema.safeParse({
      propertyPrice: parsedPropertyPrice,
      downPaymentPercent: parsedDownPaymentPercent,
      loanTermYears,
      bankOfferId: selectedOffer.id,
      minDownPaymentPercent: Number(selectedOffer.minDownPaymentPercent),
      termOptionsYears: selectedOffer.termOptionsYears,
    });

    if (!validation.success) {
      setValidationMessage(
        resolveValidationMessage(validation.error.issues[0]?.message, t),
      );
      return;
    }

    setValidationMessage(null);

    const timer = window.setTimeout(() => {
      mutate({
        propertyPrice: parsedPropertyPrice,
        downPaymentPercent: parsedDownPaymentPercent,
        loanTermYears,
        bankOfferId: selectedOffer.id,
      });
    }, MORTGAGE_CALCULATOR_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    selectedOffer,
    parsedPropertyPrice,
    parsedDownPaymentPercent,
    loanTermYears,
    mutate,
    t,
  ]);

  const monthlyPaymentByOffer = useMemo(() => {
    const map = new Map<string, number>();
    if (data && selectedOfferId) {
      map.set(selectedOfferId, data.monthlyPayment);
    }
    return map;
  }, [data, selectedOfferId]);

  if (!selectedOffer) {
    return null;
  }

  const resultsPanel = (
    <MortgageResultsPanel
      result={data ?? null}
      selectedTermYears={loanTermYears}
      isCalculating={isPending}
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

const resolveValidationMessage = (
  code: string | undefined,
  t: (key: string) => string,
): string | null => {
  if (code === "downPaymentBelowMinimum") {
    return t("validation.downPaymentBelowMinimum");
  }
  if (code === "invalidTerm") {
    return t("validation.invalidTerm");
  }
  return t("validation.invalid");
};
