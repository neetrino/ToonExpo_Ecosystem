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

    service = new AdminCompaniesService(
      prisma,
      {
        assertEmailAvailable: vi.fn(),
        createCompanyWithPrimaryAdmin: vi.fn(),
        sendSetPasswordInvite: vi.fn(),
      } as never,
      { create: vi.fn() } as never,
    );
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
      logoMediaId: null,
      logoMedia: null,
      phone: null,
      contactPerson: null,
      email: null,
      websiteUrl: null,
      instagramUrl: null,
      facebookUrl: null,
      region: null,
      address: null,
      mediaMaterialsUrl: null,
      advertisingMaterialsUrl: null,
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
    projectCount.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    projectFindMany.mockResolvedValue([
      {
        id: 'pr_1',
        name: 'Alpha Tower',
        publicationStatus: 'draft',
        createdAt: new Date('2026-01-15T10:00:00.000Z'),
        city: 'Yerevan',
        builderCompanyId: 'co_1',
        featuredOnHome: false,
        builderCompany: { name: 'Builder Co' },
        coverMedia: {
          id: 'media_1',
          fileUrl: 'https://cdn.example.com/project.jpg',
          thumbnailUrl: null,
          altText: null,
        },
        _count: { buildings: 2, apartments: 10 },
      },
    ]);

    const result = await service.listAllProjects(1, 20);

    expect(companyFindUnique).not.toHaveBeenCalled();
    expect(projectFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ featuredOnHome: 'desc' }, { updatedAt: 'desc' }],
      skip: 0,
      take: 20,
      select: {
        id: true,
        name: true,
        publicationStatus: true,
        createdAt: true,
        city: true,
        builderCompanyId: true,
        featuredOnHome: true,
        builderCompany: { select: { name: true } },
        coverMedia: {
          select: {
            id: true,
            fileUrl: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
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
          cover: {
            id: 'media_1',
            fileUrl: 'https://cdn.example.com/project.jpg',
            thumbnailUrl: null,
            altText: null,
          },
          buildingsCount: 2,
          apartmentsCount: 10,
          featuredOnHome: false,
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1, featuredOnHomeTotal: 0 },
    });
  });

  it('searches trimmed and case-insensitively across name, slug, city and company', async () => {
    projectCount.mockResolvedValue(0);
    projectFindMany.mockResolvedValue([]);

    await service.listAllProjects(2, 18, undefined, '  Alpha  ');

    const expectedWhere = {
      OR: [
        { name: { contains: 'Alpha', mode: 'insensitive' } },
        { slug: { contains: 'Alpha', mode: 'insensitive' } },
        { city: { contains: 'Alpha', mode: 'insensitive' } },
        { builderCompany: { name: { contains: 'Alpha', mode: 'insensitive' } } },
      ],
    };

    expect(projectCount).toHaveBeenNthCalledWith(1, { where: expectedWhere });
    expect(projectCount).toHaveBeenNthCalledWith(2, { where: { featuredOnHome: true } });
    expect(projectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere, skip: 18, take: 18 }),
    );
  });

  it('combines search with the company filter', async () => {
    companyFindUnique.mockResolvedValue({
      id: 'co_1',
      name: 'Builder Co',
      description: null,
      type: 'builder',
      status: 'active',
      source: 'admin',
      bosCompanyId: null,
      logoMediaId: null,
      logoMedia: null,
      phone: null,
      contactPerson: null,
      email: null,
      websiteUrl: null,
      instagramUrl: null,
      facebookUrl: null,
      region: null,
      address: null,
      mediaMaterialsUrl: null,
      advertisingMaterialsUrl: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    projectCount.mockResolvedValue(0);
    projectFindMany.mockResolvedValue([]);

    await service.listAllProjects(1, 18, 'co_1', 'tower');

    expect(projectCount).toHaveBeenCalledWith({
      where: {
        builderCompanyId: 'co_1',
        OR: [
          { name: { contains: 'tower', mode: 'insensitive' } },
          { slug: { contains: 'tower', mode: 'insensitive' } },
          { city: { contains: 'tower', mode: 'insensitive' } },
          { builderCompany: { name: { contains: 'tower', mode: 'insensitive' } } },
        ],
      },
    });
  });

  it('treats a blank search term as no search filter', async () => {
    projectCount.mockResolvedValue(0);
    projectFindMany.mockResolvedValue([]);

    await service.listAllProjects(1, 18, undefined, '   ');

    expect(projectCount).toHaveBeenNthCalledWith(1, { where: {} });
    expect(projectCount).toHaveBeenNthCalledWith(2, { where: { featuredOnHome: true } });
  });
});

describe('AdminCompaniesController', () => {
  it('requires platform_admin account type', () => {
    const reflector = new Reflector();
    const accountTypes = reflector.get<string[]>(ACCOUNT_TYPES_KEY, AdminCompaniesController);

    expect(accountTypes).toEqual(['platform_admin']);
  });
});
