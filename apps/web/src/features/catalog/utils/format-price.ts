import type { PriceVisibility } from '@toonexpo/contracts';

import {
  convertAmdToDisplayAmount,
  displayCurrencyForLocale,
  type DisplayCurrency,
} from '@/features/catalog/utils/display-currency';

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
 * Groups an integer with a fixed separator (hydration-safe across Node/browser ICU).
 */
const formatGroupedInteger = (value: number, groupSeparator: string): string => {
  const digits = formatInvariantDecimal(value, 0);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
};

const formatDisplayAmount = (value: number, displayCurrency: DisplayCurrency): string => {
  if (displayCurrency === 'USD') {
    return `$${formatGroupedInteger(value, ',')}`;
  }
  if (displayCurrency === 'RUB') {
    return `${formatGroupedInteger(value, '\u00a0')} ₽`;
  }
  return `${formatGroupedInteger(value, '\u00a0')} ֏`;
};

/**
 * Formats a stored catalog amount for the active UI locale.
 * AMD prices convert to USD (en) or RUB (ru); hy stays AMD.
 */
const formatLocaleCurrency = (value: number, currencyCode: string, locale: string): string => {
  if (currencyCode === 'AMD') {
    const displayCurrency = displayCurrencyForLocale(locale);
    const displayAmount = convertAmdToDisplayAmount(value, displayCurrency);
    return formatDisplayAmount(displayAmount, displayCurrency);
  }

  const groupSeparator = displayCurrencyForLocale(locale) === 'USD' ? ',' : '\u00a0';
  return `${formatGroupedInteger(value, groupSeparator)} ${currencyCode}`;
};

/**
 * Formats a catalog price for display, or returns the hidden-price label.
 */
export const formatCatalogPrice = (options: FormatPriceOptions): string => {
  const { amount, currency, locale, priceVisibility, onRequestLabel, signInLabel } = options;

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
  return formatLocaleCurrency(value, currencyCode, locale);
};

/**
 * Formats a “from …” price for project cards with locale currency conversion.
 */
export const formatCompactPrice = (options: {
  amount: string | number | null | undefined;
  currency: string | null | undefined;
  locale: string;
  fromLabel: string;
  onRequestLabel: string;
}): string => {
  const { amount, currency, locale, fromLabel, onRequestLabel } = options;

  if (amount == null || amount === '') {
    return onRequestLabel;
  }

  const value = toNumber(amount);
  if (value == null) {
    return onRequestLabel;
  }

  const currencyCode = currency && currency.length === 3 ? currency : 'AMD';
  const amountLabel = formatLocaleCurrency(value, currencyCode, locale);
  return fromLabel.length > 0 ? `${fromLabel} ${amountLabel}` : amountLabel;
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
