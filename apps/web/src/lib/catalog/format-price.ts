/** Formats an AMD price with locale-aware thousands separators. */
export function formatPriceAmd(priceAmd: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'AMD',
    maximumFractionDigits: 0,
  }).format(priceAmd);
}
