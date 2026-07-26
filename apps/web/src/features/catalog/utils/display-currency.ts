/**
 * Catalog prices are stored and displayed in AMD (Armenian dram).
 * Symbol: ֏ (U+058F ARMENIAN DRAM SIGN).
 */

export const AMD_CURRENCY_CODE = 'AMD' as const;

/** Armenian dram sign used in all public price labels. */
export const AMD_CURRENCY_SYMBOL = '֏';

export type DisplayCurrency = typeof AMD_CURRENCY_CODE;

/**
 * Catalog UI always shows AMD regardless of locale.
 * Locale argument is accepted for call-site compatibility and ignored.
 */
export const displayCurrencyForLocale = (_locale: string): DisplayCurrency => {
  void _locale;
  return AMD_CURRENCY_CODE;
};

/**
 * Rounds a stored AMD major-unit amount for display (no FX conversion).
 * Display-currency argument is accepted for call-site compatibility and ignored.
 */
export const convertAmdToDisplayAmount = (
  amdAmount: number,
  _displayCurrency: DisplayCurrency = AMD_CURRENCY_CODE,
): number => {
  void _displayCurrency;
  return Math.round(amdAmount);
};
