import type { PriceVisibility } from "@toonexpo/contracts";

const COMPACT_MILLION = 1_000_000;
const COMPACT_THOUSAND = 1_000;

export type FormatPriceOptions = {
  amount: string | number | null | undefined;
  currency: string | null | undefined;
  locale: string;
  priceVisibility?: PriceVisibility | undefined;
  onRequestLabel: string;
  signInLabel?: string | undefined;
};

/**
 * Returns true when the catalog response omitted a numeric price for this viewer.
 */
export const isPriceHidden = (
  priceVisibility: PriceVisibility | undefined,
  amount: string | number | null | undefined,
): boolean => {
  if (amount == null || amount === "") {
    return true;
  }

  if (!priceVisibility) {
    return false;
  }

  // API already nulls hidden prices; a non-null amount means this viewer may see it.
  return false;
};

/**
 * Picks the UX label when price is not shown: sign-in CTA vs on-request.
 */
export const resolveHiddenPriceLabel = (options: {
  priceVisibility: PriceVisibility | undefined;
  onRequestLabel: string;
  signInLabel: string;
}): string => {
  if (options.priceVisibility === "visible_after_login") {
    return options.signInLabel;
  }

  return options.onRequestLabel;
};

const toNumber = (amount: string | number): number | null => {
  const value = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(value) ? value : null;
};

/**
 * Formats a catalog price for display, or returns the hidden-price label.
 */
export const formatCatalogPrice = (options: FormatPriceOptions): string => {
  const {
    amount,
    currency,
    locale,
    priceVisibility,
    onRequestLabel,
    signInLabel,
  } = options;

  if (isPriceHidden(priceVisibility, amount) || amount == null) {
    return resolveHiddenPriceLabel({
      priceVisibility,
      onRequestLabel,
      signInLabel: signInLabel ?? onRequestLabel,
    });
  }

  const value = toNumber(amount);
  if (value == null) {
    return onRequestLabel;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency && currency.length === 3 ? currency : "AMD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString(locale)} ${currency ?? ""}`.trim();
  }
};

/**
 * Formats a compact “from …” price for project cards (e.g. 61.5M AMD).
 */
export const formatCompactPrice = (options: {
  amount: string | number | null | undefined;
  currency: string | null | undefined;
  locale: string;
  fromLabel: string;
  onRequestLabel: string;
}): string => {
  const { amount, currency, locale, fromLabel, onRequestLabel } = options;

  if (amount == null || amount === "") {
    return onRequestLabel;
  }

  const value = toNumber(amount);
  if (value == null) {
    return onRequestLabel;
  }

  let compact: string;
  if (value >= COMPACT_MILLION) {
    const millions = value / COMPACT_MILLION;
    compact = `${millions.toLocaleString(locale, {
      maximumFractionDigits: 1,
    })}M`;
  } else if (value >= COMPACT_THOUSAND) {
    const thousands = value / COMPACT_THOUSAND;
    compact = `${thousands.toLocaleString(locale, {
      maximumFractionDigits: 0,
    })}K`;
  } else {
    compact = value.toLocaleString(locale, { maximumFractionDigits: 0 });
  }

  const currencyPart = currency ? ` ${currency}` : "";
  return `${fromLabel} ${compact}${currencyPart}`;
};

/**
 * Formats a min–max price range for project cards.
 */
export const formatPriceRange = (options: {
  minPrice: string | null;
  maxPrice: string | null;
  currency: string | null;
  locale: string;
  onRequestLabel: string;
}): string => {
  const { minPrice, maxPrice, currency, locale, onRequestLabel } = options;

  if (minPrice == null && maxPrice == null) {
    return onRequestLabel;
  }

  const formatOne = (amount: string | null): string | null => {
    if (amount == null) {
      return null;
    }
    return formatCatalogPrice({
      amount,
      currency,
      locale,
      priceVisibility: "public",
      onRequestLabel,
    });
  };

  const min = formatOne(minPrice);
  const max = formatOne(maxPrice);

  if (min && max && min !== max) {
    return `${min} – ${max}`;
  }

  return min ?? max ?? onRequestLabel;
};
