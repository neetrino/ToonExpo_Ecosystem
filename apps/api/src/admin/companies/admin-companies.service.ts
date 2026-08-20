import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminCompanyProjectListResponse,
  AdminProjectListResponse,
  AdminProjectScope,
  CompanyListResponse,
  CompanyResponse,
  ProvisionCompanyResponse,
} from '@toonexpo/contracts';
import {
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  ReadinessAssessmentTargetType,
  UserStatus,
  type Prisma,
} from '@toonexpo/db';

import { toMediaSummary } from '../../catalog/mappers/catalog.mapper.js';
import { TRANSLATION_ENTITY } from '../../catalog/utils/resolve-translation.js';
import { toPublicFileUrl } from '../../media/public-file-url.js';
import { resolveOptionalCompanyLogoMediaId } from '../../media/utils/media-ownership.js';
import { toUserResponse } from '../../auth/mappers/user.mapper.js';
import {
  buildCompanyProfilePatch,
  COMPANY_MEDIA_INCLUDE,
  toCompanyResponse,
} from '../../companies/mappers/company.mapper.js';
import { CompanyProvisioningService } from '../../company/provisioning/company-provisioning.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AdminReadinessAssessmentsService } from '../../readiness/admin/admin-readiness-assessments.service.js';

const COMPANY_DELETE_BLOCKED_MESSAGE =
  'Company cannot be deleted while it still has projects, requests, deals, or visual maps';

type CreateCompanyInput = {
  name: string;
  type: CompanyType;
  description?: string;
  shortDescription?: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  locale?: string;
};

type UpdateCompanyInput = {
  name?: string;
  description?: string | null;
  shortDescription?: string | null;
  status?: CompanyStatus;
  logoMediaId?: string | null;
  coverMediaId?: string | null;
  phone?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  region?: string | null;
  address?: string | null;
  mediaMaterialsUrl?: string | null;
  advertisingMaterialsUrl?: string | null;
};

/**
 * Company scope plus optional case-insensitive search for the admin projects list.
 */
