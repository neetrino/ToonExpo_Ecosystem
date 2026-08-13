import { Injectable, NotFoundException } from '@nestjs/common';
import type { AdminPartnerDetail, AdminPartnerListResponse } from '@toonexpo/contracts';
import {
  CompanySource,
  PartnerCompanyStatus,
  PublicationStatus,
  type Prisma,
} from '@toonexpo/db';

import { CompanyProvisioningService } from '../../company/provisioning/company-provisioning.service.js';
import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { toAdminPartnerDetail, toAdminPartnerListItem } from '../mappers/partner.mapper.js';
import {
  loadPartnerTranslationRows,
  partnerNotFound,
  resolvePartnerSlug,
} from '../utils/partner-access.js';
import { mapPartnerTypeToCompanyType } from '../utils/map-partner-type-to-company-type.js';
import { upsertPartnerProfileTranslations } from '../utils/partner-translations.util.js';
import type { CreateAdminPartnerDto } from './dto/admin-partner.dto.js';
import type { ListAdminPartnersQueryDto } from './dto/admin-partner.dto.js';
import type { UpdateAdminPartnerDto } from './dto/admin-partner.dto.js';

const partnerOffersInclude = {
  logoMedia: { select: { fileUrl: true } },
  offers: { orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }] },
} satisfies Prisma.PartnerCompanyInclude;

@Injectable()
export class AdminPartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: CompanyProvisioningService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async list(query: ListAdminPartnersQueryDto): Promise<AdminPartnerListResponse> {
    const where = this.buildListWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [total, rows] = await Promise.all([
      this.prisma.db.partnerCompany.count({ where }),
      this.prisma.db.partnerCompany.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take: query.pageSize,
        include: {
          logoMedia: { select: { fileUrl: true } },
          coverMedia: { select: { fileUrl: true } },
        },
      }),
    ]);

    return {
      data: rows.map(toAdminPartnerListItem),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      },
    };
  }

  buildListWhere(query: ListAdminPartnersQueryDto): Prisma.PartnerCompanyWhereInput {
    const where: Prisma.PartnerCompanyWhereInput = {};

    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.publicationStatus) {
      where.publicationStatus = query.publicationStatus;
    }
    if (query.search?.trim()) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    return where;
  }

  async getById(id: string): Promise<AdminPartnerDetail> {
    const partner = await this.prisma.db.partnerCompany.findUnique({
      where: { id },
      include: partnerOffersInclude,
    });
    if (!partner) {
      throw partnerNotFound();
    }

    const translationRows = await loadPartnerTranslationRows(
      this.prisma.db,
      partner.id,
      partner.offers.map((offer) => offer.id),
    );

    return toAdminPartnerDetail(partner, partner.offers, translationRows);
  }

  /**
   * Provisions a company + primary admin invite + draft partner profile.
   */
  async create(_userId: string, dto: CreateAdminPartnerDto): Promise<AdminPartnerDetail> {
    await this.provisioning.assertEmailAvailable(dto.adminEmail);

    const companyName = dto.name.trim();
    const companyType = mapPartnerTypeToCompanyType(dto.type);

    const { company, adminUser } = await this.provisioning.createCompanyWithPrimaryAdmin({
      companyName,
      companyType,
      source: CompanySource.admin,
      adminName: dto.adminName.trim(),
      adminEmail: dto.adminEmail,
      adminPhone: dto.adminPhone?.trim() || null,
    });

    const slug = await resolvePartnerSlug(this.prisma.db, companyName);

    const partner = await this.prisma.db.partnerCompany.create({
      data: {
        companyId: company.id,
        type: dto.type,
        name: companyName,
        slug,
        status: PartnerCompanyStatus.active,
        publicationStatus: PublicationStatus.draft,
        featured: false,
      },
    });

    await this.provisioning.sendSetPasswordInviteBestEffort({
      userId: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      ...(dto.locale ? { locale: dto.locale } : {}),
    });

    return this.getById(partner.id);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAdminPartnerDto,
  ): Promise<AdminPartnerDetail> {
    await this.getById(id);

    const slug =
      dto.slug !== undefined
        ? await resolvePartnerSlug(this.prisma.db, dto.name ?? 'partner', dto.slug, id)
        : undefined;

    await this.prisma.db.partnerCompany.update({
      where: { id },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(dto.logoMediaId !== undefined ? { logoMediaId: dto.logoMediaId } : {}),
        ...(dto.coverMediaId !== undefined ? { coverMediaId: dto.coverMediaId } : {}),
        ...(dto.shortDescription !== undefined ? { shortDescription: dto.shortDescription } : {}),
        ...(dto.fullDescription !== undefined ? { fullDescription: dto.fullDescription } : {}),
        ...(dto.contacts !== undefined ? { contacts: dto.contacts as Prisma.InputJsonValue } : {}),
        ...(dto.website !== undefined ? { website: dto.website } : {}),
        ...(dto.socialLinks !== undefined
          ? { socialLinks: dto.socialLinks as Prisma.InputJsonValue }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.publicationStatus !== undefined
          ? { publicationStatus: dto.publicationStatus }
          : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      },
    });

    await upsertPartnerProfileTranslations(this.prisma.db, id, userId, dto.translations);

    if (dto.publicationStatus !== undefined) {
      this.webRevalidation.revalidatePartners();
    }

    return this.getById(id);
  }

  async requirePartner(id: string) {
    const partner = await this.prisma.db.partnerCompany.findUnique({
      where: { id },
    });
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return partner;
  }
}
