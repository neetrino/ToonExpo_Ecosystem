import { describe, expect, it } from 'vitest';

import { isFillableSvgPath } from './is-fillable-svg-path';

describe('isFillableSvgPath', () => {
  it('rejects empty and single-point paths', () => {
    expect(isFillableSvgPath(null)).toBe(false);
    expect(isFillableSvgPath('')).toBe(false);
    expect(isFillableSvgPath('M 252.61 158.12')).toBe(false);
    expect(isFillableSvgPath('M 0 0 L 10 10')).toBe(false);
  });

  it('accepts closed polygons with at least three points', () => {
    expect(isFillableSvgPath('M 0 0 L 10 0 L 10 10 Z')).toBe(true);
    expect(isFillableSvgPath('M 1 2 L 3 4 L 5 6 L 7 8 Z')).toBe(true);
  });
});
