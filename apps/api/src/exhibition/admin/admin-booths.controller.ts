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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  BoothAssignmentListResponse,
  BoothAssignmentSummary,
  BoothListResponse,
  BoothSummary,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { AdminBoothsService } from "./admin-booths.service.js";
import { CreateBoothAssignmentDto } from "./dto/create-booth-assignment.dto.js";
import { CreateBoothDto } from "./dto/create-booth.dto.js";
import { UpdateBoothAssignmentDto } from "./dto/update-booth-assignment.dto.js";
import { UpdateBoothDto } from "./dto/update-booth.dto.js";

@ApiTags("admin-booths")
@AccountTypes("platform_admin")
@Controller()
export class AdminBoothsController {
  constructor(private readonly booths: AdminBoothsService) {}

  @Get("admin/venue-maps/:mapId/booths")
  @ApiOperation({ summary: "List booths on a venue map" })
  @ApiOkResponse({ description: "Booth list" })
  listByMap(@Param("mapId") mapId: string): Promise<BoothListResponse> {
    return this.booths.listByVenueMap(mapId);
  }

  @Post("admin/venue-maps/:mapId/booths")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create booth on a venue map" })
  @ApiCreatedResponse({ description: "Created booth" })
  create(
    @Param("mapId") mapId: string,
    @Body() body: CreateBoothDto,
  ): Promise<BoothSummary> {
    return this.booths.create(mapId, body);
  }

  @Patch("admin/booths/:id")
  @ApiOperation({ summary: "Update booth" })
  @ApiOkResponse({ description: "Updated booth" })
  update(
    @Param("id") id: string,
    @Body() body: UpdateBoothDto,
  ): Promise<BoothSummary> {
    return this.booths.update(id, body);
  }

  @Delete("admin/booths/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete booth" })
  @ApiNoContentResponse({ description: "Deleted booth" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.booths.remove(id);
  }

  @Get("admin/booths/:boothId/assignments")
  @ApiOperation({ summary: "List booth assignments with resolved names" })
  @ApiOkResponse({ description: "Assignment list" })
  listAssignments(
    @Param("boothId") boothId: string,
  ): Promise<BoothAssignmentListResponse> {
    return this.booths.listAssignments(boothId);
  }

  @Post("admin/booths/:boothId/assignments")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Assign company/project to booth" })
  @ApiCreatedResponse({ description: "Created assignment" })
  createAssignment(
    @Param("boothId") boothId: string,
    @Body() body: CreateBoothAssignmentDto,
  ): Promise<BoothAssignmentSummary> {
    return this.booths.createAssignment(boothId, body);
  }

  @Patch("admin/booths/:boothId/assignments/:assignmentId")
  @ApiOperation({ summary: "Update booth assignment" })
  @ApiOkResponse({ description: "Updated assignment" })
  updateAssignment(
    @Param("boothId") boothId: string,
    @Param("assignmentId") assignmentId: string,
    @Body() body: UpdateBoothAssignmentDto,
  ): Promise<BoothAssignmentSummary> {
    return this.booths.updateAssignment(boothId, assignmentId, body);
  }

  @Delete("admin/booths/:boothId/assignments/:assignmentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove booth assignment" })
  @ApiNoContentResponse({ description: "Deleted assignment" })
  async removeAssignment(
    @Param("boothId") boothId: string,
    @Param("assignmentId") assignmentId: string,
  ): Promise<void> {
    await this.booths.removeAssignment(boothId, assignmentId);
  }
}
