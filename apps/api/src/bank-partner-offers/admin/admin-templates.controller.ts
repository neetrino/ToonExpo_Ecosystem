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
  Query,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  BankPartnerOfferTemplateItem,
  BankPartnerOfferTemplateListResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { AdminBankPartnerOfferTemplatesService } from "./admin-templates.service.js";
import {
  CreateBankPartnerOfferTemplateDto,
  ListBankPartnerOfferTemplatesQueryDto,
  UpdateBankPartnerOfferTemplateDto,
} from "./dto/admin-template.dto.js";

@ApiTags("admin-bank-partner-offer-templates")
@AccountTypes("platform_admin")
@Controller("admin/bank-partner-offer-templates")
export class AdminBankPartnerOfferTemplatesController {
  constructor(
    private readonly templates: AdminBankPartnerOfferTemplatesService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List bank partner offer templates" })
  @ApiOkResponse({ description: "Template list" })
  list(
    @Query() query: ListBankPartnerOfferTemplatesQueryDto,
  ): Promise<BankPartnerOfferTemplateListResponse> {
    return this.templates.list(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create bank partner offer template" })
  @ApiCreatedResponse({ description: "Created template" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateBankPartnerOfferTemplateDto,
  ): Promise<BankPartnerOfferTemplateItem> {
    return this.templates.create(user.id, body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get bank partner offer template" })
  @ApiOkResponse({ description: "Template detail" })
  getById(@Param("id") id: string): Promise<BankPartnerOfferTemplateItem> {
    return this.templates.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update bank partner offer template" })
  @ApiOkResponse({ description: "Updated template" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateBankPartnerOfferTemplateDto,
  ): Promise<BankPartnerOfferTemplateItem> {
    return this.templates.update(id, user.id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete bank partner offer template" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.templates.remove(id);
  }
}
