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

  it('filters public listing to published models attached to a project', () => {
    expect(service.buildPublishedWhere()).toEqual({
      isPublished: true,
      NOT: { projectId: null },
    });
  });

  it('lists only published models with compact payload', async () => {
    projectMapModelFindMany.mockResolvedValue([
      {
        id: 'pmm_1',
        projectId: 'proj_1',
        mediaAssetId: 'media_1',
        sourceOsmId: null,
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
        project: {
          id: 'proj_1',
          name: 'Demo Tower',
          slug: 'demo-tower',
          address: 'Baghramyan 26',
          city: 'Yerevan',
          district: 'Kentron',
          builderCompany: {
            logoMedia: { fileUrl: 'https://cdn.example.com/logo.png' },
          },
        },
        mediaAsset: { fileUrl: 'https://cdn.example.com/model.glb' },
      },
    ]);

    const result = await service.listPublished();

    expect(projectMapModelFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true, NOT: { projectId: null } },
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      projectId: 'proj_1',
      projectSlug: 'demo-tower',
      projectName: 'Demo Tower',
      logoUrl: 'https://cdn.example.com/logo.png',
      address: 'Baghramyan 26',
      city: 'Yerevan',
      district: 'Kentron',
      longitude: '44.5',
      latitude: '40.1',
      modelUrl: 'https://cdn.example.com/model.glb',
      sourceOsmId: null,
      altitudeM: '0',
      headingDeg: '45',
      pitchDeg: '0',
      rollDeg: '0',
      scale: '1',
      minZoom: '14',
    });
  });

  it('maps null logoUrl when the builder has no logo media', async () => {
    projectMapModelFindMany.mockResolvedValue([
      {
        id: 'pmm_2',
        projectId: 'proj_2',
        mediaAssetId: 'media_2',
        sourceOsmId: null,
        longitude: decimal('44.6'),
        latitude: decimal('40.2'),
        altitudeM: decimal('0'),
        headingDeg: decimal('0'),
        pitchDeg: decimal('0'),
        rollDeg: decimal('0'),
        scale: decimal('1'),
        minZoom: decimal('14'),
        isPublished: true,
        createdByUserId: 'user_1',
        updatedByUserId: null,
        createdAt: new Date('2026-07-31T10:00:00.000Z'),
        updatedAt: new Date('2026-07-31T10:00:00.000Z'),
        project: {
          id: 'proj_2',
          name: 'No Logo Tower',
          slug: 'no-logo-tower',
          address: null,
          city: null,
          district: null,
          builderCompany: { logoMedia: null },
        },
        mediaAsset: { fileUrl: 'https://cdn.example.com/model-2.glb' },
      },
    ]);

    const result = await service.listPublished();

    expect(result.data[0]?.logoUrl).toBeNull();
  });
});
