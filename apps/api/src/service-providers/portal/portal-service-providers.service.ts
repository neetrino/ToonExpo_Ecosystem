import { Injectable } from "@nestjs/common";
import type { PortalServiceProviderListResponse } from "@toonexpo/contracts";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toPortalServiceProviderItem } from "../mappers/service-provider.mapper.js";
import { providerInclude } from "../utils/service-provider-access.js";
import type { ListPortalServiceProvidersQueryDto } from "../admin/dto/service-provider.dto.js";

@Injectable()
export class PortalServiceProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async listByCategory(
    query: ListPortalServiceProvidersQueryDto,
  ): Promise<PortalServiceProviderListResponse> {
    const providers = await this.prisma.db.serviceProvider.findMany({
      where: {
        active: true,
        categories: {
          some: { serviceProviderCategoryId: query.categoryId },
        },
      },
      include: providerInclude,
      orderBy: [{ name: "asc" }],
    });

    return { data: providers.map(toPortalServiceProviderItem) };
  }
}
