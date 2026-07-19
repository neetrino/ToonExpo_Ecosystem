import { Injectable, NotFoundException } from '@nestjs/common';
import type { CompanyProfileResponse, UpdateCompanyProfileRequest } from '@toonexpo/contracts';
import { CompanyMemberRole } from '@toonexpo/db';

import { resolveOptionalCompanyLogoMediaId } from '../media/utils/media-ownership.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompanyMemberContext } from './types/company-member-context.js';

/**
 * Resolves company profile for members and platform-admin overrides.
 */
@Injectable()
export class CompanyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCompany(member: CompanyMemberContext): Promise<CompanyProfileResponse> {
    return this.getByCompanyId(member.companyId, member.role);
  }

  async updateMyCompany(
    member: CompanyMemberContext,
    dto: UpdateCompanyProfileRequest,
  ): Promise<CompanyProfileResponse> {
    return this.updateByCompanyId(member.companyId, dto, member.role);
  }

  async getByCompanyId(
    companyId: string,
    role: CompanyProfileResponse['role'] = CompanyMemberRole.company_admin,
  ): Promise<CompanyProfileResponse> {
    const company = await this.prisma.db.company.findUnique({
      where: { id: companyId },
      include: { logoMedia: { select: { fileUrl: true } } },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.toProfileResponse(company, role);
  }

  async updateByCompanyId(
    companyId: string,
    dto: UpdateCompanyProfileRequest,
    role: CompanyProfileResponse['role'] = CompanyMemberRole.company_admin,
  ): Promise<CompanyProfileResponse> {
    const company = await this.prisma.db.company.findUnique({
      where: { id: companyId },
      include: { logoMedia: { select: { fileUrl: true } } },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const logoMediaId = await resolveOptionalCompanyLogoMediaId(
      this.prisma,
      dto.logoMediaId,
      companyId,
    );

    if (logoMediaId !== undefined) {
      await this.prisma.db.company.update({
        where: { id: companyId },
        data: { logoMediaId },
      });
    }

    return this.getByCompanyId(companyId, role);
  }

  private toProfileResponse(
    company: {
      id: string;
      name: string;
      type: CompanyProfileResponse['type'];
      status: CompanyProfileResponse['status'];
      logoMediaId: string | null;
      logoMedia: { fileUrl: string } | null;
    },
    role: CompanyProfileResponse['role'],
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
