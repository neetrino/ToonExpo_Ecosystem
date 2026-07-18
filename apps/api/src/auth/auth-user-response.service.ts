import { Injectable } from "@nestjs/common";
import type { UserResponse } from "@toonexpo/contracts";
import { AccountType, CompanyMemberStatus } from "@toonexpo/db";

import { PrismaService } from "../prisma/prisma.service.js";
import { toUserResponse } from "./mappers/user.mapper.js";

type UserRecord = Parameters<typeof toUserResponse>[0];

/**
 * Builds public auth user payloads, including company type for members.
 */
@Injectable()
export class AuthUserResponseService {
  constructor(private readonly prisma: PrismaService) {}

  async build(user: UserRecord): Promise<UserResponse> {
    const base = toUserResponse(user);

    if (user.accountType !== AccountType.company_member) {
      return base;
    }

    const membership = await this.prisma.db.companyMember.findFirst({
      where: {
        userId: user.id,
        status: CompanyMemberStatus.active,
      },
      select: {
        company: { select: { type: true } },
      },
    });

    return {
      ...base,
      companyType: membership?.company.type ?? null,
    };
  }
}
