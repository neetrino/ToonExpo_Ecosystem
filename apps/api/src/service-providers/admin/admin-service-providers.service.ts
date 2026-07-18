import { Injectable } from "@nestjs/common";
import type {
  AdminServiceProviderItem,
  AdminServiceProviderListResponse,
} from "@toonexpo/contracts";
import { Prisma, type ServiceProviderType } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toAdminServiceProviderItem } from "../mappers/service-provider.mapper.js";
import {
  assertCategoryIdsExist,
  providerInclude,
  replaceProviderCategories,
  serviceProviderNotFound,
} from "../utils/service-provider-access.js";
import type { CreateServiceProviderDto } from "./dto/service-provider.dto.js";
import type { ListAdminServiceProvidersQueryDto } from "./dto/service-provider.dto.js";
import type { UpdateServiceProviderDto } from "./dto/service-provider.dto.js";

@Injectable()
export class AdminServiceProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListAdminServiceProvidersQueryDto,
  ): Promise<AdminServiceProviderListResponse> {
    const where = this.buildWhere(query);

    const providers = await this.prisma.db.serviceProvider.findMany({
      where,
      include: providerInclude,
      orderBy: [{ active: "desc" }, { name: "asc" }],
    });

    return { data: providers.map(toAdminServiceProviderItem) };
  }

  async getById(id: string): Promise<AdminServiceProviderItem> {
    const provider = await this.prisma.db.serviceProvider.findUnique({
      where: { id },
      include: providerInclude,
    });

    if (!provider) {
      throw serviceProviderNotFound();
    }

    return toAdminServiceProviderItem(provider);
  }

  async create(
    userId: string,
    body: CreateServiceProviderDto,
  ): Promise<AdminServiceProviderItem> {
    const categoryIds = body.categoryIds ?? [];
    await assertCategoryIdsExist(this.prisma.db, categoryIds);

    const provider = await this.prisma.db.serviceProvider.create({
      data: {
        name: body.name.trim(),
        providerType: body.providerType,
        description: body.description?.trim() || null,
        services: body.services?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        website: body.website?.trim() || null,
        ...(body.socialLinks !== undefined
          ? { socialLinks: body.socialLinks as Prisma.InputJsonValue }
          : {}),
        internalNotes: body.internalNotes?.trim() || null,
        active: body.active ?? true,
        publicationStatus: body.publicationStatus ?? null,
        createdBy: { connect: { id: userId } },
      },
      include: providerInclude,
    });

    if (categoryIds.length > 0) {
      await replaceProviderCategories(this.prisma.db, provider.id, categoryIds);
    }

    return this.getById(provider.id);
  }

  async update(
    id: string,
    userId: string,
    body: UpdateServiceProviderDto,
  ): Promise<AdminServiceProviderItem> {
    await this.requireProvider(id);

    if (body.categoryIds !== undefined) {
      await assertCategoryIdsExist(this.prisma.db, body.categoryIds);
    }

    await this.prisma.db.serviceProvider.update({
      where: { id },
      data: this.buildUpdateData(userId, body),
    });

    if (body.categoryIds !== undefined) {
      await replaceProviderCategories(this.prisma.db, id, body.categoryIds);
    }

    return this.getById(id);
  }

  async remove(id: string): Promise<void> {
    await this.requireProvider(id);
    await this.prisma.db.serviceProvider.delete({ where: { id } });
  }

  private buildWhere(
    query: ListAdminServiceProvidersQueryDto,
  ): Prisma.ServiceProviderWhereInput {
    const where: Prisma.ServiceProviderWhereInput = {};

    if (query.active !== undefined) {
      where.active = query.active;
    }
    if (query.providerType) {
      where.providerType = query.providerType as ServiceProviderType;
    }
    if (query.search?.trim()) {
      where.name = { contains: query.search.trim(), mode: "insensitive" };
    }
    if (query.categoryId) {
      where.categories = {
        some: { serviceProviderCategoryId: query.categoryId },
      };
    }

    return where;
  }

  private buildUpdateData(
    userId: string,
    body: UpdateServiceProviderDto,
  ): Prisma.ServiceProviderUpdateInput {
    return {
      updatedBy: { connect: { id: userId } },
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.providerType !== undefined ? { providerType: body.providerType } : {}),
      ...(body.description !== undefined
        ? { description: body.description?.trim() || null }
        : {}),
      ...(body.services !== undefined ? { services: body.services?.trim() || null } : {}),
      ...(body.phone !== undefined ? { phone: body.phone?.trim() || null } : {}),
      ...(body.email !== undefined ? { email: body.email?.trim() || null } : {}),
      ...(body.website !== undefined ? { website: body.website?.trim() || null } : {}),
      ...(body.socialLinks !== undefined
        ? { socialLinks: body.socialLinks as Prisma.InputJsonValue }
        : {}),
      ...(body.internalNotes !== undefined
        ? { internalNotes: body.internalNotes?.trim() || null }
        : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
      ...(body.publicationStatus !== undefined
        ? { publicationStatus: body.publicationStatus }
        : {}),
    };
  }

  private async requireProvider(id: string) {
    const provider = await this.prisma.db.serviceProvider.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!provider) {
      throw serviceProviderNotFound();
    }

    return provider;
  }
}
