import { Injectable, NotFoundException } from "@nestjs/common";
import type { CompanyProfileResponse } from "@toonexpo/contracts";

import type { CompanyMemberContext } from "./types/company-member-context.js";
import { PrismaService } from "../prisma/prisma.service.js";

/**
 * Resolves the authenticated company member's company profile.
 */
@Injectable()
export class CompanyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCompany(
    member: CompanyMemberContext,
  ): Promise<CompanyProfileResponse> {
    const company = await this.prisma.db.company.findUnique({
      where: { id: member.companyId },
      include: { logoMedia: { select: { fileUrl: true } } },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return {
      id: company.id,
      name: company.name,
      type: company.type,
      status: company.status,
      logoUrl: company.logoMedia?.fileUrl ?? null,
      role: member.role,
    };
  }
}
