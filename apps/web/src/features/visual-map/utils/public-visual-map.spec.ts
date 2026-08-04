import { describe, expect, it } from 'vitest';

import {
  buildHotspotHref,
  pickPrimaryVisualCanvas,
} from '@/features/visual-map/utils/public-visual-map';
import type { PublicVisualCanvasItem, PublicVisualHotspotItem } from '@toonexpo/contracts';

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

const hotspot = (
  overrides: Partial<PublicVisualHotspotItem> & {
    id: string;
    target: PublicVisualHotspotItem['target'];
  },
): PublicVisualHotspotItem => ({
  label: 'Zone',
  xPercent: '10',
  yPercent: '20',
  shapeType: 'polygon',
  interactionType: 'polygon',
  svgPath: 'M 0 0 L 10 0 L 10 10 Z',
  markerStyle: null,
  sortOrder: 0,
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
        hotspot({
          id: 'hs_1',
          label: 'Tower',
          target: { type: 'building', id: 'bld_1', displayName: 'A' },
        }),
      ],
    });

    expect(pickPrimaryVisualCanvas([without, withHotspots])?.id).toBe('b');
  });

  it('returns a final stage canvas even without hotspots', () => {
    const finalStage = canvas({ id: 'final' });
    expect(pickPrimaryVisualCanvas([finalStage])?.id).toBe('final');
  });
});

describe('buildHotspotHref', () => {
  const projectId = 'proj_1';

  it('builds apartment, building, and district paths', () => {
    const projectCanvas = canvas({ id: 'c1' });

    expect(
      buildHotspotHref(
        projectId,
        hotspot({
          id: 'a',
          target: { type: 'apartment', id: 'apt_1', displayName: '12' },
        }),
        projectCanvas,
      ),
    ).toBe('/apartments/apt_1');

    expect(
      buildHotspotHref(
        projectId,
        hotspot({
          id: 'b',
          target: { type: 'building', id: 'bld_1', displayName: 'A' },
        }),
        projectCanvas,
      ),
    ).toBe('/projects/proj_1/buildings/bld_1');

    expect(
      buildHotspotHref(
        projectId,
        hotspot({
          id: 'd',
          target: { type: 'district', id: 'dst_1', displayName: 'North' },
        }),
        projectCanvas,
      ),
    ).toBe('/projects/proj_1/districts/dst_1');
  });

  it('builds floor path when the current canvas is a building stage', () => {
    const buildingCanvas = canvas({
      id: 'c2',
      contextType: 'building',
      contextId: 'bld_9',
    });

    expect(
      buildHotspotHref(
        projectId,
        hotspot({
          id: 'f',
          target: { type: 'floor', id: 'fl_3', displayName: '3' },
        }),
        buildingCanvas,
      ),
    ).toBe('/projects/proj_1/buildings/bld_9/floors/fl_3');
  });

  it('returns null for floor targets outside a building canvas', () => {
    const projectCanvas = canvas({ id: 'c3' });

    expect(
      buildHotspotHref(
        projectId,
        hotspot({
          id: 'f',
          target: { type: 'floor', id: 'fl_3', displayName: '3' },
        }),
        projectCanvas,
      ),
    ).toBeNull();
  });
});
