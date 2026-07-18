import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  AccountType,
  CompanyMemberStatus,
  CompanyType,
} from "@toonexpo/db";
import type { Request } from "express";

import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { COMPANY_MEMBER_KEY } from "../decorators/company-member.decorator.js";
import type { CompanyMemberContext } from "../types/company-member-context.js";

type CompanyMemberMeta = {
  required: boolean;
  builderOnly: boolean;
};

type RequestWithCompanyMember = Request & {
  user?: AuthenticatedUser;
  companyMember?: CompanyMemberContext;
};

/**
 * Ensures the caller is an active company_member (any role).
 * Optionally requires Company.type = builder for Builder Portal routes.
 */
@Injectable()
export class CompanyMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.getAllAndOverride<CompanyMemberMeta | undefined>(
      COMPANY_MEMBER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!meta?.required) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<RequestWithCompanyMember>();
    const user = request.user;

    if (!user || user.accountType !== AccountType.company_member) {
      throw new ForbiddenException("Company member access required");
    }

    const membership = await this.loadMembership(user.id, meta.builderOnly);

    if (!membership || membership.status !== CompanyMemberStatus.active) {
      throw new ForbiddenException("Company member access required");
    }

    if (meta.builderOnly && membership.companyType !== CompanyType.builder) {
      throw new ForbiddenException("Builder company access required");
    }

    request.companyMember = {
      companyId: membership.companyId,
      membershipId: membership.id,
      role: membership.role,
    };

    return true;
  }

  private async loadMembership(userId: string, builderOnly: boolean) {
    if (builderOnly) {
      const row = await this.prisma.db.companyMember.findUnique({
        where: { userId },
        include: { company: { select: { type: true } } },
      });
      if (!row) {
        return null;
      }
      return {
        id: row.id,
        companyId: row.companyId,
        role: row.role,
        status: row.status,
        companyType: row.company.type,
      };
    }

    const row = await this.prisma.db.companyMember.findUnique({
      where: { userId },
    });
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      companyId: row.companyId,
      role: row.role,
      status: row.status,
      companyType: null as CompanyType | null,
    };
  }
}
