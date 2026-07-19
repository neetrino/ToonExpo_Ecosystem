import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCOUNT_TYPES_KEY } from '../../auth/decorators/account-types.decorator.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { PortalProjectsService } from '../../portal/projects/portal-projects.service.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import { AdminCatalogProjectsController } from './admin-catalog-projects.controller.js';

describe('AdminBuilderCompanyService', () => {
  const companyFindUnique = vi.fn();
  let service: AdminBuilderCompanyService;

  beforeEach(() => {
    vi.clearAllMocks();
    const prisma = {
      db: { company: { findUnique: companyFindUnique } },
    } as unknown as PrismaService;
    service = new AdminBuilderCompanyService(prisma);
  });

  it('returns companyId for a builder company', async () => {
    companyFindUnique.mockResolvedValue({ id: 'co_1', type: 'builder' });
    await expect(service.requireBuilderCompanyId('co_1')).resolves.toBe('co_1');
  });

  it('throws when company does not exist', async () => {
    companyFindUnique.mockResolvedValue(null);
    await expect(service.requireBuilderCompanyId('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when company is not a builder', async () => {
    companyFindUnique.mockResolvedValue({ id: 'co_2', type: 'partner' });
    await expect(service.requireBuilderCompanyId('co_2')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('AdminCatalogProjectsController', () => {
  it('requires platform_admin account type', () => {
    const reflector = new Reflector();
    const accountTypes = reflector.get<string[]>(ACCOUNT_TYPES_KEY, AdminCatalogProjectsController);
    expect(accountTypes).toEqual(['platform_admin']);
  });

  it('scopes list to the path companyId after builder validation', async () => {
    const list = vi.fn().mockResolvedValue({ data: [], meta: {} });
    const requireBuilderCompanyId = vi.fn().mockResolvedValue('co_foreign');
    const controller = new AdminCatalogProjectsController(
      { requireBuilderCompanyId } as unknown as AdminBuilderCompanyService,
      { list } as unknown as PortalProjectsService,
      {} as never,
    );

    await controller.list({ companyId: 'co_foreign' }, { page: 1, pageSize: 20 });

    expect(requireBuilderCompanyId).toHaveBeenCalledWith('co_foreign');
    expect(list).toHaveBeenCalledWith('co_foreign', 1, 20);
  });
});

describe('PortalProjectsService company scope', () => {
  it('filters list by builderCompanyId', async () => {
    const projectCount = vi.fn().mockResolvedValue(0);
    const projectFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      db: {
        project: { count: projectCount, findMany: projectFindMany },
      },
    } as unknown as PrismaService;
    const service = new PortalProjectsService(prisma, {
      revalidateCatalog: vi.fn(),
    } as never);

    await service.list('co_owned', 1, 20);

    expect(projectCount).toHaveBeenCalledWith({
      where: { builderCompanyId: 'co_owned' },
    });
    expect(projectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { builderCompanyId: 'co_owned' },
      }),
    );
  });
});
