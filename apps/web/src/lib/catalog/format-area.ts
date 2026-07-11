/** Formats square meters with locale-aware decimal separators. */
export function formatAreaSqm(areaSqm: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(areaSqm);
}
