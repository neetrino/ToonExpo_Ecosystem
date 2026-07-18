import { Injectable } from "@nestjs/common";
import type {
  ServiceProviderCategoryItem,
  ServiceProviderCategoryListResponse,
} from "@toonexpo/contracts";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toServiceProviderCategoryItem } from "../mappers/service-provider.mapper.js";
import { serviceProviderCategoryNotFound } from "../utils/service-provider-access.js";
import type { CreateServiceProviderCategoryDto } from "./dto/service-provider-category.dto.js";
import type { UpdateServiceProviderCategoryDto } from "./dto/service-provider-category.dto.js";

@Injectable()
export class AdminServiceProviderCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ServiceProviderCategoryListResponse> {
    const rows = await this.prisma.db.serviceProviderCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return { data: rows.map(toServiceProviderCategoryItem) };
  }

  async create(
    body: CreateServiceProviderCategoryDto,
  ): Promise<ServiceProviderCategoryItem> {
    const category = await this.prisma.db.serviceProviderCategory.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        sortOrder: body.sortOrder ?? 0,
        active: body.active ?? true,
      },
    });

    return toServiceProviderCategoryItem(category);
  }

  async update(
    id: string,
    body: UpdateServiceProviderCategoryDto,
  ): Promise<ServiceProviderCategoryItem> {
    await this.assertExists(id);

    const category = await this.prisma.db.serviceProviderCategory.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description?.trim() || null }
          : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
    });

    return toServiceProviderCategoryItem(category);
  }

  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.prisma.db.serviceProviderCategory.delete({ where: { id } });
  }

  private async assertExists(id: string): Promise<void> {
    const category = await this.prisma.db.serviceProviderCategory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw serviceProviderCategoryNotFound();
    }
  }
}
