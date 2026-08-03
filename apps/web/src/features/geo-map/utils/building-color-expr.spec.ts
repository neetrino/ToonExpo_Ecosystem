import { describe, expect, it } from 'vitest';

import {
  BUILDING_HEIGHT_EXPR,
  mixHex,
  realisticBuildingColorExpr,
  shadeHex,
} from '@/features/geo-map/utils/building-color-expr';

describe('mixHex', () => {
  it('returns midpoint when amount is 0.5', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('returns from when amount is 0', () => {
    expect(mixHex('#abcdef', '#000000', 0)).toBe('#abcdef');
  });

  it('clamps amount above 1 to to-color', () => {
    expect(mixHex('#000000', '#112233', 2)).toBe('#112233');
  });
});

describe('shadeHex', () => {
  it('darkens when amount is negative', () => {
    expect(shadeHex('#808080', -0.5)).toBe('#404040');
  });

  it('lightens when amount is positive', () => {
    expect(shadeHex('#000000', 1)).toBe('#ffffff');
  });
});

describe('realisticBuildingColorExpr', () => {
  it('returns a linear interpolate over building height', () => {
    const expr = realisticBuildingColorExpr('#d0d4d9');
    expect(expr[0]).toBe('interpolate');
    expect(expr[1]).toEqual(['linear']);
    expect(expr[2]).toEqual(BUILDING_HEIGHT_EXPR);
    expect(expr.length).toBeGreaterThan(5);
  });

  it('emits hex stop colors', () => {
    const expr = realisticBuildingColorExpr('#d0d4d9');
    const colors = expr.filter((v): v is string => typeof v === 'string' && v.startsWith('#'));
    expect(colors.length).toBeGreaterThanOrEqual(4);
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
