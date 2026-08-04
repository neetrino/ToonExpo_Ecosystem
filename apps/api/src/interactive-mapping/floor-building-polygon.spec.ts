import { describe, expect, it } from 'vitest';

import { collectFloorsWithBuildingPolygon, isFillableSvgPath } from './floor-building-polygon.js';

describe('isFillableSvgPath', () => {
  it('rejects empty and incomplete paths', () => {
    expect(isFillableSvgPath(null)).toBe(false);
    expect(isFillableSvgPath('M 1 2')).toBe(false);
    expect(isFillableSvgPath('M 1 2 L 3 4')).toBe(false);
  });

  it('accepts closed polygons', () => {
    expect(isFillableSvgPath('M 0 0 L 10 0 L 10 10 Z')).toBe(true);
  });
});

describe('collectFloorsWithBuildingPolygon', () => {
  it('returns only floors with fillable polygons on building canvases', () => {
    const ids = collectFloorsWithBuildingPolygon([
      {
        contextType: 'building',
        hotspots: [
          {
            targetType: 'floor',
            targetId: 'f14',
            svgPath: 'M 0 0 L 10 0 L 10 10 Z',
          },
          { targetType: 'floor', targetId: 'f1', svgPath: 'M 1 2' },
        ],
      },
      {
        contextType: 'floor',
        hotspots: [
          {
            targetType: 'apartment',
            targetId: 'a1',
            svgPath: 'M 0 0 L 10 0 L 10 10 Z',
          },
        ],
      },
    ]);
    expect([...ids]).toEqual(['f14']);
  });
});
