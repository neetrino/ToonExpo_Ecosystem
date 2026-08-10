import { ConflictException, Injectable } from '@nestjs/common';
import type {
  InteractiveMappingDistrictSummary,
  InteractiveMappingProjectDetail,
  InteractiveMappingProjectListResponse,
  SetupBuildingFloorsResponse,
} from '@toonexpo/contracts';
import { Prisma, PublicationStatus } from '@toonexpo/db';

import { entityNotFound } from '../portal/utils/access.js';
import { requireOwnedBuilding, requireOwnedProject } from '../portal/utils/ownership.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateDistrictDto,
  SetupBuildingFloorsDto,
  UpdateDistrictDto,
} from './interactive-mapping.dto.js';
import {
  loadCanvasSnapshots,
  loadFloorsByProject,
  slugifyDistrictName,
  toProjectSummary,
} from './interactive-mapping.helpers.js';
import { collectFloorsWithBuildingPolygon } from './floor-building-polygon.js';
import {
  mapApartment,
  mapBuilding,
  mapCanvas,
  mapDistrict,
  mapFloor,
} from './interactive-mapping.mappers.js';
import type { CanvasSnapshot } from './phase-progress.js';
import { setupBuildingFloors } from './setup-building-floors.js';

const buildInteractiveMappingProjectsWhere = (
  companyId: string | undefined,
  search: string | undefined,
): Prisma.ProjectWhereInput => {
  const where: Prisma.ProjectWhereInput = {};
  if (companyId) {
    where.builderCompanyId = companyId;
  }
  const needle = search?.trim();
  if (!needle) {
    return where;
  }
  where.OR = [
    { name: { contains: needle, mode: 'insensitive' } },
    { slug: { contains: needle, mode: 'insensitive' } },
    { city: { contains: needle, mode: 'insensitive' } },
    { builderCompany: { name: { contains: needle, mode: 'insensitive' } } },
  ];
  return where;
};

