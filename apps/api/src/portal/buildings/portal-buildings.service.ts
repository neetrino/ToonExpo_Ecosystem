import { BadRequestException, Injectable } from "@nestjs/common";
import type { PortalBuildingSummary } from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { WebRevalidationService } from "../../common/web-revalidation/web-revalidation.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type {
  CreatePortalBuildingDto,
  UpdatePortalBuildingDto,
} from "../dto/portal-building.dto.js";
import type { UpdatePortalPublicationDto } from "../dto/update-portal-publication.dto.js";
import { mapPortalBuilding } from "../mappers/portal.mapper.js";
import { assertCompanyAdmin, entityNotFound } from "../utils/access.js";
import {
  requireOwnedBuilding,
  requireOwnedProject,
} from "../utils/ownership.js";

const buildingInclude = {
  floors: {
    orderBy: [{ displayOrder: "asc" as const }, { number: "asc" as const }],
    include: { _count: { select: { apartments: true } } },
  },
} satisfies Prisma.BuildingInclude;

@Injectable()
export class PortalBuildingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async list(
    member: CompanyMemberContext,
    projectId: string,
  ): Promise<PortalBuildingSummary[]> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    const buildings = await this.prisma.db.building.findMany({
      where: { projectId },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: buildingInclude,
    });
    return buildings.map(mapPortalBuilding);
  }

  async getById(
    member: CompanyMemberContext,
    buildingId: string,
  ): Promise<PortalBuildingSummary> {
    const owned = await requireOwnedBuilding(
      this.prisma,
      buildingId,
      member.companyId,
    );
    const building = await this.prisma.db.building.findUniqueOrThrow({
      where: { id: owned.id },
      include: buildingInclude,
    });
    return mapPortalBuilding(building);
  }

  async create(
    member: CompanyMemberContext,
    userId: string,
    projectId: string,
    dto: CreatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    const building = await this.prisma.db.building.create({
      data: {
        projectId,
        name: dto.name,
        publicationStatus: PublicationStatus.draft,
        displayOrder: dto.displayOrder ?? 0,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.floorsCount !== undefined
          ? { floorsCount: dto.floorsCount }
          : {}),
        ...(dto.coverMediaId !== undefined
          ? { coverMediaId: dto.coverMediaId }
          : {}),
        ...(dto.internalCode !== undefined
          ? { internalCode: dto.internalCode }
          : {}),
      },
      include: buildingInclude,
    });
    return mapPortalBuilding(building);
  }

  async update(
    member: CompanyMemberContext,
    userId: string,
    buildingId: string,
    dto: UpdatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    await requireOwnedBuilding(this.prisma, buildingId, member.companyId);
    const building = await this.prisma.db.building.update({
      where: { id: buildingId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.displayOrder !== undefined
          ? { displayOrder: dto.displayOrder }
          : {}),
        ...(dto.floorsCount !== undefined
          ? { floorsCount: dto.floorsCount }
          : {}),
        ...(dto.coverMediaId !== undefined
          ? { coverMediaId: dto.coverMediaId }
          : {}),
        ...(dto.internalCode !== undefined
          ? { internalCode: dto.internalCode }
          : {}),
        updatedByUserId: userId,
      },
      include: buildingInclude,
    });
    return mapPortalBuilding(building);
  }

  async updatePublication(
    member: CompanyMemberContext,
    userId: string,
    buildingId: string,
    dto: UpdatePortalPublicationDto,
  ): Promise<PortalBuildingSummary> {
    assertCompanyAdmin(member);
    const owned = await requireOwnedBuilding(
      this.prisma,
      buildingId,
      member.companyId,
    );
    const building = await this.prisma.db.building.update({
      where: { id: buildingId },
      data: {
        publicationStatus: dto.publicationStatus as PublicationStatus,
        updatedByUserId: userId,
      },
      include: buildingInclude,
    });
    this.webRevalidation.revalidateCatalog(owned.projectId);
    return mapPortalBuilding(building);
  }

  async remove(
    member: CompanyMemberContext,
    buildingId: string,
  ): Promise<void> {
    assertCompanyAdmin(member);
    const building = await this.prisma.db.building.findFirst({
      where: {
        id: buildingId,
        project: { builderCompanyId: member.companyId },
      },
      select: { id: true, publicationStatus: true },
    });
    if (!building) {
      throw entityNotFound("Building");
    }
    if (building.publicationStatus !== PublicationStatus.draft) {
      throw new BadRequestException("Only draft buildings can be deleted");
    }
    await this.prisma.db.building.delete({ where: { id: buildingId } });
  }
}
