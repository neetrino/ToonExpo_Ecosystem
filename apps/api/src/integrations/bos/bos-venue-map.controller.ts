import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { VenueMapPublishResponse } from "@toonexpo/contracts";

import { Public } from "../../auth/decorators/public.decorator.js";
import {
  BOS_PROVISIONING_RATE_LIMIT_LIMIT,
  BOS_PROVISIONING_RATE_LIMIT_TTL_MS,
} from "../../common/constants/app.constants.js";
import { BosApiKeyGuard } from "../guards/bos-api-key.guard.js";
import { BosVenueMapPublishRequestDto } from "./dto/bos-venue-map-publish.dto.js";
import { BosVenueMapPublishService } from "./bos-venue-map-publish.service.js";

@ApiTags("integrations-bos")
@Controller("integrations/bos")
export class BosVenueMapController {
  constructor(private readonly publishService: BosVenueMapPublishService) {}

  @Post("venue-map/publish")
  @Public()
  @UseGuards(BosApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: BOS_PROVISIONING_RATE_LIMIT_LIMIT,
      ttl: BOS_PROVISIONING_RATE_LIMIT_TTL_MS,
    },
  })
  @ApiOperation({ summary: "BOS inbound venue-map snapshot publication (API key)" })
  @ApiOkResponse({ description: "Publication result (snake_case wire format)" })
  publish(
    @Body() body: BosVenueMapPublishRequestDto,
  ): Promise<VenueMapPublishResponse> {
    return this.publishService.publish(body);
  }
}
