import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { ReadinessCriterionItem } from '@toonexpo/contracts';

import { PrismaService } from '../../prisma/prisma.service.js';
import { toReadinessCriterionItem } from '../mappers/readiness.mapper.js';
import type { UpdateReadinessCriterionDto } from './dto/readiness-criterion.dto.js';

@Injectable()
export class AdminReadinessCriteriaService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, body: UpdateReadinessCriterionDto): Promise<ReadinessCriterionItem> {
    await this.assertExists(id);

    if (body.serviceProviderCategoryId) {
      await this.assertServiceProviderCategoryExists(body.serviceProviderCategoryId);
    }

    const criterion = await this.prisma.db.readinessCriterion.update({
      where: { id },
      data: {
        ...(body.serviceProviderCategoryId !== undefined
          ? {
              serviceProviderCategoryId: body.serviceProviderCategoryId?.trim() || null,
            }
          : {}),
      },
    });

    return toReadinessCriterionItem(criterion);
  }

  private async assertServiceProviderCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.db.serviceProviderCategory.findUnique({
      where: { id: categoryId.trim() },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException('Service provider category not found');
    }
  }

  private async assertExists(id: string): Promise<void> {
    const criterion = await this.prisma.db.readinessCriterion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!criterion) {
      throw new NotFoundException('Readiness criterion not found');
    }
  }
}
