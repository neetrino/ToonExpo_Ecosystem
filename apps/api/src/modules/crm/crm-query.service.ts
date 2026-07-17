import { Injectable } from '@nestjs/common';
import { DEAL_STAGES } from '@toonexpo/domain';

import { type PrismaService } from '../../common/prisma.service';

const ACTIVITY_LIMIT = 50;

@Injectable()
export class CrmQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async board(companyId: string) {
    const rows = await this.prisma.client.deal.findMany({
      where: { companyId },
      orderBy: [{ lastActivityAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        stage: true,
        source: true,
        contactName: true,
        lastActivityAt: true,
        nextFollowUpAt: true,
        project: { select: { name: true } },
        assignedUser: { select: { name: true } },
        _count: { select: { apartments: true } },
      },
    });
    return DEAL_STAGES.map((stage) => ({
      stage,
      deals: rows
        .filter((row) => row.stage === stage)
        .map((row) => ({
          id: row.id,
          stage: row.stage,
          source: row.source,
          contactName: row.contactName,
          projectName: row.project?.name ?? null,
          apartmentCount: row._count.apartments,
          assigneeName: row.assignedUser?.name ?? null,
          lastActivityAt: row.lastActivityAt,
          nextFollowUpAt: row.nextFollowUpAt,
        })),
    }));
  }

  deal(companyId: string, dealId: string) {
    return this.prisma.client.deal.findFirst({
      where: { id: dealId, companyId },
      select: {
        id: true,
        stage: true,
        source: true,
        title: true,
        message: true,
        contactName: true,
        contactPhone: true,
        contactEmail: true,
        buyerUserId: true,
        projectId: true,
        lastActivityAt: true,
        nextFollowUpAt: true,
        createdAt: true,
        assignedUserId: true,
        project: { select: { name: true } },
        assignedUser: { select: { name: true } },
        apartments: {
          select: {
            apartmentId: true,
            priceAmdSnapshot: true,
            statusSnapshot: true,
            apartment: {
              select: {
                code: true,
                status: true,
                priceAmd: true,
                floor: { select: { name: true, building: { select: { name: true } } } },
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: ACTIVITY_LIMIT,
          select: {
            id: true,
            type: true,
            body: true,
            status: true,
            dueAt: true,
            createdAt: true,
            authorUser: { select: { name: true } },
          },
        },
      },
    });
  }

  async members(companyId: string) {
    const rows = await this.prisma.client.companyMember.findMany({
      where: { companyId },
      select: { user: { select: { id: true, name: true } } },
      orderBy: { user: { name: 'asc' } },
    });
    return rows.map(({ user }) => ({ userId: user.id, name: user.name ?? '—' }));
  }

  async apartmentOptions(companyId: string, projectId?: string) {
    const projects = await this.prisma.client.project.findMany({
      where: { companyId, ...(projectId ? { id: projectId } : {}) },
      select: {
        id: true,
        name: true,
        buildings: {
          orderBy: { name: 'asc' },
          select: {
            name: true,
            floors: {
              orderBy: { level: 'asc' },
              select: {
                name: true,
                apartments: {
                  orderBy: { code: 'asc' },
                  select: { id: true, code: true, status: true, priceAmd: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return projects
      .map((project) => ({
        projectId: project.id,
        projectName: project.name,
        apartments: project.buildings.flatMap((building) =>
          building.floors.flatMap((floor) =>
            floor.apartments.map((apartment) => ({
              apartmentId: apartment.id,
              code: apartment.code,
              buildingName: building.name,
              floorName: floor.name,
              status: apartment.status,
              priceAmd: apartment.priceAmd,
            })),
          ),
        ),
      }))
      .filter(({ apartments }) => apartments.length > 0);
  }

  buyerDeals(userId: string) {
    return this.prisma.client.deal.findMany({
      where: { buyerUserId: userId },
      orderBy: [{ lastActivityAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        stage: true,
        source: true,
        createdAt: true,
        lastActivityAt: true,
        company: { select: { name: true } },
        project: { select: { name: true } },
      },
    });
  }
}
