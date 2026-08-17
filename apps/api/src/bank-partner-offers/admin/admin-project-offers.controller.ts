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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  ApplyProjectBankPartnerOffersResponse,
  ProjectBankPartnerOfferItem,
  ProjectBankPartnerOfferListResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { ProjectBankPartnerOffersService } from "../project-offers.service.js";
import {
  ApplyProjectBankPartnerOffersDto,
  UpdateProjectBankPartnerOfferDto,
} from "./dto/project-offer.dto.js";

@ApiTags("admin-project-bank-partner-offers")
@AccountTypes("platform_admin")
@Controller("admin/projects/:projectId/bank-partner-offers")
export class AdminProjectBankPartnerOffersController {
  constructor(private readonly offers: ProjectBankPartnerOffersService) {}

  @Get()
  @ApiOperation({ summary: "List bank partner offers on a project" })
  @ApiOkResponse({ description: "Project offer list" })
  list(
    @Param("projectId") projectId: string,
  ): Promise<ProjectBankPartnerOfferListResponse> {
    return this.offers.listForProject(projectId);
  }

  @Post("apply")
  @ApiOperation({ summary: "Apply templates to a project (copy-on-apply)" })
  @ApiOkResponse({ description: "Applied offers" })
  apply(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() body: ApplyProjectBankPartnerOffersDto,
  ): Promise<ApplyProjectBankPartnerOffersResponse> {
    return this.offers.apply(projectId, user.id, body);
  }

  @Patch(":offerId")
  @ApiOperation({ summary: "Update a project bank partner offer" })
  @ApiOkResponse({ description: "Updated offer" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("offerId") offerId: string,
    @Body() body: UpdateProjectBankPartnerOfferDto,
  ): Promise<ProjectBankPartnerOfferItem> {
    return this.offers.update(projectId, offerId, user.id, body);
  }

  @Delete(":offerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a bank partner offer from a project" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(
    @Param("projectId") projectId: string,
    @Param("offerId") offerId: string,
  ): Promise<void> {
    await this.offers.remove(projectId, offerId);
  }
}
