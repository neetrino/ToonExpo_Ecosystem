import { NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCOUNT_TYPES_KEY } from '../../auth/decorators/account-types.decorator.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminCompaniesController } from './admin-companies.controller.js';
import { AdminCompaniesService } from './admin-companies.service.js';

describe('AdminCompaniesService.listProjects', () => {
  const companyFindUnique = vi.fn();
  const projectFindMany = vi.fn();
  const projectCount = vi.fn();
  let service: AdminCompaniesService;

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        company: { findUnique: companyFindUnique },
        project: { findMany: projectFindMany, count: projectCount },
      },
    } as unknown as PrismaService;

    service = new AdminCompaniesService(prisma, {
      assertEmailAvailable: vi.fn(),
      createCompanyWithPrimaryAdmin: vi.fn(),
      sendSetPasswordInvite: vi.fn(),
    } as never);
  });

  it('returns only projects belonging to the requested company', async () => {
    companyFindUnique.mockResolvedValue({
      id: 'co_1',
      name: 'Builder Co',
      description: null,
      type: 'builder',
      status: 'active',
      source: 'admin',
      bosCompanyId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    projectFindMany.mockResolvedValue([
      {
        id: 'pr_1',
        name: 'Alpha Tower',
        publicationStatus: 'draft',
        createdAt: new Date('2026-01-15T10:00:00.000Z'),
      },
      {
        id: 'pr_2',
        name: 'Beta Residence',
        publicationStatus: 'published',
        createdAt: new Date('2026-02-01T12:00:00.000Z'),
      },
    ]);

    const result = await service.listProjects('co_1');

    expect(projectFindMany).toHaveBeenCalledWith({
      where: { builderCompanyId: 'co_1' },
      orderBy: [{ updatedAt: 'desc' }],
      select: {
        id: true,
        name: true,
        publicationStatus: true,
        createdAt: true,
      },
    });
    expect(result.data).toEqual([
      {
        id: 'pr_1',
        name: 'Alpha Tower',
        publicationStatus: 'draft',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
      {
        id: 'pr_2',
        name: 'Beta Residence',
        publicationStatus: 'published',
        createdAt: '2026-02-01T12:00:00.000Z',
      },
    ]);
  });

  it('throws when the company does not exist', async () => {
    companyFindUnique.mockResolvedValue(null);

    await expect(service.listProjects('missing')).rejects.toBeInstanceOf(NotFoundException);
    expect(projectFindMany).not.toHaveBeenCalled();
  });

  it('lists all projects with company names when no company filter is set', async () => {
    projectCount.mockResolvedValue(1);
    projectFindMany.mockResolvedValue([
      {
        id: 'pr_1',
        name: 'Alpha Tower',
        publicationStatus: 'draft',
        createdAt: new Date('2026-01-15T10:00:00.000Z'),
        city: 'Yerevan',
        builderCompanyId: 'co_1',
        builderCompany: { name: 'Builder Co' },
        _count: { buildings: 2, apartments: 10 },
      },
    ]);

    const result = await service.listAllProjects(1, 20);

    expect(companyFindUnique).not.toHaveBeenCalled();
    expect(projectFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ updatedAt: 'desc' }],
      skip: 0,
      take: 20,
      select: {
        id: true,
        name: true,
        publicationStatus: true,
        createdAt: true,
        city: true,
        builderCompanyId: true,
        builderCompany: { select: { name: true } },
        _count: { select: { buildings: true, apartments: true } },
      },
    });
    expect(result).toEqual({
      data: [
        {
          id: 'pr_1',
          name: 'Alpha Tower',
          publicationStatus: 'draft',
          createdAt: '2026-01-15T10:00:00.000Z',
          city: 'Yerevan',
          builderCompanyId: 'co_1',
          companyName: 'Builder Co',
          buildingsCount: 2,
          apartmentsCount: 10,
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
  });
});

describe('AdminCompaniesController', () => {
  it('requires platform_admin account type', () => {
    const reflector = new Reflector();
    const accountTypes = reflector.get<string[]>(ACCOUNT_TYPES_KEY, AdminCompaniesController);

    expect(accountTypes).toEqual(['platform_admin']);
  });
});
