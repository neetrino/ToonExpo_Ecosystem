import { Injectable, NotFoundException } from '@nestjs/common';
import type { CompanyProfileResponse, UpdateCompanyProfileRequest } from '@toonexpo/contracts';
import { CompanyMemberRole } from '@toonexpo/db';

import { buildCompanyProfilePatch } from '../companies/mappers/company.mapper.js';
import { toPublicFileUrl } from '../media/public-file-url.js';
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
    const profilePatch = buildCompanyProfilePatch(dto);

    if (logoMediaId !== undefined || Object.keys(profilePatch).length > 0) {
      await this.prisma.db.company.update({
        where: { id: companyId },
        data: {
          ...(logoMediaId !== undefined ? { logoMediaId } : {}),
          ...profilePatch,
        },
      });
    }

    return this.getByCompanyId(companyId, role);
  }

  private toProfileResponse(
    company: {
      id: string;
      name: string;
      description: string | null;
      type: CompanyProfileResponse['type'];
      status: CompanyProfileResponse['status'];
      logoMediaId: string | null;
      logoMedia: { fileUrl: string } | null;
      phone: string | null;
      contactPerson: string | null;
      email: string | null;
      websiteUrl: string | null;
      instagramUrl: string | null;
      facebookUrl: string | null;
      region: string | null;
      address: string | null;
      mediaMaterialsUrl: string | null;
      advertisingMaterialsUrl: string | null;
    },
    role: CompanyProfileResponse['role'],
  ): CompanyProfileResponse {
    return {
      id: company.id,
      name: company.name,
      description: company.description,
      type: company.type,
      status: company.status,
      logoMediaId: company.logoMediaId,
      logoUrl: company.logoMedia ? toPublicFileUrl(company.logoMedia.fileUrl) : null,
      phone: company.phone,
      contactPerson: company.contactPerson,
      email: company.email,
      websiteUrl: company.websiteUrl,
      instagramUrl: company.instagramUrl,
      facebookUrl: company.facebookUrl,
      region: company.region,
      address: company.address,
      mediaMaterialsUrl: company.mediaMaterialsUrl,
      advertisingMaterialsUrl: company.advertisingMaterialsUrl,
      role,
    };
  }
}
