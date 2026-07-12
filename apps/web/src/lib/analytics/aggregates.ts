export type NamedCount = {
  key: string;
  count: number;
};

export type NamedShare = NamedCount & {
  percent: number;
};

const PERCENT_SCALE = 100;
const ROUNDING_FACTOR = 10;

/**
 * Maps groupBy rows into a stable key→count list (missing keys stay at 0 when `keys` given).
 */
export function mapGroupCounts<TKey extends string>(
  groups: ReadonlyArray<{ key: TKey; count: number }>,
  keys?: ReadonlyArray<TKey>,
): NamedCount[] {
  const byKey = new Map<string, number>();
  for (const group of groups) {
    byKey.set(group.key, group.count);
  }

  if (!keys) {
    return [...byKey.entries()].map(([key, count]) => ({ key, count }));
  }

  return keys.map((key) => ({ key, count: byKey.get(key) ?? 0 }));
}

/** Percentage shares that sum to ~100 (last row absorbs remainder rounding). */
export function toPercentageShares(rows: ReadonlyArray<NamedCount>): NamedShare[] {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) {
    return rows.map((row) => ({ ...row, percent: 0 }));
  }

  const shares: NamedShare[] = [];
  let allocated = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row) {
      continue;
    }

    if (index === rows.length - 1) {
      shares.push({ ...row, percent: Math.max(0, PERCENT_SCALE - allocated) });
      continue;
    }

    const raw = (row.count / total) * PERCENT_SCALE;
    const percent = Math.round(raw * ROUNDING_FACTOR) / ROUNDING_FACTOR;
    allocated += percent;
    shares.push({ ...row, percent });
  }

  return shares;
}
