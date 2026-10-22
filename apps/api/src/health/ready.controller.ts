import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

import { Public } from "../auth/decorators/public.decorator.js";

/**
 * Process liveness for the deploy proxy.
 * Does not touch the database or Redis. A failed dependency must not take the site off the router.
 * Coolify curls this path on port 8080.
 */
@ApiTags("health")
@SkipThrottle()
@Public()
@Controller("ready")
export class ReadyController {
  @Get()
  @ApiOperation({ summary: "Process is up. No database or Redis." })
  @ApiOkResponse({ description: "Process is ready to receive traffic" })
  getReady(): { status: "ok" } {
    return { status: "ok" };
  }
}
