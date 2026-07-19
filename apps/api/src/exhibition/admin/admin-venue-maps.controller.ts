import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  RouteGraphResponse,
  VenueMapListResponse,
  VenueMapSummary,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { AdminVenueMapsService } from "./admin-venue-maps.service.js";
import { CreateVenueMapDto } from "./dto/create-venue-map.dto.js";
import { RouteGraphDto } from "./dto/route-graph.dto.js";
import { UpdateVenueMapDto } from "./dto/update-venue-map.dto.js";

@ApiTags("admin-venue-maps")
@AccountTypes("platform_admin")
@Controller()
export class AdminVenueMapsController {
  constructor(private readonly venueMaps: AdminVenueMapsService) {}

  @Get("admin/events/:eventId/venue-maps")
  @ApiOperation({ summary: "List venue maps for an event" })
  @ApiOkResponse({ description: "Venue map list" })
  listByEvent(
    @Param("eventId") eventId: string,
  ): Promise<VenueMapListResponse> {
    return this.venueMaps.listByEvent(eventId);
  }

  @Post("admin/events/:eventId/venue-maps")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create venue map for an event" })
  @ApiCreatedResponse({ description: "Created venue map" })
  create(
    @Param("eventId") eventId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateVenueMapDto,
  ): Promise<VenueMapSummary> {
    return this.venueMaps.create(eventId, user.id, body);
  }

  @Patch("admin/venue-maps/:id")
  @ApiOperation({ summary: "Update venue map" })
  @ApiOkResponse({ description: "Updated venue map" })
  update(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateVenueMapDto,
  ): Promise<VenueMapSummary> {
    return this.venueMaps.update(id, user.id, body);
  }

  @Delete("admin/venue-maps/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete venue map" })
  @ApiNoContentResponse({ description: "Deleted venue map" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.venueMaps.remove(id);
  }

  @Get("admin/venue-maps/:mapId/route-graph")
  @ApiOperation({ summary: "Get route graph for a venue map" })
  @ApiOkResponse({ description: "Route nodes and edges" })
  getRouteGraph(@Param("mapId") mapId: string): Promise<RouteGraphResponse> {
    return this.venueMaps.getRouteGraph(mapId);
  }

  @Put("admin/venue-maps/:mapId/route-graph")
  @ApiOperation({ summary: "Replace route graph for a venue map" })
  @ApiOkResponse({ description: "Updated route graph" })
  replaceRouteGraph(
    @Param("mapId") mapId: string,
    @Body() body: RouteGraphDto,
  ): Promise<RouteGraphResponse> {
    return this.venueMaps.replaceRouteGraph(mapId, body);
  }
}
