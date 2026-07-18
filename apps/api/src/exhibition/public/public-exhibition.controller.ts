import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  BoothSearchResponse,
  CurrentEventResponse,
  PublicBoothListResponse,
  PublicEntranceNodeListResponse,
  RoutePathResponse,
} from "@toonexpo/contracts";

import { Public } from "../../auth/decorators/public.decorator.js";
import { CatalogLocaleQueryDto } from "../../catalog/dto/catalog-locale.query.dto.js";
import { BoothSearchQueryDto } from "./dto/booth-search.query.dto.js";
import { RouteQueryDto } from "./dto/route.query.dto.js";
import { PublicExhibitionService } from "./public-exhibition.service.js";

@ApiTags("exhibition-public")
@Controller()
export class PublicExhibitionController {
  constructor(private readonly exhibition: PublicExhibitionService) {}

  @Public()
  @Get("events/current")
  @ApiOperation({ summary: "Get active published event with venue maps" })
  @ApiOkResponse({ description: "Current event" })
  @ApiNotFoundResponse({ description: "No published active event" })
  currentEvent(): Promise<CurrentEventResponse> {
    return this.exhibition.getCurrentEvent();
  }

  @Public()
  @Get("venue-maps/:id/booths")
  @ApiOperation({ summary: "List published booths with assignments" })
  @ApiOkResponse({ description: "Published booths" })
  listBooths(
    @Param("id") id: string,
    @Query() query: CatalogLocaleQueryDto,
  ): Promise<PublicBoothListResponse> {
    return this.exhibition.listPublishedBooths(id, query.locale);
  }

  @Public()
  @Get("venue-maps/:id/search")
  @ApiOperation({ summary: "Search booths by company, project, or code" })
  @ApiOkResponse({ description: "Search results" })
  searchBooths(
    @Param("id") id: string,
    @Query() query: BoothSearchQueryDto,
  ): Promise<BoothSearchResponse> {
    return this.exhibition.searchBooths(id, query.q, query.locale);
  }

  @Public()
  @Get("venue-maps/:id/entrance-nodes")
  @ApiOperation({ summary: "List entrance route nodes on a published venue map" })
  @ApiOkResponse({ description: "Entrance nodes" })
  @ApiNotFoundResponse({ description: "Published venue map not found" })
  entranceNodes(@Param("id") id: string): Promise<PublicEntranceNodeListResponse> {
    return this.exhibition.listEntranceNodes(id);
  }

  @Public()
  @Get("venue-maps/:id/route")
  @ApiOperation({ summary: "Shortest path from start node to booth" })
  @ApiOkResponse({ description: "Route path or unavailable fallback" })
  route(
    @Param("id") id: string,
    @Query() query: RouteQueryDto,
  ): Promise<RoutePathResponse> {
    return this.exhibition.computeRoute(id, query.fromNodeId, query.toBoothId);
  }
}