const buildAdminProjectsWhere = (
  companyId: string | undefined,
  search: string | undefined,
): Prisma.ProjectWhereInput => {
  const where: Prisma.ProjectWhereInput = companyId ? { builderCompanyId: companyId } : {};
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

/**
 * Optional type + case-insensitive search for the admin companies list.
 */
const buildAdminCompaniesWhere = (
  type: CompanyType | undefined,
  search: string | undefined,
): Prisma.CompanyWhereInput => {
  const where: Prisma.CompanyWhereInput = type ? { type } : {};
  const needle = search?.trim();
  if (!needle) {
    return where;
  }

  where.OR = [
    { name: { contains: needle, mode: 'insensitive' } },
    { description: { contains: needle, mode: 'insensitive' } },
    { shortDescription: { contains: needle, mode: 'insensitive' } },
  ];
  return where;
};

/**
 * Platform-admin company provisioning and management.
 */
@Injectable()
export class AdminCompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: CompanyProvisioningService,
    private readonly readinessAssessments: AdminReadinessAssessmentsService,
  ) {}

  async create(input: CreateCompanyInput): Promise<ProvisionCompanyResponse> {
    await this.provisioning.assertEmailAvailable(input.adminEmail);

    const result = await this.provisioning.createCompanyWithPrimaryAdmin({
      companyName: input.name.trim(),
      companyType: input.type,
      companyDescription: input.description?.trim() || null,
      companyShortDescription: input.shortDescription?.trim() || null,
      source: CompanySource.admin,
      adminName: input.adminName.trim(),
      adminEmail: input.adminEmail,
      adminPhone: input.adminPhone?.trim() || null,
    });

    if (input.type === CompanyType.builder) {
      await this.readinessAssessments.create({
        targetType: ReadinessAssessmentTargetType.builder_company,
        builderCompanyId: result.company.id,
      });
    }

    await this.provisioning.sendSetPasswordInviteBestEffort({
      userId: result.adminUser.id,
      email: result.adminUser.email,
      name: result.adminUser.name,
      ...(input.locale ? { locale: input.locale } : {}),
    });

    return {
      company: toCompanyResponse(result.company),
      adminUser: toUserResponse(result.adminUser),
    };
  }

  async list(
    page: number,
    pageSize: number,
    type?: CompanyType,
    search?: string,
  ): Promise<CompanyListResponse> {
    const skip = (page - 1) * pageSize;
    const where = buildAdminCompaniesWhere(type, search);
    const [total, rows] = await Promise.all([
      this.prisma.db.company.count({ where }),
      this.prisma.db.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: COMPANY_MEDIA_INCLUDE,
      }),
    ]);

    return {
      data: rows.map(toCompanyResponse),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  async getById(id: string): Promise<CompanyResponse> {
    const company = await this.prisma.db.company.findUnique({
      where: { id },
      include: COMPANY_MEDIA_INCLUDE,
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return toCompanyResponse(company);
  }

  async listProjects(companyId: string): Promise<AdminCompanyProjectListResponse> {
    await this.getById(companyId);

    const projects = await this.prisma.db.project.findMany({
      where: { builderCompanyId: companyId },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        publicationStatus: true,
        createdAt: true,
      },
    });

    return {
      data: projects.map((project) => ({
        id: project.id,
        name: project.name,
        publicationStatus: project.publicationStatus,
        createdAt: project.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Lists projects across builder companies, optionally filtered by company and search term.
   */
  async listAllProjects(
    page: number,
    pageSize: number,
    companyId?: string,
    search?: string,
  ): Promise<AdminProjectListResponse> {
    if (companyId) {
      await this.getById(companyId);
    }

    const where = buildAdminProjectsWhere(companyId, search);

    const [total, featuredOnHomeTotal, projects] = await Promise.all([
      this.prisma.db.project.count({ where }),
      this.prisma.db.project.count({ where: { featuredOnHome: true } }),
      this.prisma.db.project.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          publicationStatus: true,
          createdAt: true,
          city: true,
          district: true,
          address: true,
          locationText: true,
          builderCompanyId: true,
          featuredOnHome: true,
          builderCompany: {
            select: {
              name: true,
              logoMedia: { select: { fileUrl: true } },
            },
          },
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
      }),
    ]);

    return {
      data: projects.map((project) => ({
        id: project.id,
        name: project.name,
        publicationStatus: project.publicationStatus,
        createdAt: project.createdAt.toISOString(),
        city: project.city,
        district: project.district,
        address: project.address,
        locationText: project.locationText,
        builderCompanyId: project.builderCompanyId,
        companyName: project.builderCompany.name,
        companyLogoUrl: project.builderCompany.logoMedia
          ? toPublicFileUrl(project.builderCompany.logoMedia.fileUrl)
          : null,
        cover: toMediaSummary(project.coverMedia),
        buildingsCount: project._count.buildings,
        apartmentsCount: project._count.apartments,
        featuredOnHome: project.featuredOnHome,
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        featuredOnHomeTotal,
      },
    };
  }

  /**
   * Resolves the builder company for an admin project UI route.
   */
  async getProjectScope(projectId: string): Promise<AdminProjectScope> {
    const project = await this.prisma.db.project.findUnique({
      where: { id: projectId },
      select: { builderCompanyId: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return { builderCompanyId: project.builderCompanyId };
  }

  async update(id: string, input: UpdateCompanyInput): Promise<CompanyResponse> {
    await this.getById(id);
    const logoMediaId = await resolveOptionalCompanyLogoMediaId(this.prisma, input.logoMediaId, id);
    const coverMediaId = await resolveOptionalCompanyLogoMediaId(
      this.prisma,
      input.coverMediaId,
      id,
    );
    const profilePatch = buildCompanyProfilePatch(input);
    const company = await this.prisma.db.company.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(logoMediaId !== undefined ? { logoMediaId } : {}),
        ...(coverMediaId !== undefined ? { coverMediaId } : {}),
        ...profilePatch,
      },
      include: COMPANY_MEDIA_INCLUDE,
    });
    return toCompanyResponse(company);
  }

  async resendInvite(companyId: string, locale?: string): Promise<void> {
    const membership = await this.prisma.db.companyMember.findFirst({
      where: {
        companyId,
        role: CompanyMemberRole.company_admin,
        status: { not: CompanyMemberStatus.removed },
        user: { status: UserStatus.invited },
      },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!membership) {
      throw new NotFoundException('No invited company admin found');
    }

    await this.provisioning.sendSetPasswordInvite({
      userId: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      ...(locale ? { locale } : {}),
    });
  }

  /**
   * Deletes a company that has no catalog/CRM dependencies.
   * Clears readiness assessments and translations first (Restrict FKs).
   */
  async remove(id: string): Promise<void> {
    await this.getById(id);

    const [projectsCount, requestsCount, dealsCount, canvasesCount] = await Promise.all([
      this.prisma.db.project.count({ where: { builderCompanyId: id } }),
      this.prisma.db.request.count({ where: { builderCompanyId: id } }),
      this.prisma.db.crmDeal.count({ where: { companyId: id } }),
      this.prisma.db.visualMapCanvas.count({ where: { ownerCompanyId: id } }),
    ]);

    if (projectsCount > 0 || requestsCount > 0 || dealsCount > 0 || canvasesCount > 0) {
      throw new ConflictException(COMPANY_DELETE_BLOCKED_MESSAGE);
    }

    await this.prisma.db.$transaction(async (tx) => {
      await tx.translation.deleteMany({
        where: { entityType: TRANSLATION_ENTITY.company, entityId: id },
      });
      await tx.readinessAssessment.deleteMany({
        where: { builderCompanyId: id },
      });
      await tx.company.delete({ where: { id } });
    });
  }
}
