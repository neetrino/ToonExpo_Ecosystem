import { formatCatalogPrice } from "@/features/catalog/utils/format-price";

/**
 * Formats AMD mortgage amounts using the catalog currency formatter.
 */
export const formatMortgageAmount = (
  amount: number,
  locale: string,
): string =>
  formatCatalogPrice({
    amount,
    currency: "AMD",
    locale,
    priceVisibility: "public",
    onRequestLabel: "—",
  });
