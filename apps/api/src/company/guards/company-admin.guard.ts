import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccountType, CompanyMemberRole, CompanyMemberStatus } from "@toonexpo/db";
import type { Request } from "express";

import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { COMPANY_ADMIN_KEY } from "../decorators/company-admin.decorator.js";
import type { CompanyAdminContext } from "../types/company-admin-context.js";

type RequestWithCompanyAdmin = Request & {
  user?: AuthenticatedUser;
  companyAdmin?: CompanyAdminContext;
};

/**
 * Ensures the caller is an active company_admin of exactly one company.
 */
@Injectable()
export class CompanyAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean | undefined>(
      COMPANY_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithCompanyAdmin>();
    const user = request.user;

    if (!user || user.accountType !== AccountType.company_member) {
      throw new ForbiddenException("Company admin access required");
    }

    const membership = await this.prisma.db.companyMember.findUnique({
      where: { userId: user.id },
    });

    if (
      !membership ||
      membership.role !== CompanyMemberRole.company_admin ||
      membership.status !== CompanyMemberStatus.active
    ) {
      throw new ForbiddenException("Company admin access required");
    }

    request.companyAdmin = {
      companyId: membership.companyId,
      membershipId: membership.id,
    };

    return true;
  }
}
