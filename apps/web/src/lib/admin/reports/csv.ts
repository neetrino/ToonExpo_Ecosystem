/**
 * Escapes a single CSV field per RFC 4180 (quotes, commas, newlines).
 * String cells that look like spreadsheet formulas are neutralized first.
 * Typed numbers are rendered raw (including negatives) — only strings are neutralized.
 */
const FORMULA_LEADING = /^[=+\-@\t\r]/;

function neutralizeFormulaString(raw: string): string {
  if (FORMULA_LEADING.test(raw)) {
    return `'${raw}`;
  }
  return raw;
}

export function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  const raw = neutralizeFormulaString(value);
  if (/[",\r\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

/**
 * Builds a CSV document with a header row and UTF-8 BOM for Excel.
 */
export function buildCsv(
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>,
): string {
  const lines = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
