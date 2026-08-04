import { describe, expect, it } from 'vitest';

import { resolvePolygonLabelPoint } from './resolve-polygon-label-point';

describe('resolvePolygonLabelPoint', () => {
  it('uses marker percents when they are non-zero', () => {
    expect(
      resolvePolygonLabelPoint({
        svgPath: 'M 0 0 L 10 0 L 10 10 Z',
        xPercent: '50',
        yPercent: '25',
        viewBoxWidth: 200,
        viewBoxHeight: 400,
      }),
    ).toEqual({ x: 100, y: 100 });
  });

  it('falls back to path average when marker is 0,0', () => {
    const point = resolvePolygonLabelPoint({
      svgPath: 'M 0 0 L 30 0 L 30 30 Z',
      xPercent: '0',
      yPercent: '0',
      viewBoxWidth: 100,
      viewBoxHeight: 100,
    });
    expect(point?.x).toBeCloseTo(20, 5);
    expect(point?.y).toBeCloseTo(10, 5);
  });
});
