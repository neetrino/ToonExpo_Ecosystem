import { describe, expect, it } from 'vitest';

import { parsePositiveFloat, parsePositiveInt } from './input-parsers';

describe('mortgage input parsers', () => {
  it('falls back on NaN and non-positive integers', () => {
    expect(parsePositiveInt('abc', 100)).toBe(100);
    expect(parsePositiveInt('-5', 100)).toBe(100);
    expect(parsePositiveInt('0', 100)).toBe(100);
  });

  it('accepts valid positive integers', () => {
    expect(parsePositiveInt('25000000', 100)).toBe(25_000_000);
  });

  it('falls back on NaN floats and clamps negatives to fallback', () => {
    expect(parsePositiveFloat('not-a-rate', 9.5)).toBe(9.5);
    expect(parsePositiveFloat('-1', 9.5)).toBe(9.5);
  });

  it('accepts zero and positive floats', () => {
    expect(parsePositiveFloat('0', 9.5)).toBe(0);
    expect(parsePositiveFloat('12.25', 9.5)).toBe(12.25);
  });
});
