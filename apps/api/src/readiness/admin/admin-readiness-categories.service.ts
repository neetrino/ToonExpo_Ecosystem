import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  ReadinessCategoryItem,
  ReadinessCategoryListResponse,
} from "@toonexpo/contracts";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toReadinessCategoryItem } from "../mappers/readiness.mapper.js";
import type { CreateReadinessCategoryDto } from "./dto/readiness-category.dto.js";
import type { UpdateReadinessCategoryDto } from "./dto/readiness-category.dto.js";

@Injectable()
export class AdminReadinessCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ReadinessCategoryListResponse> {
    const rows = await this.prisma.db.readinessCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return { data: rows.map(toReadinessCategoryItem) };
  }

  async create(body: CreateReadinessCategoryDto): Promise<ReadinessCategoryItem> {
    if (body.serviceProviderCategoryId) {
      await this.assertServiceProviderCategoryExists(body.serviceProviderCategoryId);
    }

    const category = await this.prisma.db.readinessCategory.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        weight: body.weight ?? null,
        sortOrder: body.sortOrder ?? 0,
        serviceProviderCategoryId: body.serviceProviderCategoryId?.trim() || null,
        active: body.active ?? true,
      },
    });

    return toReadinessCategoryItem(category);
  }

  async update(
    id: string,
    body: UpdateReadinessCategoryDto,
  ): Promise<ReadinessCategoryItem> {
    await this.assertExists(id);

    if (body.serviceProviderCategoryId) {
      await this.assertServiceProviderCategoryExists(body.serviceProviderCategoryId);
    }

    const category = await this.prisma.db.readinessCategory.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description?.trim() || null }
          : {}),
        ...(body.weight !== undefined ? { weight: body.weight } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.serviceProviderCategoryId !== undefined
          ? {
              serviceProviderCategoryId:
                body.serviceProviderCategoryId?.trim() || null,
            }
          : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
    });

    return toReadinessCategoryItem(category);
  }

  private async assertServiceProviderCategoryExists(
    categoryId: string,
  ): Promise<void> {
    const category = await this.prisma.db.serviceProviderCategory.findUnique({
      where: { id: categoryId.trim() },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException("Service provider category not found");
    }
  }

  private async assertExists(id: string): Promise<void> {
    const category = await this.prisma.db.readinessCategory.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!category) {
      throw new NotFoundException("Readiness category not found");
    }
  }
}
