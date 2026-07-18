import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  ApartmentPriceOverlayItem,
  ProjectPriceRangeOverlay,
  ProjectPricesOverlay,
} from "@toonexpo/contracts";
import type { ApartmentSalesStatus, Prisma } from "@toonexpo/db";

import { PrismaService } from "../prisma/prisma.service.js";
import { PUBLIC_PUBLICATION_STATUS } from "./catalog.constants.js";
import { aggregateVisiblePrices } from "./mappers/aggregate-prices.js";
import {
  decimalToString,
  publishedApartmentWhere,
  shouldRevealPrice,
} from "./mappers/catalog.mapper.js";

type PricedApartmentRow = {
  id: string;
  salesStatus: ApartmentSalesStatus;
  price: Prisma.Decimal | null;
  priceCurrency: string;
  priceVisibility: string;
};

const APARTMENT_PRICE_SELECT = {
  id: true,
  salesStatus: true,
  price: true,
  priceCurrency: true,
  priceVisibility: true,
} as const;

/**
 * Whether this apartment's price is visible only to authenticated viewers
 * (i.e. part of the login overlay, not of the anonymous cached payload).
 */
const isLoginOnlyPrice = (row: PricedApartmentRow): boolean =>
  row.price != null &&
  shouldRevealPrice(row.priceVisibility, true) &&
  !shouldRevealPrice(row.priceVisibility, false);

/**
 * Authenticated price overlay on top of the anonymous cached catalog:
 * per-apartment `visible_after_login` prices and logged-in min/max ranges.
 * Reuses the same visibility rules as the public catalog mappers.
 */
@Injectable()
export class CatalogPricesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Full overlay for one published project: range + login-only apartment prices. */
  async getProjectPrices(projectId: string): Promise<ProjectPricesOverlay> {
    const project = await this.prisma.db.project.findFirst({
      where: {
        id: projectId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
      },
      select: {
        id: true,
        apartments: {
          where: publishedApartmentWhere(),
          select: APARTMENT_PRICE_SELECT,
        },
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return {
      ...this.toRangeOverlay(project.id, project.apartments),
      apartments: this.toApartmentOverlays(project.apartments),
    };
  }

  /** Logged-in min/max ranges for a batch of published projects (list cards). */
  async getProjectPriceRanges(
    projectIds: string[],
  ): Promise<ProjectPriceRangeOverlay[]> {
    const projects = await this.prisma.db.project.findMany({
      where: {
        id: { in: projectIds },
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
      },
      select: {
        id: true,
        apartments: {
          where: publishedApartmentWhere(),
          select: APARTMENT_PRICE_SELECT,
        },
      },
    });

    return projects.map((project) =>
      this.toRangeOverlay(project.id, project.apartments),
    );
  }

  private toRangeOverlay(
    projectId: string,
    apartments: PricedApartmentRow[],
  ): ProjectPriceRangeOverlay {
    const range = aggregateVisiblePrices(apartments, true);
    return { projectId, ...range };
  }

  private toApartmentOverlays(
    apartments: PricedApartmentRow[],
  ): ApartmentPriceOverlayItem[] {
    return apartments.filter(isLoginOnlyPrice).map((apartment) => ({
      id: apartment.id,
      price: decimalToString(apartment.price) ?? "",
      priceCurrency: apartment.priceCurrency,
    }));
  }
}
