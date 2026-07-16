import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/builder/assert-builder-session', () => ({
  assertBuilderSession: vi.fn(),
}));

vi.mock('@/lib/visual-map/mutations', () => ({
  createCanvas: vi.fn(),
  updateCanvas: vi.fn(),
  setCanvasStatus: vi.fn(),
  deleteCanvas: vi.fn(),
  createHotspot: vi.fn(),
  updateHotspot: vi.fn(),
  moveHotspot: vi.fn(),
  deleteHotspot: vi.fn(),
}));

vi.mock('@/lib/shared/resolve-catalog-paths', () => ({
  resolveCatalogPaths: vi.fn(),
}));

vi.mock('@/lib/shared/revalidate-catalog-paths', () => ({
  revalidateCatalogPaths: vi.fn(),
}));

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  createCanvas,
  createHotspot,
  deleteCanvas,
  moveHotspot,
  setCanvasStatus,
} from '@/lib/visual-map/mutations';

import {
  createCanvasAction,
  createHotspotAction,
  deleteCanvasAction,
  moveHotspotAction,
  setCanvasStatusAction,
} from './visual-map-actions';

describe('visual-map actions authz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertBuilderSession).mockResolvedValue(null);
  });

  it('createCanvasAction returns unauthorized without a builder session', async () => {
    const result = await createCanvasAction('en', {
      projectId: 'project-1',
      imageUrl: 'https://picsum.photos/seed/map/1200/800',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createCanvas).not.toHaveBeenCalled();
  });

  it('setCanvasStatusAction returns unauthorized without a builder session', async () => {
    const result = await setCanvasStatusAction('en', {
      canvasId: 'canvas-1',
      status: 'PUBLISHED',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(setCanvasStatus).not.toHaveBeenCalled();
  });

  it('deleteCanvasAction returns unauthorized without a builder session', async () => {
    const result = await deleteCanvasAction('en', { canvasId: 'canvas-1' });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(deleteCanvas).not.toHaveBeenCalled();
  });

  it('createHotspotAction returns unauthorized without a builder session', async () => {
    const result = await createHotspotAction('en', {
      canvasId: 'canvas-1',
      x: 10,
      y: 20,
      buildingId: 'building-1',
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createHotspot).not.toHaveBeenCalled();
  });

  it('moveHotspotAction returns unauthorized without a builder session', async () => {
    const result = await moveHotspotAction('en', {
      hotspotId: 'hotspot-1',
      x: 50,
      y: 50,
    });
    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(moveHotspot).not.toHaveBeenCalled();
  });
});
