import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CompanyListResponse,
  CompanyResponse,
  ProvisionCompanyResponse,
} from "@toonexpo/contracts";
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  UserStatus,
} from "@toonexpo/db";

import { InviteMailerService } from "../../access-tokens/invite-mailer.service.js";
import { normalizeEmail, toUserResponse } from "../../auth/mappers/user.mapper.js";
import { toCompanyResponse } from "../../companies/mappers/company.mapper.js";
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
    private readonly inviteMailer: InviteMailerService,
  ) {}

  async create(input: CreateCompanyInput): Promise<ProvisionCompanyResponse> {
    const email = normalizeEmail(input.adminEmail);
    await this.assertEmailAvailable(email);

    const result = await this.prisma.db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: input.name.trim(),
          type: input.type,
          description: input.description?.trim() || null,
          status: CompanyStatus.active,
          source: CompanySource.admin,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          name: input.adminName.trim(),
          email,
          phone: input.adminPhone?.trim() || null,
          accountType: AccountType.company_member,
          status: UserStatus.invited,
          companyMembership: {
            create: {
              companyId: company.id,
              role: CompanyMemberRole.company_admin,
              status: CompanyMemberStatus.active,
            },
          },
        },
      });

      return { company, adminUser };
    });

    await this.inviteMailer.sendSetPasswordInvite({
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

    await this.inviteMailer.sendSetPasswordInvite({
      userId: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      ...(locale ? { locale } : {}),
    });
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.db.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email is already registered");
    }
  }
}
