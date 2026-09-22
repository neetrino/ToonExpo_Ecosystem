import { describe, expect, it } from 'vitest';

import { formatAmdCurrency, formatCounterInteger } from '@/shared/ui/motion/format-counter-value';

describe('formatCounterInteger', () => {
  it('keeps four-digit hy values ungrouped to match Node ICU', () => {
    expect(formatCounterInteger(3500, 'hy')).toBe('3500');
  });

  it('groups large hy values with a fixed nbsp', () => {
    expect(formatCounterInteger(30_450_000, 'hy')).toBe('30\u00a0450\u00a0000');
  });

  it('groups English thousands with a comma', () => {
    expect(formatCounterInteger(3500, 'en')).toBe('3,500');
    expect(formatCounterInteger(30_450_000, 'en')).toBe('30,450,000');
  });
});

describe('formatAmdCurrency', () => {
  it('groups with nbsp and a dram sign', () => {
    expect(formatAmdCurrency(15_000_000)).toBe('15\u00a0000\u00a0000\u00a0֏');
  });
});
