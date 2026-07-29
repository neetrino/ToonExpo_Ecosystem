import { describe, expect, it } from 'vitest';

import {
  isDrillDownTargetType,
  pickPrimaryVisualCanvas,
} from '@/features/visual-map/utils/public-visual-map';
import type { PublicVisualCanvasItem } from '@toonexpo/contracts';

const canvas = (
  overrides: Partial<PublicVisualCanvasItem> & { id: string },
): PublicVisualCanvasItem => ({
  contextType: 'project',
  contextId: 'proj_1',
  title: null,
  description: null,
  media: {
    id: 'media_1',
    fileUrl: 'https://cdn.example/map.jpg',
    thumbnailUrl: null,
    altText: null,
    title: null,
    width: 1200,
    height: 800,
  },
  hotspots: [],
  ...overrides,
});

describe('pickPrimaryVisualCanvas', () => {
  it('returns null for empty list', () => {
    expect(pickPrimaryVisualCanvas([])).toBeNull();
  });

  it('prefers a canvas that has hotspots', () => {
    const without = canvas({ id: 'a', hotspots: [] });
    const withHotspots = canvas({
      id: 'b',
      hotspots: [
        {
          id: 'hs_1',
          label: 'Tower',
          xPercent: '10',
          yPercent: '20',
          shapeType: 'polygon',
          interactionType: 'polygon',
          svgPath: 'M 0 0 L 10 0 L 10 10 Z',
          markerStyle: null,
          sortOrder: 0,
          target: { type: 'building', id: 'bld_1', displayName: 'A' },
        },
      ],
    });

    expect(pickPrimaryVisualCanvas([without, withHotspots])?.id).toBe('b');
  });

  it('returns a final stage canvas even without hotspots', () => {
    const finalStage = canvas({ id: 'final' });
    expect(pickPrimaryVisualCanvas([finalStage])?.id).toBe('final');
  });
});

describe('isDrillDownTargetType', () => {
  it('allows map stages and rejects apartment', () => {
    expect(isDrillDownTargetType('district')).toBe(true);
    expect(isDrillDownTargetType('building')).toBe(true);
    expect(isDrillDownTargetType('floor')).toBe(true);
    expect(isDrillDownTargetType('apartment')).toBe(false);
  });
});
