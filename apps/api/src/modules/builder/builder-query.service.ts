import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma.service';

const STATUS_HISTORY_LIMIT = 10;

@Injectable()
export class BuilderQueryService {
  constructor(private readonly prisma: PrismaService) {}

  profile(companyId: string) {
    return this.prisma.client.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        phone: true,
        email: true,
        website: true,
        city: true,
        address: true,
      },
    });
  }

  async members(companyId: string) {
    const rows = await this.prisma.client.companyMember.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      userId: row.user.id,
      name: row.user.name?.trim() || row.user.email,
      email: row.user.email,
      role: row.role,
      joinedAt: row.createdAt,
    }));
  }

  async companyOptions(userId: string, admin: boolean) {
    if (admin) {
      return this.prisma.client.company.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    }
    const rows = await this.prisma.client.companyMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { company: { select: { id: true, name: true } } },
    });
    return rows.map(({ company }) => company);
  }

  projectCounts(companyId: string) {
    return this.prisma.client.project.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { _all: true },
    });
  }

  projects(companyId: string) {
    return this.prisma.client.project.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        status: true,
        updatedAt: true,
        description: true,
        _count: { select: { buildings: true, media: true, canvases: true } },
        buildings: {
          select: {
            status: true,
            floors: {
              select: { status: true, _count: { select: { apartments: true } } },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  project(companyId: string, projectId: string) {
    return this.prisma.client.project.findFirst({
      where: { id: projectId, companyId },
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        address: true,
        status: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, alt: true, sortOrder: true },
        },
        buildings: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            floors: {
              orderBy: { level: 'asc' },
              select: {
                id: true,
                name: true,
                level: true,
                status: true,
                apartments: {
                  orderBy: { code: 'asc' },
                  select: {
                    id: true,
                    code: true,
                    rooms: true,
                    areaSqm: true,
                    priceAmd: true,
                    priceVisibility: true,
                    matterportUrl: true,
                    status: true,
                    media: {
                      orderBy: { sortOrder: 'asc' },
                      select: { id: true, url: true, alt: true, sortOrder: true },
                    },
                    statusHistory: {
                      orderBy: { createdAt: 'desc' },
                      take: STATUS_HISTORY_LIMIT,
                      select: {
                        id: true,
                        oldStatus: true,
                        newStatus: true,
                        source: true,
                        reason: true,
                        createdAt: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  readiness(companyId: string) {
    return this.prisma.client.readinessAssessment.findMany({
      where: { companyId, archivedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        targetType: true,
        companyId: true,
        projectId: true,
        status: true,
        overallScore: true,
        recommendation: true,
        requiredActions: true,
        responsibleContact: true,
        lastEvaluatedAt: true,
        updatedAt: true,
        project: { select: { name: true } },
        categoryScores: {
          orderBy: { category: { sortOrder: 'asc' } },
          select: {
            categoryId: true,
            score: true,
            status: true,
            recommendation: true,
            requiredActions: true,
            category: {
              select: { key: true, name: true, serviceCategoryKey: true },
            },
          },
        },
      },
    });
  }

  providers() {
    return this.prisma.client.partner.findMany({
      where: { status: 'PUBLISHED', type: 'SERVICE_COMPANY' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        serviceCategories: true,
        phone: true,
        email: true,
        website: true,
        description: true,
      },
    });
  }
}
