import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  CheckInSummaryResponse,
  EventListResponse,
  EventSummary,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { AdminEventsService } from "./admin-events.service.js";
import { CreateEventDto } from "./dto/create-event.dto.js";
import { UpdateEventDto } from "./dto/update-event.dto.js";

@ApiTags("admin-events")
@AccountTypes("platform_admin")
@Controller("admin/events")
export class AdminEventsController {
  constructor(private readonly events: AdminEventsService) {}

  @Get()
  @ApiOperation({ summary: "List exhibition events" })
  @ApiOkResponse({ description: "Event list" })
  list(): Promise<EventListResponse> {
    return this.events.list();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create exhibition event" })
  @ApiCreatedResponse({ description: "Created event" })
  create(@Body() body: CreateEventDto): Promise<EventSummary> {
    return this.events.create(body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get event by id" })
  @ApiOkResponse({ description: "Event detail" })
  getById(@Param("id") id: string): Promise<EventSummary> {
    return this.events.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update event status or publication" })
  @ApiOkResponse({ description: "Updated event" })
  update(
    @Param("id") id: string,
    @Body() body: UpdateEventDto,
  ): Promise<EventSummary> {
    return this.events.update(id, body);
  }

  @Get(":id/check-in-summary")
  @ApiOperation({ summary: "Check-in attendance summary for an event" })
  @ApiOkResponse({ description: "Check-in totals and per-day breakdown" })
  checkInSummary(@Param("id") id: string): Promise<CheckInSummaryResponse> {
    return this.events.getCheckInSummary(id);
  }
}
