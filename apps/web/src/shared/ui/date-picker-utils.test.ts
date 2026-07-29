import { describe, expect, it } from 'vitest';

import {
  buildMonthCells,
  parseIsoDate,
  toIsoDate,
  weekdayLabels,
} from '@/shared/ui/date-picker-utils';

describe('date-picker-utils', () => {
  it('round-trips local ISO dates', () => {
    const date = new Date(2026, 6, 28);
    expect(toIsoDate(date)).toBe('2026-07-28');
    expect(parseIsoDate('2026-07-28')).toEqual(date);
  });

  it('rejects invalid ISO dates', () => {
    expect(parseIsoDate('2026-13-01')).toBeNull();
    expect(parseIsoDate('not-a-date')).toBeNull();
  });

  it('builds a Monday-first month grid', () => {
    const cells = buildMonthCells(2026, 6);
    expect(cells).toHaveLength(42);
    expect(cells.filter((cell) => cell.inMonth).at(0)?.iso).toBe('2026-07-01');
    expect(cells.filter((cell) => cell.inMonth).at(-1)?.iso).toBe('2026-07-31');
  });

  it('returns seven weekday labels', () => {
    expect(weekdayLabels('en')).toHaveLength(7);
  });
});
