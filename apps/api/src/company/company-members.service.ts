import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CompanyMemberListResponse,
  CompanyMemberResponse,
} from "@toonexpo/contracts";
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  UserStatus,
} from "@toonexpo/db";

import { InviteMailerService } from "../access-tokens/invite-mailer.service.js";
import { normalizeEmail } from "../auth/mappers/user.mapper.js";
import { toCompanyMemberResponse } from "../companies/mappers/company-member.mapper.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CompanyAdminContext } from "./types/company-admin-context.js";

type InviteInput = {
  name: string;
  email: string;
  phone?: string;
  role: CompanyMemberRole;
  locale?: string;
};

type UpdateMemberInput = {
  role?: CompanyMemberRole;
  status?: CompanyMemberStatus;
};

type MemberWithUser = {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyMemberRole;
  status: CompanyMemberStatus;
};

/**
 * Company-scoped team management for company_admin users.
 */
@Injectable()
export class CompanyMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inviteMailer: InviteMailerService,
  ) {}

  async invite(
    admin: CompanyAdminContext,
    inviterUserId: string,
    input: InviteInput,
  ): Promise<CompanyMemberResponse> {
    const email = normalizeEmail(input.email);
    await this.assertEmailAvailable(email);

    const member = await this.prisma.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email,
          phone: input.phone?.trim() || null,
          accountType: AccountType.company_member,
          status: UserStatus.invited,
          companyMembership: {
            create: {
              companyId: admin.companyId,
              role: input.role,
              status: CompanyMemberStatus.active,
              invitedByUserId: inviterUserId,
            },
          },
        },
        include: { companyMembership: true },
      });

      const membership = user.companyMembership;
      if (!membership) {
        throw new Error("Company membership missing after invite create");
      }

      return { ...membership, user };
    });

    await this.inviteMailer.sendSetPasswordInvite({
      userId: member.user.id,
      email: member.user.email,
      name: member.user.name,
      ...(input.locale ? { locale: input.locale } : {}),
    });

    return toCompanyMemberResponse(member);
  }

  async list(
    companyId: string,
    page: number,
    pageSize: number,
  ): Promise<CompanyMemberListResponse> {
    const where = {
      companyId,
      status: { not: CompanyMemberStatus.removed },
    };
    const skip = (page - 1) * pageSize;
    const [total, rows] = await this.prisma.db.$transaction([
      this.prisma.db.companyMember.count({ where }),
      this.prisma.db.companyMember.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "asc" },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map(toCompanyMemberResponse),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  async update(
    admin: CompanyAdminContext,
    actorUserId: string,
    memberId: string,
    input: UpdateMemberInput,
  ): Promise<CompanyMemberResponse> {
    const member = await this.prisma.db.companyMember.findFirst({
      where: { id: memberId, companyId: admin.companyId },
      include: { user: true },
    });

    if (!member || member.status === CompanyMemberStatus.removed) {
      throw new NotFoundException("Company member not found");
    }

    this.assertNotSelfDeactivation(actorUserId, member.userId, input.status);
    await this.assertNotLastAdminDemotion(member, input);

    const updated = await this.prisma.db.companyMember.update({
      where: { id: member.id },
      data: {
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      include: { user: true },
    });

    if (
      input.status === CompanyMemberStatus.inactive ||
      input.status === CompanyMemberStatus.removed
    ) {
      await this.prisma.db.user.update({
        where: { id: updated.userId },
        data: { status: UserStatus.inactive },
      });
    }

    return toCompanyMemberResponse(updated);
  }

  private assertNotSelfDeactivation(
    actorUserId: string,
    targetUserId: string,
    status: CompanyMemberStatus | undefined,
  ): void {
    if (
      actorUserId === targetUserId &&
      (status === CompanyMemberStatus.inactive ||
        status === CompanyMemberStatus.removed)
    ) {
      throw new ForbiddenException("Cannot deactivate your own membership");
    }
  }

  private async assertNotLastAdminDemotion(
    member: MemberWithUser,
    input: UpdateMemberInput,
  ): Promise<void> {
    const losesAdminRole =
      member.role === CompanyMemberRole.company_admin &&
      ((input.role !== undefined &&
        input.role !== CompanyMemberRole.company_admin) ||
        (input.status !== undefined &&
          input.status !== CompanyMemberStatus.active));

    if (!losesAdminRole) {
      return;
    }

    const activeAdminCount = await this.prisma.db.companyMember.count({
      where: {
        companyId: member.companyId,
        role: CompanyMemberRole.company_admin,
        status: CompanyMemberStatus.active,
      },
    });

    if (activeAdminCount <= 1) {
      throw new BadRequestException("Cannot remove the last company admin");
    }
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.db.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email is already registered");
    }
  }
}
