import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicationStatus } from '@toonexpo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { CityMapService } from './city-map.service.js';
import { CITY_MAP_MAX_PLACEMENTS } from './city-map.constants.js';

describe('CityMapService', () => {
  const prisma = {
    db: {
      cityMapPlacement: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      building: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      mediaAsset: {
        findUnique: vi.fn(),
      },
    },
  };

  const service = new CityMapService(prisma as unknown as PrismaService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects create when placement cap is reached', async () => {
    prisma.db.cityMapPlacement.count.mockResolvedValue(CITY_MAP_MAX_PLACEMENTS);
    await expect(
      service.create('user-1', {
        buildingId: 'b1',
        glbMediaAssetId: 'm1',
        longitude: 44.5,
        latitude: 40.1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create when building already has placement', async () => {
    prisma.db.cityMapPlacement.count.mockResolvedValue(0);
    prisma.db.building.findUnique.mockResolvedValue({
      id: 'b1',
      projectId: 'p1',
      cityMapPlacement: { id: 'existing' },
    });
    await expect(
      service.create('user-1', {
        buildingId: 'b1',
        glbMediaAssetId: 'm1',
        longitude: 44.5,
        latitude: 40.1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects missing building', async () => {
    prisma.db.cityMapPlacement.count.mockResolvedValue(0);
    prisma.db.building.findUnique.mockResolvedValue(null);
    await expect(
      service.create('user-1', {
        buildingId: 'missing',
        glbMediaAssetId: 'm1',
        longitude: 44.5,
        latitude: 40.1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('publishes via setPublicationStatus', async () => {
    const row = {
      id: 'pl1',
      buildingId: 'b1',
      projectId: 'p1',
      glbMediaAssetId: 'm1',
      longitude: { toNumber: () => 44.5 },
      latitude: { toNumber: () => 40.1 },
      altitude: 0,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0,
      scale: 1,
      minZoom: 13,
      publicationStatus: PublicationStatus.draft,
      labelOverride: null,
      createdAt: new Date('2026-07-31T00:00:00.000Z'),
      updatedAt: new Date('2026-07-31T00:00:00.000Z'),
      building: { name: 'A', displayOrder: 0 },
      project: { name: 'P', address: 'Addr', city: 'Yerevan' },
      glbMediaAsset: { fileUrl: 'https://cdn.example.com/a.glb' },
    };
    prisma.db.cityMapPlacement.findUnique.mockResolvedValue(row);
    prisma.db.cityMapPlacement.update.mockResolvedValue({
      ...row,
      publicationStatus: PublicationStatus.published,
    });

    const result = await service.setPublicationStatus('user-1', 'pl1', PublicationStatus.published);
    expect(result.publicationStatus).toBe(PublicationStatus.published);
  });

  it('listPublic queries only published placement + building + project', async () => {
    prisma.db.cityMapPlacement.findMany.mockResolvedValue([]);

    await service.listPublic();

    expect(prisma.db.cityMapPlacement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          publicationStatus: PublicationStatus.published,
          building: { publicationStatus: PublicationStatus.published },
          project: { publicationStatus: PublicationStatus.published },
        },
      }),
    );
  });
});
