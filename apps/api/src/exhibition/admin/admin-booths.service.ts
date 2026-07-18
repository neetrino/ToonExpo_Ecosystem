import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  BoothAssignmentSummary,
  BoothListResponse,
  BoothSummary,
  CreateBoothAssignmentRequest,
  CreateBoothRequest,
  UpdateBoothAssignmentRequest,
  UpdateBoothRequest,
} from "@toonexpo/contracts";
import { PublicationStatus, Prisma } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toBoothSummary } from "../mappers/exhibition.mapper.js";

@Injectable()
export class AdminBoothsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByVenueMap(mapId: string): Promise<BoothListResponse> {
    await this.requireVenueMap(mapId);
    const booths = await this.prisma.db.booth.findMany({
      where: { venueMapId: mapId },
      orderBy: [{ code: "asc" }],
    });
    return { data: booths.map(toBoothSummary) };
  }

  async create(
    mapId: string,
    body: CreateBoothRequest,
  ): Promise<BoothSummary> {
    const map = await this.requireVenueMap(mapId);

    const booth = await this.prisma.db.booth.create({
      data: {
        eventId: map.eventId,
        venueMapId: mapId,
        code: body.code,
        name: body.name ?? null,
        type: body.type,
        xPercent: body.xPercent,
        yPercent: body.yPercent,
        ...(body.shapeData !== undefined
          ? {
              shapeData: body.shapeData as Prisma.InputJsonValue,
            }
          : {}),
        locationText: body.locationText ?? null,
        publicationStatus: body.publicationStatus ?? PublicationStatus.draft,
      },
    });

    return toBoothSummary(booth);
  }

  async update(id: string, body: UpdateBoothRequest): Promise<BoothSummary> {
    await this.requireBooth(id);

    const booth = await this.prisma.db.booth.update({
      where: { id },
      data: {
        ...(body.code !== undefined ? { code: body.code } : {}),
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        ...(body.xPercent !== undefined ? { xPercent: body.xPercent } : {}),
        ...(body.yPercent !== undefined ? { yPercent: body.yPercent } : {}),
        ...(body.shapeData !== undefined
          ? {
              shapeData:
                body.shapeData === null
                  ? Prisma.JsonNull
                  : (body.shapeData as Prisma.InputJsonValue),
            }
          : {}),
        ...(body.locationText !== undefined
          ? { locationText: body.locationText }
          : {}),
        ...(body.publicationStatus !== undefined
          ? { publicationStatus: body.publicationStatus }
          : {}),
      },
    });

    return toBoothSummary(booth);
  }

  async remove(id: string): Promise<void> {
    await this.requireBooth(id);
    await this.prisma.db.booth.delete({ where: { id } });
  }

  async createAssignment(
    boothId: string,
    body: CreateBoothAssignmentRequest,
  ): Promise<BoothAssignmentSummary> {
    await this.requireBooth(boothId);
    await this.validateAssignmentRefs(body.companyId, body.projectId);

    const assignment = await this.prisma.db.boothAssignment.create({
      data: {
        boothId,
        companyId: body.companyId ?? null,
        projectId: body.projectId ?? null,
        assignmentLabel: body.assignmentLabel ?? null,
        sortOrder: body.sortOrder ?? null,
        active: body.active ?? true,
      },
    });

    return toAssignmentSummary(assignment);
  }

  async updateAssignment(
    boothId: string,
    assignmentId: string,
    body: UpdateBoothAssignmentRequest,
  ): Promise<BoothAssignmentSummary> {
    await this.requireAssignment(boothId, assignmentId);

    const nextCompanyId =
      body.companyId !== undefined ? body.companyId : undefined;
    const nextProjectId =
      body.projectId !== undefined ? body.projectId : undefined;

    if (nextCompanyId !== undefined || nextProjectId !== undefined) {
      const current = await this.prisma.db.boothAssignment.findUniqueOrThrow({
        where: { id: assignmentId },
      });
      await this.validateAssignmentRefs(
        nextCompanyId ?? current.companyId ?? undefined,
        nextProjectId ?? current.projectId ?? undefined,
      );
    }

    const assignment = await this.prisma.db.boothAssignment.update({
      where: { id: assignmentId },
      data: {
        ...(body.companyId !== undefined ? { companyId: body.companyId } : {}),
        ...(body.projectId !== undefined ? { projectId: body.projectId } : {}),
        ...(body.assignmentLabel !== undefined
          ? { assignmentLabel: body.assignmentLabel }
          : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
    });

    return toAssignmentSummary(assignment);
  }

  async removeAssignment(boothId: string, assignmentId: string): Promise<void> {
    await this.requireAssignment(boothId, assignmentId);
    await this.prisma.db.boothAssignment.delete({ where: { id: assignmentId } });
  }

  private async validateAssignmentRefs(
    companyId: string | undefined,
    projectId: string | undefined,
  ): Promise<void> {
    if (!companyId && !projectId) {
      throw new BadRequestException(
        "Assignment must reference a company or project",
      );
    }

    if (companyId) {
      const company = await this.prisma.db.company.findUnique({
        where: { id: companyId },
        select: { id: true },
      });
      if (!company) {
        throw new NotFoundException("Company not found");
      }
    }

    if (projectId) {
      const project = await this.prisma.db.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException("Project not found");
      }
    }
  }

  private async requireVenueMap(mapId: string) {
    const map = await this.prisma.db.venueMap.findUnique({ where: { id: mapId } });
    if (!map) {
      throw new NotFoundException("Venue map not found");
    }
    return map;
  }

  private async requireBooth(id: string) {
    const booth = await this.prisma.db.booth.findUnique({ where: { id } });
    if (!booth) {
      throw new NotFoundException("Booth not found");
    }
    return booth;
  }

  private async requireAssignment(boothId: string, assignmentId: string) {
    const assignment = await this.prisma.db.boothAssignment.findFirst({
      where: { id: assignmentId, boothId },
    });
    if (!assignment) {
      throw new NotFoundException("Booth assignment not found");
    }
    return assignment;
  }
}

const toAssignmentSummary = (assignment: {
  id: string;
  boothId: string;
  companyId: string | null;
  projectId: string | null;
  assignmentLabel: string | null;
  sortOrder: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): BoothAssignmentSummary => ({
  id: assignment.id,
  boothId: assignment.boothId,
  companyId: assignment.companyId,
  projectId: assignment.projectId,
  assignmentLabel: assignment.assignmentLabel,
  sortOrder: assignment.sortOrder,
  active: assignment.active,
  createdAt: assignment.createdAt.toISOString(),
  updatedAt: assignment.updatedAt.toISOString(),
});
