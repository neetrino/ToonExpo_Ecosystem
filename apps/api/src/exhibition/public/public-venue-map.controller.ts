import { Controller, Get } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { PublicVenueMapSnapshotResponse } from "@toonexpo/contracts";

import { Public } from "../../auth/decorators/public.decorator.js";
import { PublicVenueMapService } from "./public-venue-map.service.js";

@ApiTags("exhibition-public")
@Controller()
export class PublicVenueMapController {
  constructor(private readonly venueMap: PublicVenueMapService) {}

  @Public()
  @Get("venue-map/current")
  @ApiOperation({ summary: "Get the active published BOS venue-map snapshot" })
  @ApiOkResponse({ description: "Active public venue map" })
  @ApiNotFoundResponse({ description: "No published venue map is available" })
  current(): Promise<PublicVenueMapSnapshotResponse> {
    return this.venueMap.getCurrent();
  }
}
