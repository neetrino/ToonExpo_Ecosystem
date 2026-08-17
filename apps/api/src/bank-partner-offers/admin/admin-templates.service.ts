import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  BankPartnerOfferTemplateItem,
  BankPartnerOfferTemplateListResponse,
} from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { assertBankPartnerCompany } from "../../mortgage/utils/bank-offer-access.js";
import {
  normalizeFinanceFields,
  toFinanceFieldsJson,
} from "../utils/finance-fields.js";
import { templateInclude, toTemplateItem } from "../utils/mappers.js";
import type {
  CreateBankPartnerOfferTemplateDto,
  ListBankPartnerOfferTemplatesQueryDto,
  UpdateBankPartnerOfferTemplateDto,
} from "./dto/admin-template.dto.js";

const templateNotFound = (): NotFoundException =>
  new NotFoundException("Bank partner offer template not found");

@Injectable()
export class AdminBankPartnerOfferTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListBankPartnerOfferTemplatesQueryDto,
  ): Promise<BankPartnerOfferTemplateListResponse> {
    const where: Prisma.BankPartnerOfferTemplateWhereInput = {};
    if (query.partnerCompanyId) {
      where.partnerCompanyId = query.partnerCompanyId;
    }
    if (query.publishedOnly) {
      where.publicationStatus = PublicationStatus.published;
    } else if (query.publicationStatus) {
      where.publicationStatus = query.publicationStatus;
    }

    const rows = await this.prisma.db.bankPartnerOfferTemplate.findMany({
      where,
      include: templateInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return { data: rows.map(toTemplateItem) };
  }

  async getById(id: string): Promise<BankPartnerOfferTemplateItem> {
    const row = await this.prisma.db.bankPartnerOfferTemplate.findUnique({
      where: { id },
      include: templateInclude,
    });
    if (!row) {
      throw templateNotFound();
    }
    return toTemplateItem(row);
  }

  async create(
    userId: string,
    dto: CreateBankPartnerOfferTemplateDto,
  ): Promise<BankPartnerOfferTemplateItem> {
    await assertBankPartnerCompany(this.prisma.db, dto.partnerCompanyId);
    const fields = normalizeFinanceFields(dto.fields ?? {});

    const row = await this.prisma.db.bankPartnerOfferTemplate.create({
      data: {
        partnerCompanyId: dto.partnerCompanyId,
        name: dto.name.trim(),
        fields: toFinanceFieldsJson(fields),
        publicationStatus: dto.publicationStatus ?? PublicationStatus.draft,
        sortOrder: dto.sortOrder ?? 0,
        createdByUserId: userId,
      },
      include: templateInclude,
    });

    return toTemplateItem(row);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateBankPartnerOfferTemplateDto,
  ): Promise<BankPartnerOfferTemplateItem> {
    await this.requireTemplate(id);

    const data: Prisma.BankPartnerOfferTemplateUpdateInput = {
      updatedByUserId: userId,
    };
    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.fields !== undefined) {
      data.fields = toFinanceFieldsJson(normalizeFinanceFields(dto.fields));
    }
    if (dto.publicationStatus !== undefined) {
      data.publicationStatus = dto.publicationStatus;
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    const row = await this.prisma.db.bankPartnerOfferTemplate.update({
      where: { id },
      data,
      include: templateInclude,
    });

    return toTemplateItem(row);
  }

  async remove(id: string): Promise<void> {
    await this.requireTemplate(id);
    await this.prisma.db.bankPartnerOfferTemplate.delete({ where: { id } });
  }

  private async requireTemplate(id: string): Promise<void> {
    const exists = await this.prisma.db.bankPartnerOfferTemplate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw templateNotFound();
    }
  }
}
