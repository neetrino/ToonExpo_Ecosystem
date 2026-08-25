import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicationStatus, VisualMapContextType } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import {
  refreshFloorPlanAfterCanvasChange,
  syncFloorCanvasMediaToFloorPlan,
  syncFloorPlanMediaToCanvas,
} from './sync-floor-plan-media.js';

describe('syncFloorPlanMediaToCanvas', () => {
  const mediaAssetFindUnique = vi.fn();
  const visualMapCanvasFindFirst = vi.fn();
  const visualMapCanvasUpdateMany = vi.fn();
  const visualMapCanvasUpdate = vi.fn();
  const visualMapCanvasCreate = vi.fn();
  const visualMapCanvasDelete = vi.fn();
  const floorUpdate = vi.fn();

  const prisma = {
    db: {
      mediaAsset: { findUnique: mediaAssetFindUnique },
      visualMapCanvas: {
        findFirst: visualMapCanvasFindFirst,
        updateMany: visualMapCanvasUpdateMany,
        update: visualMapCanvasUpdate,
        create: visualMapCanvasCreate,
        delete: visualMapCanvasDelete,
      },
      floor: { update: floorUpdate },
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
    mediaAssetFindUnique.mockResolvedValue({ id: 'media_1', ownerCompanyId: 'co_1' });
    visualMapCanvasUpdateMany.mockResolvedValue({ count: 0 });
    visualMapCanvasUpdate.mockResolvedValue({});
    visualMapCanvasCreate.mockResolvedValue({});
    visualMapCanvasDelete.mockResolvedValue({});
    floorUpdate.mockResolvedValue({});
  });

  it('creates a primary floor canvas when none exists', async () => {
    visualMapCanvasFindFirst.mockResolvedValue(null);

    await syncFloorPlanMediaToCanvas(prisma, {
      companyId: 'co_1',
      userId: 'user_1',
      projectId: 'proj_1',
      floorId: 'floor_1',
      mediaAssetId: 'media_1',
      title: 'Floor 1',
    });

    expect(visualMapCanvasCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerCompanyId: 'co_1',
        projectId: 'proj_1',
        contextType: VisualMapContextType.floor,
        contextId: 'floor_1',
        mediaAssetId: 'media_1',
        isPrimary: true,
        publicationStatus: PublicationStatus.published,
      }),
    });
  });

  it('updates existing floor canvas media', async () => {
    visualMapCanvasFindFirst.mockResolvedValue({
      id: 'canvas_1',
      mediaAssetId: 'media_old',
      isPrimary: true,
      publicationStatus: PublicationStatus.published,
    });

    await syncFloorPlanMediaToCanvas(prisma, {
      companyId: 'co_1',
      userId: 'user_1',
      projectId: 'proj_1',
      floorId: 'floor_1',
      mediaAssetId: 'media_1',
    });

    expect(visualMapCanvasUpdate).toHaveBeenCalledWith({
      where: { id: 'canvas_1' },
      data: {
        mediaAssetId: 'media_1',
        updatedByUserId: 'user_1',
      },
    });
    expect(visualMapCanvasCreate).not.toHaveBeenCalled();
  });

  it('deletes floor canvas when media is cleared', async () => {
    visualMapCanvasFindFirst.mockResolvedValue({
      id: 'canvas_1',
      mediaAssetId: 'media_1',
      isPrimary: true,
      publicationStatus: PublicationStatus.published,
    });

    await syncFloorPlanMediaToCanvas(prisma, {
      companyId: 'co_1',
      userId: 'user_1',
      projectId: 'proj_1',
      floorId: 'floor_1',
      mediaAssetId: null,
    });

    expect(visualMapCanvasUpdate).toHaveBeenCalledWith({
      where: { id: 'canvas_1' },
      data: { publicationStatus: PublicationStatus.draft },
    });
    expect(visualMapCanvasDelete).toHaveBeenCalledWith({ where: { id: 'canvas_1' } });
  });
});

describe('syncFloorCanvasMediaToFloorPlan', () => {
  const floorUpdate = vi.fn();
  const prisma = {
    db: { floor: { update: floorUpdate } },
  } as unknown as PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
    floorUpdate.mockResolvedValue({});
  });

  it('writes media id onto the floor', async () => {
    await syncFloorCanvasMediaToFloorPlan(prisma, {
      floorId: 'floor_1',
      mediaAssetId: 'media_1',
    });
    expect(floorUpdate).toHaveBeenCalledWith({
      where: { id: 'floor_1' },
      data: { floorplanMediaId: 'media_1' },
    });
  });
});

describe('refreshFloorPlanAfterCanvasChange', () => {
  const visualMapCanvasFindFirst = vi.fn();
  const floorUpdate = vi.fn();
  const prisma = {
    db: {
      visualMapCanvas: { findFirst: visualMapCanvasFindFirst },
      floor: { update: floorUpdate },
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
    floorUpdate.mockResolvedValue({});
  });

  it('clears floorplan when no canvas remains', async () => {
    visualMapCanvasFindFirst.mockResolvedValue(null);
    await refreshFloorPlanAfterCanvasChange(prisma, 'proj_1', 'floor_1');
    expect(floorUpdate).toHaveBeenCalledWith({
      where: { id: 'floor_1' },
      data: { floorplanMediaId: null },
    });
  });
});
