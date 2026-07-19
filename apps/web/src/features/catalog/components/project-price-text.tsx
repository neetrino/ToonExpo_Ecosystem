"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePriceOverlay } from "@/features/catalog/components/price-overlay-scope";
import {
  formatCompactPrice,
  formatPriceRange,
} from "@/features/catalog/utils/format-price";

type ProjectPriceTextProps = {
  projectId: string;
  minPrice: string | null;
  maxPrice: string | null;
  priceCurrency: string | null;
  variant: "from" | "range";
};

/**
 * Project price summary text (hero "from …" or min–max range).
 * SSR shows the anonymous cached range; the authenticated overlay widens it
 * with `visible_after_login` prices after hydration.
 */
export const ProjectPriceText = ({
  projectId,
  minPrice,
  maxPrice,
  priceCurrency,
  variant,
}: ProjectPriceTextProps) => {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  const overlay = usePriceOverlay().getProjectRange(projectId);
  const effective = overlay ?? { minPrice, maxPrice, priceCurrency };

  if (variant === "from") {
    return (
      <>
        {formatCompactPrice({
          amount: effective.minPrice,
          currency: effective.priceCurrency,
          locale,
          fromLabel: t("price.from"),
          onRequestLabel: t("price.onRequest"),
        })}
      </>
    );
  }

  return (
    <>
      {formatPriceRange({
        minPrice: effective.minPrice,
        maxPrice: effective.maxPrice,
        currency: effective.priceCurrency,
        locale,
        onRequestLabel: t("price.onRequest"),
      })}
    </>
  );
};
