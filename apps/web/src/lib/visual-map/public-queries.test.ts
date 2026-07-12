import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@toonexpo/db', () => ({
  prisma: {
    visualCanvas: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from '@toonexpo/db';

import { getPublishedCanvasForContext } from './public-queries';
import { mapPublicHotspot } from './public-canvas-fetch';

describe('getPublishedCanvasForContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for a DRAFT canvas', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(null);

    const result = await getPublishedCanvasForContext({ projectId: 'project-1' });

    expect(result).toBeNull();
    expect(prisma.visualCanvas.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: 'project-1',
          status: 'PUBLISHED',
          project: { status: 'PUBLISHED' },
        }),
      }),
    );
  });

  it('returns null when project is not PUBLISHED', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue(null);

    await getPublishedCanvasForContext({ buildingId: 'building-1' });

    expect(prisma.visualCanvas.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          buildingId: 'building-1',
          status: 'PUBLISHED',
          building: { status: 'PUBLISHED', project: { status: 'PUBLISHED' } },
        }),
      }),
    );
  });

  it('maps published project canvas with building hotspots', async () => {
    vi.mocked(prisma.visualCanvas.findFirst).mockResolvedValue({
      id: 'canvas-1',
      title: 'Site plan',
      imageUrl: 'https://picsum.photos/seed/map/1200/800',
      imageAlt: 'Site',
      projectId: 'project-1',
      buildingId: null,
      floorId: null,
      project: {
        id: 'project-1',
        slug: 'sunrise-residence',
        company: { slug: 'demo-development' },
      },
      hotspots: [
        {
          id: 'hs-1',
          x: 30,
          y: 40,
          label: 'Tower A',
          buildingId: 'building-1',
          floorId: null,
          apartmentId: null,
          building: { id: 'building-1', name: 'Tower A', status: 'PUBLISHED' },
          floor: null,
          apartment: null,
        },
      ],
    } as never);

    const result = await getPublishedCanvasForContext({ projectId: 'project-1' });

    expect(result).toMatchObject({
      id: 'canvas-1',
      contextType: 'project',
      companySlug: 'demo-development',
      projectSlug: 'sunrise-residence',
      hotspots: [
        {
          id: 'hs-1',
          x: 30,
          y: 40,
          label: 'Tower A',
          target: { type: 'building', buildingId: 'building-1', name: 'Tower A' },
        },
      ],
    });
  });

  it('filters hotspots targeting draft buildings', () => {
    const hotspot = mapPublicHotspot({
      id: 'hs-draft',
      x: 10,
      y: 20,
      label: 'Draft tower',
      building: { id: 'building-1', name: 'Draft tower', status: 'DRAFT' },
      floor: null,
      apartment: null,
    });

    expect(hotspot).toBeNull();
  });
});
