import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  ApplyProjectBankPartnerOffersResponse,
  ProjectBankPartnerOfferItem,
  ProjectBankPartnerOfferListResponse,
} from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import { PrismaService } from "../prisma/prisma.service.js";
import {
  cloneFinanceFields,
  normalizeFinanceFields,
  parseStoredFinanceFields,
  toFinanceFieldsJson,
} from "./utils/finance-fields.js";
import {
  projectOfferInclude,
  toProjectOfferItem,
} from "./utils/mappers.js";
import type {
  ApplyProjectBankPartnerOffersDto,
  UpdateProjectBankPartnerOfferDto,
} from "./admin/dto/project-offer.dto.js";

const offerNotFound = (): NotFoundException =>
  new NotFoundException("Project bank partner offer not found");

const projectNotFound = (): NotFoundException =>
  new NotFoundException("Project not found");

@Injectable()
export class ProjectBankPartnerOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProject(
    projectId: string,
  ): Promise<ProjectBankPartnerOfferListResponse> {
    await this.requireProject(projectId);
    const rows = await this.prisma.db.projectBankPartnerOffer.findMany({
      where: { projectId },
      include: projectOfferInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return { data: rows.map(toProjectOfferItem) };
  }

  async apply(
    projectId: string,
    userId: string,
    dto: ApplyProjectBankPartnerOffersDto,
  ): Promise<ApplyProjectBankPartnerOffersResponse> {
    await this.requireProject(projectId);

    const addAll = dto.addAll === true;
    const templateIds = dto.templateIds ?? [];
    if (!addAll && templateIds.length === 0) {
      throw new BadRequestException(
        "Provide templateIds or set addAll to true",
      );
    }
    if (addAll && templateIds.length > 0) {
      throw new BadRequestException(
        "Use either templateIds or addAll, not both",
      );
    }

    const existing = await this.prisma.db.projectBankPartnerOffer.findMany({
      where: { projectId, templateId: { not: null } },
      select: { templateId: true },
    });
    const alreadyApplied = new Set(
      existing
        .map((row) => row.templateId)
        .filter((id): id is string => id != null),
    );

    const templates = await this.prisma.db.bankPartnerOfferTemplate.findMany({
      where: addAll
        ? { publicationStatus: PublicationStatus.published }
        : {
            id: { in: templateIds },
            publicationStatus: PublicationStatus.published,
          },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (!addAll && templates.length !== templateIds.length) {
      throw new BadRequestException(
        "One or more templates are missing or not published",
      );
    }

    const toApply = templates.filter(
      (template) => !alreadyApplied.has(template.id),
    );
    if (toApply.length === 0) {
      const current = await this.listForProject(projectId);
      return { data: current.data, appliedCount: 0 };
    }

    const maxSort = await this.prisma.db.projectBankPartnerOffer.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    let nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    await this.prisma.db.$transaction(
      toApply.map((template) => {
        const fields = cloneFinanceFields(
          parseStoredFinanceFields(template.fields),
        );
        const sortOrder = nextSort;
        nextSort += 1;
        return this.prisma.db.projectBankPartnerOffer.create({
          data: {
            projectId,
            templateId: template.id,
            partnerCompanyId: template.partnerCompanyId,
            name: template.name,
            fields: toFinanceFieldsJson(fields),
            sortOrder,
            createdByUserId: userId,
          },
        });
      }),
    );

    const listed = await this.listForProject(projectId);
    return { data: listed.data, appliedCount: toApply.length };
  }

  async update(
    projectId: string,
    offerId: string,
    userId: string,
    dto: UpdateProjectBankPartnerOfferDto,
  ): Promise<ProjectBankPartnerOfferItem> {
    await this.requireOwnedOffer(projectId, offerId);

    const data: Prisma.ProjectBankPartnerOfferUpdateInput = {
      updatedBy: { connect: { id: userId } },
    };
    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.fields !== undefined) {
      data.fields = toFinanceFieldsJson(normalizeFinanceFields(dto.fields));
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    const row = await this.prisma.db.projectBankPartnerOffer.update({
      where: { id: offerId },
      data,
      include: projectOfferInclude,
    });
    return toProjectOfferItem(row);
  }

  async remove(projectId: string, offerId: string): Promise<void> {
    await this.requireOwnedOffer(projectId, offerId);
    await this.prisma.db.projectBankPartnerOffer.delete({
      where: { id: offerId },
    });
  }

  private async requireProject(projectId: string): Promise<void> {
    const project = await this.prisma.db.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw projectNotFound();
    }
  }

  private async requireOwnedOffer(
    projectId: string,
    offerId: string,
  ): Promise<void> {
    const offer = await this.prisma.db.projectBankPartnerOffer.findFirst({
      where: { id: offerId, projectId },
      select: { id: true },
    });
    if (!offer) {
      throw offerNotFound();
    }
  }
}
