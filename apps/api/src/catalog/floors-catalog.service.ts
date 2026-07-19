import { Injectable, NotFoundException } from "@nestjs/common";
import type { FloorDetail } from "@toonexpo/contracts";
import { PublicationStatus } from "@toonexpo/db";

import { AnalyticsService } from "../analytics/analytics.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PUBLIC_PUBLICATION_STATUS } from "./catalog.constants.js";
import type { CatalogViewerContext } from "./projects.service.js";
import { publishedApartmentWhere } from "./mappers/catalog.mapper.js";
import { mapFloorDetail } from "./mappers/inventory.mapper.js";
import { loadTranslations } from "./utils/load-translations.js";
import {
  resolveCatalogLocale,
  TRANSLATION_ENTITY,
} from "./utils/resolve-translation.js";

@Injectable()
export class FloorsCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async getFloorById(
    floorId: string,
    viewer: CatalogViewerContext,
  ): Promise<FloorDetail> {
    const locale = resolveCatalogLocale(viewer.locale);
    const floor = await this.prisma.db.floor.findFirst({
      where: {
        id: floorId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
        building: {
          publicationStatus: PUBLIC_PUBLICATION_STATUS,
          project: { publicationStatus: PublicationStatus.published },
        },
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            projectId: true,
            project: { select: { id: true, name: true, slug: true } },
          },
        },
        apartments: {
          where: publishedApartmentWhere(),
          orderBy: [{ number: "asc" }],
          select: {
            id: true,
            number: true,
            salesStatus: true,
            rooms: true,
            areaTotal: true,
            price: true,
            priceCurrency: true,
            priceVisibility: true,
          },
        },
      },
    });

    if (!floor) {
      throw new NotFoundException("Floor not found");
    }

    const translations = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.project,
      [floor.building.project.id],
    );

    this.analytics.track({
      eventType: "floor_view",
      floorId: floor.id,
      buildingId: floor.buildingId,
      projectId: floor.building.projectId,
    });

    return mapFloorDetail(
      {
        ...floor,
        building: {
          id: floor.building.id,
          name: floor.building.name,
        },
        project: floor.building.project,
      },
      {
        locale,
        isAuthenticated: viewer.isAuthenticated,
        translations,
      },
    );
  }
}
