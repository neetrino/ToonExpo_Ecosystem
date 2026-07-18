import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AdminCompanyProjectListResponse,
  CompanyListResponse,
  CompanyResponse,
  ProvisionCompanyResponse,
} from "@toonexpo/contracts";
import {
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  UserStatus,
} from "@toonexpo/db";

import { toUserResponse } from "../../auth/mappers/user.mapper.js";
import { toCompanyResponse } from "../../companies/mappers/company.mapper.js";
import { CompanyProvisioningService } from "../../company/provisioning/company-provisioning.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";

type CreateCompanyInput = {
  name: string;
  type: CompanyType;
  description?: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  locale?: string;
};

type UpdateCompanyInput = {
  name?: string;
  description?: string | null;
  status?: CompanyStatus;
};

/**
 * Platform-admin company provisioning and management.
 */
@Injectable()
export class AdminCompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: CompanyProvisioningService,
  ) {}

  async create(input: CreateCompanyInput): Promise<ProvisionCompanyResponse> {
    await this.provisioning.assertEmailAvailable(input.adminEmail);

    const result = await this.provisioning.createCompanyWithPrimaryAdmin({
      companyName: input.name.trim(),
      companyType: input.type,
      companyDescription: input.description?.trim() || null,
      source: CompanySource.admin,
      adminName: input.adminName.trim(),
      adminEmail: input.adminEmail,
      adminPhone: input.adminPhone?.trim() || null,
    });

    await this.provisioning.sendSetPasswordInvite({
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

  async list(page: number, pageSize: number): Promise<CompanyListResponse> {
    const skip = (page - 1) * pageSize;
    const [total, rows] = await this.prisma.db.$transaction([
      this.prisma.db.company.count(),
      this.prisma.db.company.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
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
    const company = await this.prisma.db.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException("Company not found");
    }
    return toCompanyResponse(company);
  }

  async listProjects(companyId: string): Promise<AdminCompanyProjectListResponse> {
    await this.getById(companyId);

    const projects = await this.prisma.db.project.findMany({
      where: { builderCompanyId: companyId },
      orderBy: [{ updatedAt: "desc" }],
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

  async update(id: string, input: UpdateCompanyInput): Promise<CompanyResponse> {
    await this.getById(id);
    const company = await this.prisma.db.company.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
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
      orderBy: { createdAt: "asc" },
    });

    if (!membership) {
      throw new NotFoundException("No invited company admin found");
    }

    await this.provisioning.sendSetPasswordInvite({
      userId: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      ...(locale ? { locale } : {}),
    });
  }
}
