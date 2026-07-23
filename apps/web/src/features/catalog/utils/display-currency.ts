/**
 * Display FX for locale-based catalog prices.
 * Source of truth in DB remains AMD; UI converts for en→USD and ru→RUB.
 *
 * Override via env (AMD per 1 foreign unit):
 * - NEXT_PUBLIC_FX_AMD_PER_USD
 * - NEXT_PUBLIC_FX_AMD_PER_RUB
 */

/** Approximate AMD per 1 USD — display-only until live FX is wired. */
const DEFAULT_AMD_PER_USD = 390;

/** Approximate AMD per 1 RUB — display-only until live FX is wired. */
const DEFAULT_AMD_PER_RUB = 4;

export type DisplayCurrency = 'AMD' | 'USD' | 'RUB';

const resolveBaseLocale = (locale: string): string => {
  const base = locale.split('-')[0];
  return base && base.length > 0 ? base : 'hy';
};

/**
 * Maps UI locale to the currency shown to the visitor.
 */
export const displayCurrencyForLocale = (locale: string): DisplayCurrency => {
  const base = resolveBaseLocale(locale);
  if (base === 'en') {
    return 'USD';
  }
  if (base === 'ru') {
    return 'RUB';
  }
  return 'AMD';
};

const readPositiveRate = (raw: string | undefined, fallback: number): number => {
  if (raw == null || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAmdPerUsd = (): number =>
  readPositiveRate(process.env['NEXT_PUBLIC_FX_AMD_PER_USD'], DEFAULT_AMD_PER_USD);

export const getAmdPerRub = (): number =>
  readPositiveRate(process.env['NEXT_PUBLIC_FX_AMD_PER_RUB'], DEFAULT_AMD_PER_RUB);

/**
 * Converts a stored AMD major-unit amount into the locale display currency.
 */
export const convertAmdToDisplayAmount = (
  amdAmount: number,
  displayCurrency: DisplayCurrency,
): number => {
  if (displayCurrency === 'USD') {
    return Math.round(amdAmount / getAmdPerUsd());
  }
  if (displayCurrency === 'RUB') {
    return Math.round(amdAmount / getAmdPerRub());
  }
  return Math.round(amdAmount);
};
