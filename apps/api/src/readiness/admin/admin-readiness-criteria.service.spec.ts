import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminReadinessCriteriaService } from './admin-readiness-criteria.service.js';

describe('AdminReadinessCriteriaService', () => {
  const readinessCriterionFindUnique = vi.fn();
  const readinessCriterionUpdate = vi.fn();
  const serviceProviderCategoryFindUnique = vi.fn();
  let service: AdminReadinessCriteriaService;

  const now = new Date('2026-08-13T10:00:00.000Z');
  const criterionRow = {
    id: 'crit_1',
    code: 'price_orientation',
    categoryId: 'cat_1',
    parentId: null,
    maxPoints: 10,
    sortOrder: 1,
    serviceProviderCategoryId: null,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const prisma = {
      db: {
        readinessCriterion: {
          findUnique: readinessCriterionFindUnique,
          update: readinessCriterionUpdate,
        },
        serviceProviderCategory: { findUnique: serviceProviderCategoryFindUnique },
      },
    } as unknown as PrismaService;
    service = new AdminReadinessCriteriaService(prisma);
  });

  it('links a service provider category to a criterion', async () => {
    readinessCriterionFindUnique.mockResolvedValue({ id: 'crit_1' });
    serviceProviderCategoryFindUnique.mockResolvedValue({ id: 'sp_cat_1' });
    readinessCriterionUpdate.mockResolvedValue({
      ...criterionRow,
      serviceProviderCategoryId: 'sp_cat_1',
    });

    const result = await service.update('crit_1', { serviceProviderCategoryId: 'sp_cat_1' });

    expect(result.serviceProviderCategoryId).toBe('sp_cat_1');
    expect(readinessCriterionUpdate).toHaveBeenCalledWith({
      where: { id: 'crit_1' },
      data: { serviceProviderCategoryId: 'sp_cat_1' },
    });
  });

  it('clears the linked category when null is sent', async () => {
    readinessCriterionFindUnique.mockResolvedValue({ id: 'crit_1' });
    readinessCriterionUpdate.mockResolvedValue(criterionRow);

    const result = await service.update('crit_1', { serviceProviderCategoryId: null });

    expect(result.serviceProviderCategoryId).toBeNull();
    expect(serviceProviderCategoryFindUnique).not.toHaveBeenCalled();
  });

  it('rejects a missing criterion', async () => {
    readinessCriterionFindUnique.mockResolvedValue(null);
    await expect(
      service.update('missing', { serviceProviderCategoryId: 'sp_cat_1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects an unknown service provider category', async () => {
    readinessCriterionFindUnique.mockResolvedValue({ id: 'crit_1' });
    serviceProviderCategoryFindUnique.mockResolvedValue(null);
    await expect(
      service.update('crit_1', { serviceProviderCategoryId: 'missing' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
