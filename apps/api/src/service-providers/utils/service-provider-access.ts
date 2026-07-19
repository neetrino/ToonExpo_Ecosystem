import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";

type ServiceProviderClient = PrismaService["db"];

export const serviceProviderNotFound = (): NotFoundException =>
  new NotFoundException("Service provider not found");

export const serviceProviderCategoryNotFound = (): NotFoundException =>
  new NotFoundException("Service provider category not found");

export const providerInclude = {
  categories: {
    include: {
      category: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.ServiceProviderInclude;

export const assertCategoryIdsExist = async (
  db: ServiceProviderClient,
  categoryIds: string[],
): Promise<void> => {
  if (categoryIds.length === 0) {
    return;
  }

  const uniqueIds = [...new Set(categoryIds)];
  const count = await db.serviceProviderCategory.count({
    where: { id: { in: uniqueIds } },
  });

  if (count !== uniqueIds.length) {
    throw new BadRequestException("One or more service provider categories were not found");
  }
};

export const replaceProviderCategories = async (
  db: ServiceProviderClient,
  providerId: string,
  categoryIds: string[],
): Promise<void> => {
  await db.serviceProviderCategoryLink.deleteMany({
    where: { serviceProviderId: providerId },
  });

  if (categoryIds.length === 0) {
    return;
  }

  await db.serviceProviderCategoryLink.createMany({
    data: categoryIds.map((categoryId) => ({
      serviceProviderId: providerId,
      serviceProviderCategoryId: categoryId,
    })),
  });
};
