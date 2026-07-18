import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CompanyProfileResponse,
  UpdateCompanyProfileRequest,
} from "@toonexpo/contracts";

import { resolveOptionalCompanyLogoMediaId } from "../media/utils/media-ownership.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CompanyMemberContext } from "./types/company-member-context.js";

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

    return this.toProfileResponse(company, member.role);
  }

  async updateMyCompany(
    member: CompanyMemberContext,
    dto: UpdateCompanyProfileRequest,
  ): Promise<CompanyProfileResponse> {
    const company = await this.prisma.db.company.findUnique({
      where: { id: member.companyId },
      include: { logoMedia: { select: { fileUrl: true } } },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    const logoMediaId = await resolveOptionalCompanyLogoMediaId(
      this.prisma,
      dto.logoMediaId,
      member.companyId,
    );

    if (logoMediaId !== undefined) {
      await this.prisma.db.company.update({
        where: { id: member.companyId },
        data: { logoMediaId },
      });
    }

    return this.getMyCompany(member);
  }

  private toProfileResponse(
    company: {
      id: string;
      name: string;
      type: CompanyProfileResponse["type"];
      status: CompanyProfileResponse["status"];
      logoMediaId: string | null;
      logoMedia: { fileUrl: string } | null;
    },
    role: CompanyProfileResponse["role"],
  ): CompanyProfileResponse {
    return {
      id: company.id,
      name: company.name,
      type: company.type,
      status: company.status,
      logoMediaId: company.logoMediaId,
      logoUrl: company.logoMedia?.fileUrl ?? null,
      role,
    };
  }
}
