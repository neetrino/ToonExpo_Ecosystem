import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { HealthResponse } from "@toonexpo/contracts";

import { HealthService } from "./health.service.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "API and database health check" })
  @ApiOkResponse({ description: "Service health status" })
  getHealth(): Promise<HealthResponse> {
    return this.healthService.getHealth();
  }
}
