import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma.service';

type Hint = {
  projectId?: string;
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
  mediaAssetId?: string;
};

const projectSelect = {
  id: true,
  slug: true,
  company: { select: { slug: true } },
} as const;

@Injectable()
export class BuilderCatalogPathService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(companyId: string, hint: Hint) {
    if (hint.projectId) {
      return this.map(
        await this.prisma.client.project.findFirst({
          where: { id: hint.projectId, companyId },
          select: projectSelect,
        }),
      );
    }
    if (hint.buildingId) {
      const row = await this.prisma.client.building.findFirst({
        where: { id: hint.buildingId, project: { companyId } },
        select: { project: { select: projectSelect } },
      });
      return this.map(row?.project);
    }
    if (hint.floorId) {
      const row = await this.prisma.client.floor.findFirst({
        where: { id: hint.floorId, building: { project: { companyId } } },
        select: { building: { select: { project: { select: projectSelect } } } },
      });
      return this.map(row?.building.project);
    }
    if (hint.apartmentId) {
      const row = await this.prisma.client.apartment.findFirst({
        where: { id: hint.apartmentId, floor: { building: { project: { companyId } } } },
        select: {
          floor: { select: { building: { select: { project: { select: projectSelect } } } } },
        },
      });
      return this.map(row?.floor.building.project);
    }
    if (hint.mediaAssetId) {
      const row = await this.prisma.client.mediaAsset.findFirst({
        where: {
          id: hint.mediaAssetId,
          OR: [
            { project: { companyId } },
            { apartment: { floor: { building: { project: { companyId } } } } },
          ],
        },
        select: {
          project: { select: projectSelect },
          apartment: {
            select: {
              floor: { select: { building: { select: { project: { select: projectSelect } } } } },
            },
          },
        },
      });
      return this.map(row?.project ?? row?.apartment?.floor.building.project);
    }
    return null;
  }

  async projects(companyId: string, projectIds: string[]) {
    const rows = await this.prisma.client.project.findMany({
      where: { id: { in: [...new Set(projectIds)] }, companyId },
      select: projectSelect,
    });
    return rows.map((row) => this.map(row));
  }

  async admin(projectId: string) {
    return this.map(
      await this.prisma.client.project.findUnique({
        where: { id: projectId },
        select: projectSelect,
      }),
    );
  }

  private map(project: { id: string; slug: string; company: { slug: string } } | null | undefined) {
    return project
      ? { projectId: project.id, projectSlug: project.slug, companySlug: project.company.slug }
      : null;
  }
}
