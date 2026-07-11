import { describe, expect, it } from 'vitest';

import {
  canvasUpsertInputSchema,
  hotspotMoveInputSchema,
  hotspotUpsertInputSchema,
} from './visual-map';

describe('canvasUpsertInputSchema', () => {
  it('accepts create with a single project context', () => {
    const parsed = canvasUpsertInputSchema.safeParse({
      projectId: 'proj_1',
      title: 'Site plan',
      imageUrl: 'https://picsum.photos/seed/map/1200/800',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects create without exactly one context', () => {
    expect(
      canvasUpsertInputSchema.safeParse({
        imageUrl: 'https://picsum.photos/seed/map/1200/800',
      }).success,
    ).toBe(false);
  });

  it('accepts update with canvasId without context ids', () => {
    const parsed = canvasUpsertInputSchema.safeParse({
      canvasId: 'canvas_1',
      imageUrl: 'https://picsum.photos/seed/map/1200/800',
      title: 'Updated',
    });
    expect(parsed.success).toBe(true);
  });
});

describe('hotspotUpsertInputSchema', () => {
  it('coerces empty-string coords to invalid and accepts bounds', () => {
    expect(
      hotspotUpsertInputSchema.safeParse({
        canvasId: 'canvas_1',
        x: '',
        y: '50',
        buildingId: 'b1',
      }).success,
    ).toBe(false);

    const parsed = hotspotUpsertInputSchema.safeParse({
      canvasId: 'canvas_1',
      x: '25.5',
      y: '75',
      buildingId: 'b1',
      label: 'Tower A',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.x).toBe(25.5);
      expect(parsed.data.y).toBe(75);
    }
  });

  it('rejects coordinates outside 0–100', () => {
    expect(
      hotspotUpsertInputSchema.safeParse({
        canvasId: 'canvas_1',
        x: -1,
        y: 50,
        buildingId: 'b1',
      }).success,
    ).toBe(false);
    expect(
      hotspotUpsertInputSchema.safeParse({
        canvasId: 'canvas_1',
        x: 50,
        y: 101,
        buildingId: 'b1',
      }).success,
    ).toBe(false);
  });

  it('rejects missing or multiple targets', () => {
    expect(
      hotspotUpsertInputSchema.safeParse({
        canvasId: 'canvas_1',
        x: 10,
        y: 10,
      }).success,
    ).toBe(false);
    expect(
      hotspotUpsertInputSchema.safeParse({
        canvasId: 'canvas_1',
        x: 10,
        y: 10,
        buildingId: 'b1',
        floorId: 'f1',
      }).success,
    ).toBe(false);
  });
});

describe('hotspotMoveInputSchema', () => {
  it('accepts boundary coordinates', () => {
    expect(hotspotMoveInputSchema.safeParse({ hotspotId: 'h1', x: 0, y: 100 }).success).toBe(true);
  });
});
