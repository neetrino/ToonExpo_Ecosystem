import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyType } from '@toonexpo/db';

import { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Validates that a company exists and is a builder (catalog owner).
 */
@Injectable()
export class AdminBuilderCompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async requireBuilderCompanyId(companyId: string): Promise<string> {
    const company = await this.prisma.db.company.findUnique({
      where: { id: companyId },
      select: { id: true, type: true },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    if (company.type !== CompanyType.builder) {
      throw new BadRequestException('Company is not a builder');
    }
    return company.id;
  }
}