@Injectable()
export class InteractiveMappingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists projects with phase progress. When `companyId` is set, only that
   * builder company's projects are returned.
   */
  async listProjects(
    companyId: string | undefined,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<InteractiveMappingProjectListResponse> {
    const where = buildInteractiveMappingProjectsWhere(companyId, search);
    const [total, projects] = await Promise.all([
      this.prisma.db.project.count({ where }),
      this.prisma.db.project.findMany({
        where,
        orderBy: [{ name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          builderCompanyId: true,
          publicationStatus: true,
          districts: { select: { id: true } },
          buildings: { select: { id: true, floorsCount: true } },
          _count: { select: { apartments: true } },
        },
      }),
    ]);

    const projectIds = projects.map((p) => p.id);
    const [floors, canvases] = await Promise.all([
      loadFloorsByProject(this.prisma, projectIds),
      loadCanvasSnapshots(this.prisma, projectIds),
    ]);

    return {
      data: projects.map((project) =>
        toProjectSummary(project, floors.get(project.id) ?? [], canvases.get(project.id) ?? []),
      ),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Project detail for the 4-phase wizard. When `companyId` is set, enforces
   * builder ownership (404 if not owned).
   */
  async getProject(
    projectId: string,
    companyId?: string,
  ): Promise<InteractiveMappingProjectDetail> {
    if (companyId) {
      await requireOwnedProject(this.prisma, projectId, companyId);
    }

    const project = await this.prisma.db.project.findUnique({
      where: { id: projectId },
      include: {
        districts: { orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] },
        buildings: { orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }] },
        apartments: {
          select: {
            id: true,
            buildingId: true,
            floorId: true,
            number: true,
            publicationStatus: true,
          },
          orderBy: [{ number: 'asc' }],
        },
        visualMapCanvases: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            mediaAsset: { select: { fileUrl: true, width: true, height: true } },
            _count: { select: { hotspots: true } },
            hotspots: { select: { targetType: true, targetId: true, svgPath: true } },
          },
        },
      },
    });
    if (!project) {
      throw entityNotFound('Project');
    }

    const floors = await this.prisma.db.floor.findMany({
      where: { building: { projectId } },
      orderBy: [{ displayOrder: 'asc' }, { number: 'asc' }],
    });

    const canvasSnapshots: CanvasSnapshot[] = project.visualMapCanvases.map((c) => ({
      contextType: c.contextType,
      contextId: c.contextId,
      hasMedia: Boolean(c.mediaAssetId),
      hotspotTargetTypes: c.hotspots.map((h) => h.targetType),
    }));

    const floorsWithBuildingPolygon = collectFloorsWithBuildingPolygon(project.visualMapCanvases);
    const floorsWithPlan = new Set(
      project.visualMapCanvases
        .filter((canvas) => canvas.contextType === 'floor' && Boolean(canvas.mediaAssetId))
        .map((canvas) => canvas.contextId),
    );

    const summary = toProjectSummary(
      {
        id: project.id,
        name: project.name,
        slug: project.slug,
        builderCompanyId: project.builderCompanyId,
        publicationStatus: project.publicationStatus,
        districts: project.districts.map((d) => ({ id: d.id })),
        buildings: project.buildings.map((b) => ({
          id: b.id,
          floorsCount: b.floorsCount,
        })),
        _count: { apartments: project.apartments.length },
      },
      floors.map((f) => f.id),
      canvasSnapshots,
    );

    return {
      project: summary,
      districts: project.districts.map(mapDistrict),
      buildings: project.buildings.map(mapBuilding),
      floors: floors.map((floor) =>
        mapFloor(floor, {
          hasBuildingPolygon: floorsWithBuildingPolygon.has(floor.id),
          hasFloorPlan: floorsWithPlan.has(floor.id) || floor.floorplanMediaId != null,
        }),
      ),
      apartments: project.apartments.map(mapApartment),
      canvases: project.visualMapCanvases.map(mapCanvas),
    };
  }

  async createDistrict(
    projectId: string,
    userId: string,
    dto: CreateDistrictDto,
    companyId?: string,
  ): Promise<InteractiveMappingDistrictSummary> {
    if (companyId) {
      await requireOwnedProject(this.prisma, projectId, companyId);
    } else {
      await this.requireProject(projectId);
    }
    const slug = await this.resolveUniqueSlug(projectId, dto.slug ?? slugifyDistrictName(dto.name));
    const district = await this.prisma.db.district.create({
      data: {
        projectId,
        name: dto.name,
        slug,
        displayOrder: dto.displayOrder ?? 0,
        publicationStatus:
          (dto.publicationStatus as PublicationStatus) ?? PublicationStatus.published,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });
    return mapDistrict(district);
  }

  async updateDistrict(
    districtId: string,
    userId: string,
    dto: UpdateDistrictDto,
    companyId?: string,
  ): Promise<InteractiveMappingDistrictSummary> {
    const existing = await this.requireDistrict(districtId, companyId);
    const slug =
      dto.slug !== undefined
        ? await this.resolveUniqueSlug(existing.projectId, dto.slug, districtId)
        : undefined;
    try {
      const district = await this.prisma.db.district.update({
        where: { id: districtId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(slug !== undefined ? { slug } : {}),
          ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
          ...(dto.publicationStatus !== undefined
            ? { publicationStatus: dto.publicationStatus as PublicationStatus }
            : {}),
          updatedByUserId: userId,
        },
      });
      return mapDistrict(district);
    } catch (error) {
      throwIfUniqueSlugConflict(error);
      throw error;
    }
  }

  async deleteDistrict(districtId: string, companyId?: string): Promise<void> {
    await this.requireDistrict(districtId, companyId);
    await this.prisma.db.district.delete({ where: { id: districtId } });
  }

  async setupFloors(
    buildingId: string,
    userId: string,
    dto: SetupBuildingFloorsDto,
    companyId?: string,
  ): Promise<SetupBuildingFloorsResponse> {
    if (companyId) {
      await requireOwnedBuilding(this.prisma, buildingId, companyId);
    }
    return setupBuildingFloors(this.prisma, buildingId, userId, dto);
  }

  private async requireProject(projectId: string): Promise<void> {
    const project = await this.prisma.db.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw entityNotFound('Project');
    }
  }

  private async requireDistrict(
    districtId: string,
    companyId?: string,
  ): Promise<{ id: string; projectId: string }> {
    const existing = await this.prisma.db.district.findFirst({
      where: {
        id: districtId,
        ...(companyId ? { project: { builderCompanyId: companyId } } : {}),
      },
      select: { id: true, projectId: true },
    });
    if (!existing) {
      throw entityNotFound('District');
    }
    return existing;
  }

  private async resolveUniqueSlug(
    projectId: string,
    slug: string,
    excludeDistrictId?: string,
  ): Promise<string> {
    const normalized = slugifyDistrictName(slug);
    const existing = await this.prisma.db.district.findFirst({
      where: {
        projectId,
        slug: normalized,
        ...(excludeDistrictId ? { id: { not: excludeDistrictId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('District slug already exists for this project');
    }
    return normalized;
  }
}

const throwIfUniqueSlugConflict = (error: unknown): void => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('District slug already exists for this project');
  }
};
