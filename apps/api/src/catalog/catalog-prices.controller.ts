import { Controller, Get, Header, Param, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type {
  ProjectPriceRangeOverlayListResponse,
  ProjectPricesOverlay,
} from "@toonexpo/contracts";

import { CATALOG_PRICES_CACHE_CONTROL } from "./catalog.constants.js";
import { CatalogPricesService } from "./catalog-prices.service.js";
import {
  ProjectPriceRangesQueryDto,
  parseProjectPriceRangeIds,
} from "./dto/project-price-ranges.query.dto.js";

/**
 * Session-authenticated price overlay on top of the anonymous cached catalog.
 * No @Public/@OptionalAuth: the global SessionAuthGuard requires a session and
 * the global ThrottlerGuard rate-limits like other buyer endpoints.
 */
@ApiTags("catalog-prices")
@Controller("catalog")
export class CatalogPricesController {
  constructor(private readonly pricesService: CatalogPricesService) {}

  @Get("projects/prices")
  @Header("Cache-Control", CATALOG_PRICES_CACHE_CONTROL)
  @ApiOperation({
    summary: "Authenticated min/max price ranges for a batch of projects",
  })
  @ApiOkResponse({ description: "Per-project logged-in price ranges" })
  @ApiUnauthorizedResponse({ description: "Session required" })
  async getProjectPriceRanges(
    @Query() query: ProjectPriceRangesQueryDto,
  ): Promise<ProjectPriceRangeOverlayListResponse> {
    const ids = parseProjectPriceRangeIds(query.ids);
    return { data: await this.pricesService.getProjectPriceRanges(ids) };
  }

  @Get("projects/:id/prices")
  @Header("Cache-Control", CATALOG_PRICES_CACHE_CONTROL)
  @ApiOperation({
    summary:
      "Authenticated price overlay for one project (visible_after_login units)",
  })
  @ApiOkResponse({ description: "Project range + login-only apartment prices" })
  @ApiUnauthorizedResponse({ description: "Session required" })
  @ApiNotFoundResponse({ description: "Project not found or not published" })
  getProjectPrices(@Param("id") id: string): Promise<ProjectPricesOverlay> {
    return this.pricesService.getProjectPrices(id);
  }
}
