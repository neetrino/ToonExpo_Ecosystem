import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  ActiveEventResponse,
  CheckInScanResponse,
  RecentCheckInResponse,
} from "@toonexpo/contracts";
import type { Request } from "express";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { CheckInService } from "./checkin.service.js";
import { CheckInScanDto } from "./dto/checkin-scan.dto.js";
import { RecentCheckInsQueryDto } from "./dto/recent-checkins.query.dto.js";

@ApiTags("checkin")
@AccountTypes("entrance_staff", "platform_admin")
@Controller("checkin")
export class CheckInController {
  constructor(private readonly checkIn: CheckInService) {}

  @Get("active-event")
  @ApiOperation({ summary: "Get the current active exhibition event" })
  @ApiOkResponse({ description: "Active event" })
  @ApiNotFoundResponse({ description: "No active event" })
  activeEvent(): Promise<ActiveEventResponse> {
    return this.checkIn.getActiveEvent();
  }

  @Post("scan")
  @ApiOperation({ summary: "Scan buyer QR for event check-in" })
  @ApiOkResponse({ description: "Check-in result" })
  scan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CheckInScanDto,
    @Req() req: Request,
  ): Promise<CheckInScanResponse> {
    return this.checkIn.scan(user, body.token, body.eventId, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
  }

  @Get("recent")
  @ApiOperation({ summary: "Recent check-ins by the current staff user" })
  @ApiOkResponse({ description: "Recent check-ins" })
  recent(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RecentCheckInsQueryDto,
  ): Promise<RecentCheckInResponse> {
    return this.checkIn.listRecent(user.id, query.eventId);
  }
}
