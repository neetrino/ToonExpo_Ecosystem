import type { PriceVisibility } from '@toonexpo/contracts';

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
  if (amount == null || amount === '') {
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
  if (options.priceVisibility === 'visible_after_login') {
    return options.signInLabel;
  }

  return options.onRequestLabel;
};

const toNumber = (amount: string | number): number | null => {
  const value = typeof amount === 'number' ? amount : Number(amount);
  return Number.isFinite(value) ? value : null;
};

/**
 * SSR/client-safe decimal string (always `.`, Latin digits).
 * Avoids ICU locale mismatches that cause React hydration errors
 * (e.g. Node `hy` → `51,5` vs Chrome `hy` → `51.5`).
 */
const formatInvariantDecimal = (value: number, maxFractionDigits: number): string => {
  const factor = 10 ** maxFractionDigits;
  const rounded = Math.round(value * factor) / factor;

  if (maxFractionDigits === 0 || Number.isInteger(rounded)) {
    return String(Math.trunc(rounded));
  }

  return rounded.toFixed(maxFractionDigits).replace(/\.?0+$/, '');
};

/**
 * SSR/client-safe currency amount (fixed en-US + Latin digits).
 */
const formatInvariantCurrency = (value: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
      numberingSystem: 'latn',
    }).format(value);
  } catch {
    return `${formatInvariantDecimal(value, 0)} ${currencyCode}`.trim();
  }
};

/**
 * Formats a catalog price for display, or returns the hidden-price label.
 */
export const formatCatalogPrice = (options: FormatPriceOptions): string => {
  const { amount, currency, priceVisibility, onRequestLabel, signInLabel } = options;

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

  const currencyCode = currency && currency.length === 3 ? currency : 'AMD';
  return formatInvariantCurrency(value, currencyCode);
};

/**
 * Formats a compact “from …” price for project cards (e.g. 61.5M AMD).
 * Magnitude uses invariant decimals so SSR and the browser always match.
 */
export const formatCompactPrice = (options: {
  amount: string | number | null | undefined;
  currency: string | null | undefined;
  locale: string;
  fromLabel: string;
  onRequestLabel: string;
}): string => {
  const { amount, currency, fromLabel, onRequestLabel } = options;

  if (amount == null || amount === '') {
    return onRequestLabel;
  }

  const value = toNumber(amount);
  if (value == null) {
    return onRequestLabel;
  }

  let compact: string;
  if (value >= COMPACT_MILLION) {
    compact = `${formatInvariantDecimal(value / COMPACT_MILLION, 1)}M`;
  } else if (value >= COMPACT_THOUSAND) {
    compact = `${formatInvariantDecimal(value / COMPACT_THOUSAND, 0)}K`;
  } else {
    compact = formatInvariantDecimal(value, 0);
  }

  const currencyPart = currency ? ` ${currency}` : '';
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
      priceVisibility: 'public',
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
