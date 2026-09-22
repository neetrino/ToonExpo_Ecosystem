export const COUNTER_GROUP_SEPARATOR = '\u00a0';
const AMD_CURRENCY_SYMBOL = '֏';

/**
 * Hydration-safe integer grouping. `Intl.NumberFormat('hy')` disagrees
 * between Node ICU and the browser (spaces vs commas), which breaks SSR.
 */
export const formatCounterInteger = (value: number, locale: string): string => {
  const digits = String(Math.round(value));
  const useLatinComma = locale === 'en';
  const separator = useLatinComma ? ',' : COUNTER_GROUP_SEPARATOR;
  const minDigitsForGrouping = useLatinComma ? 4 : 5;
  if (digits.length < minDigitsForGrouping) {
    return digits;
  }
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Hydration-safe AMD formatter (fixed grouping + dram sign).
 */
export const formatAmdCurrency = (value: number): string => {
  const digits = String(Math.round(value));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, COUNTER_GROUP_SEPARATOR);
  return `${grouped}${COUNTER_GROUP_SEPARATOR}${AMD_CURRENCY_SYMBOL}`;
};
