import type { Prisma } from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { PublicGeoMapService } from './public-geo-map.service.js';

const decimal = (value: string): Prisma.Decimal =>
  ({ toString: () => value }) as unknown as Prisma.Decimal;

describe('PublicGeoMapService', () => {
  const projectMapModelFindMany = vi.fn();
  let service: PublicGeoMapService;

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        projectMapModel: { findMany: projectMapModelFindMany },
      },
    } as unknown as PrismaService;

    service = new PublicGeoMapService(prisma);
    projectMapModelFindMany.mockResolvedValue([]);
  });

  it('filters public listing to published models only', () => {
    expect(service.buildPublishedWhere()).toEqual({ isPublished: true });
  });

  it('lists only published models with compact payload', async () => {
    projectMapModelFindMany.mockResolvedValue([
      {
        id: 'pmm_1',
        projectId: 'proj_1',
        mediaAssetId: 'media_1',
        longitude: decimal('44.5'),
        latitude: decimal('40.1'),
        altitudeM: decimal('0'),
        headingDeg: decimal('45'),
        pitchDeg: decimal('0'),
        rollDeg: decimal('0'),
        scale: decimal('1'),
        minZoom: decimal('14'),
        isPublished: true,
        createdByUserId: 'user_1',
        updatedByUserId: null,
        createdAt: new Date('2026-07-31T10:00:00.000Z'),
        updatedAt: new Date('2026-07-31T10:00:00.000Z'),
        project: { id: 'proj_1', name: 'Demo Tower', slug: 'demo-tower' },
        mediaAsset: { fileUrl: 'https://cdn.example.com/model.glb' },
      },
    ]);

    const result = await service.listPublished();

    expect(projectMapModelFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true },
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      projectId: 'proj_1',
      projectSlug: 'demo-tower',
      projectName: 'Demo Tower',
      longitude: '44.5',
      latitude: '40.1',
      modelUrl: 'https://cdn.example.com/model.glb',
      altitudeM: '0',
      headingDeg: '45',
      pitchDeg: '0',
      rollDeg: '0',
      scale: '1',
      minZoom: '14',
    });
  });
});
