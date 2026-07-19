import type { ApartmentSalesStatus, Prisma } from "@toonexpo/db";

import { DEFAULT_CATALOG_CURRENCY } from "../catalog.constants.js";
import { decimalToString, shouldRevealPrice } from "./catalog.mapper.js";

type ApartmentPriceRow = {
  salesStatus: ApartmentSalesStatus;
  price: Prisma.Decimal | null;
  priceCurrency: string;
  priceVisibility: string;
};

/**
 * Aggregates min/max prices from apartments visible to the current viewer.
 */
export const aggregateVisiblePrices = (
  apartments: ApartmentPriceRow[],
  isAuthenticated: boolean,
): {
  minPrice: string | null;
  maxPrice: string | null;
  priceCurrency: string | null;
} => {
  const visiblePrices = apartments.filter(
    (apartment) =>
      shouldRevealPrice(apartment.priceVisibility, isAuthenticated) &&
      apartment.price != null,
  );

  if (visiblePrices.length === 0) {
    return { minPrice: null, maxPrice: null, priceCurrency: null };
  }

  let min = visiblePrices[0]?.price;
  let max = visiblePrices[0]?.price;

  for (const apartment of visiblePrices) {
    if (apartment.price == null) {
      continue;
    }
    if (min == null || apartment.price.lt(min)) {
      min = apartment.price;
    }
    if (max == null || apartment.price.gt(max)) {
      max = apartment.price;
    }
  }

  return {
    minPrice: decimalToString(min),
    maxPrice: decimalToString(max),
    priceCurrency: visiblePrices[0]?.priceCurrency ?? DEFAULT_CATALOG_CURRENCY,
  };
};
