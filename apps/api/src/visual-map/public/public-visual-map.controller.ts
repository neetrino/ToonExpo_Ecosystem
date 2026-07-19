import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { PublicVisualCanvasListResponse } from "@toonexpo/contracts";

import { Public } from "../../auth/decorators/public.decorator.js";
import { PublicVisualMapService } from "./public-visual-map.service.js";

@ApiTags("visual-map")
@Controller()
export class PublicVisualMapController {
  constructor(private readonly visualMapService: PublicVisualMapService) {}

  @Public()
  @Get("projects/:id/visual-canvases")
  @ApiOperation({ summary: "Published primary project visual canvas" })
  @ApiOkResponse({ description: "Published visual navigation for a project" })
  @ApiNotFoundResponse({ description: "Project not found or not published" })
  listForProject(
    @Param("id") projectId: string,
  ): Promise<PublicVisualCanvasListResponse> {
    return this.visualMapService.listForProject(projectId);
  }

  @Public()
  @Get("buildings/:id/visual-canvases")
  @ApiOperation({ summary: "Published primary building visual canvas" })
  @ApiOkResponse({ description: "Published visual navigation for a building" })
  @ApiNotFoundResponse({ description: "Building not found or not published" })
  listForBuilding(
    @Param("id") buildingId: string,
  ): Promise<PublicVisualCanvasListResponse> {
    return this.visualMapService.listForBuilding(buildingId);
  }

  @Public()
  @Get("floors/:id/visual-canvases")
  @ApiOperation({ summary: "Published primary floor visual canvas" })
  @ApiOkResponse({ description: "Published visual navigation for a floor" })
  @ApiNotFoundResponse({ description: "Floor not found or not published" })
  listForFloor(
    @Param("id") floorId: string,
  ): Promise<PublicVisualCanvasListResponse> {
    return this.visualMapService.listForFloor(floorId);
  }
}
