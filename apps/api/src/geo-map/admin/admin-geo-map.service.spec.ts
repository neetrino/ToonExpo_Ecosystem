import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminGeoMapService } from './admin-geo-map.service.js';

const decimal = (value: string): Prisma.Decimal =>
  ({ toString: () => value }) as unknown as Prisma.Decimal;

const baseRow = {
  id: 'pmm_1',
  projectId: 'proj_1',
  mediaAssetId: 'media_1',
  sourceOsmId: null as string | null,
  longitude: decimal('44.5123456'),
  latitude: decimal('40.1812345'),
  altitudeM: decimal('0'),
  headingDeg: decimal('0'),
  pitchDeg: decimal('0'),
  rollDeg: decimal('0'),
  scale: decimal('1'),
  minZoom: decimal('14'),
  isPublished: false,
  createdByUserId: 'user_1',
  updatedByUserId: null,
  createdAt: new Date('2026-07-31T10:00:00.000Z'),
  updatedAt: new Date('2026-07-31T10:00:00.000Z'),
  project: { name: 'Demo Tower', slug: 'demo-tower' },
  mediaAsset: { fileUrl: 'https://cdn.example.com/platform/media_1.glb', title: 'Tower.glb' },
};

describe('AdminGeoMapService', () => {
  const projectFindUnique = vi.fn();
  const mediaAssetFindUnique = vi.fn();
  const projectMapModelFindUnique = vi.fn();
  const projectMapModelFindMany = vi.fn();
  const projectMapModelCreate = vi.fn();
  const projectMapModelUpdate = vi.fn();
  const projectMapModelDelete = vi.fn();
  let service: AdminGeoMapService;

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        project: { findUnique: projectFindUnique },
        mediaAsset: { findUnique: mediaAssetFindUnique },
        projectMapModel: {
          findUnique: projectMapModelFindUnique,
          findMany: projectMapModelFindMany,
          create: projectMapModelCreate,
          update: projectMapModelUpdate,
          delete: projectMapModelDelete,
        },
      },
    } as unknown as PrismaService;

    service = new AdminGeoMapService(prisma);
  });

  it('creates a geo map model for a project', async () => {
    projectFindUnique.mockResolvedValue({ id: 'proj_1' });
    mediaAssetFindUnique.mockResolvedValue({ id: 'media_1' });
    projectMapModelFindUnique.mockResolvedValue(null);
    projectMapModelCreate.mockResolvedValue(baseRow);

    const result = await service.create('user_1', {
      projectId: 'proj_1',
      mediaAssetId: 'media_1',
      longitude: 44.5123456,
      latitude: 40.1812345,
    });

    expect(projectMapModelCreate).toHaveBeenCalled();
    const createArg = projectMapModelCreate.mock.calls[0]?.[0] as {
      data: { pitchDeg: number };
    };
    expect(createArg.data.pitchDeg).toBe(90);
    expect(result.projectSlug).toBe('demo-tower');
    expect(result.modelUrl).toContain('media_1.glb');
    expect(result.isPublished).toBe(false);
  });

  it('creates an unassigned model without a project', async () => {
    mediaAssetFindUnique.mockResolvedValue({ id: 'media_1' });
    projectMapModelCreate.mockResolvedValue({
      ...baseRow,
      projectId: null,
      project: null,
      sourceOsmId: '582962758',
    });

    const result = await service.create('user_1', {
      mediaAssetId: 'media_1',
      longitude: 44.5,
      latitude: 40.1,
      sourceOsmId: '582962758',
    });

    expect(projectFindUnique).not.toHaveBeenCalled();
    expect(result.projectId).toBeNull();
    expect(result.sourceOsmId).toBe('582962758');
  });

  it('publishes an unassigned model on create', async () => {
    mediaAssetFindUnique.mockResolvedValue({ id: 'media_1' });
    projectMapModelCreate.mockResolvedValue({
      ...baseRow,
      projectId: null,
      project: null,
      isPublished: true,
    });

    const result = await service.create('user_1', {
      mediaAssetId: 'media_1',
      longitude: 44.5,
      latitude: 40.1,
      isPublished: true,
    });

    expect(projectMapModelCreate).toHaveBeenCalled();
    expect(result.isPublished).toBe(true);
    expect(result.projectId).toBeNull();
  });

  it('rejects create when project already has a model', async () => {
    projectFindUnique.mockResolvedValue({ id: 'proj_1' });
    mediaAssetFindUnique.mockResolvedValue({ id: 'media_1' });
    projectMapModelFindUnique.mockResolvedValue({ id: 'pmm_existing' });

    await expect(
      service.create('user_1', {
        projectId: 'proj_1',
        mediaAssetId: 'media_1',
        longitude: 44.5,
        latitude: 40.1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(projectMapModelCreate).not.toHaveBeenCalled();
  });

  it('rejects create when project is missing', async () => {
    projectFindUnique.mockResolvedValue(null);

    await expect(
      service.create('user_1', {
        projectId: 'missing',
        mediaAssetId: 'media_1',
        longitude: 44.5,
        latitude: 40.1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates transform and publish flag', async () => {
    projectMapModelFindUnique.mockResolvedValue({
      id: 'pmm_1',
      projectId: 'proj_1',
      isPublished: false,
    });
    projectMapModelUpdate.mockResolvedValue({
      ...baseRow,
      isPublished: true,
      scale: decimal('1.5'),
      headingDeg: decimal('90'),
      updatedByUserId: 'user_1',
    });

    const result = await service.update('pmm_1', 'user_1', {
      scale: 1.5,
      headingDeg: 90,
      isPublished: true,
    });

    expect(projectMapModelUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pmm_1' },
        data: expect.objectContaining({
          scale: 1.5,
          headingDeg: 90,
          isPublished: true,
        }),
      }),
    );
    expect(result.isPublished).toBe(true);
    expect(result.scale).toBe('1.5');
  });

  it('attaches a free project to an unassigned model', async () => {
    projectMapModelFindUnique
      .mockResolvedValueOnce({ id: 'pmm_1', projectId: null, isPublished: false })
      .mockResolvedValueOnce(null);
    projectFindUnique.mockResolvedValue({ id: 'proj_2' });
    projectMapModelUpdate.mockResolvedValue({
      ...baseRow,
      projectId: 'proj_2',
      project: { name: 'Other', slug: 'other' },
    });

    const result = await service.update('pmm_1', 'user_1', { projectId: 'proj_2' });

    expect(result.projectId).toBe('proj_2');
    expect(projectMapModelUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          project: { connect: { id: 'proj_2' } },
        }),
      }),
    );
  });

  it('publishes when the model stays unassigned', async () => {
    projectMapModelFindUnique.mockResolvedValue({
      id: 'pmm_1',
      projectId: null,
      isPublished: false,
    });
    projectMapModelUpdate.mockResolvedValue({
      ...baseRow,
      projectId: null,
      project: null,
      isPublished: true,
    });

    const result = await service.update('pmm_1', 'user_1', { isPublished: true });

    expect(projectMapModelUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPublished: true }),
      }),
    );
    expect(result.isPublished).toBe(true);
    expect(result.projectId).toBeNull();
  });

  it('rejects update when model is missing', async () => {
    projectMapModelFindUnique.mockResolvedValue(null);

    await expect(service.update('missing', 'user_1', { isPublished: true })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
