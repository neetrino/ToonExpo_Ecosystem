import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  AdminBosProvisioningDetail,
  AdminBosProvisioningListResponse,
} from "@toonexpo/contracts";
import type { BosProvisioningStatus } from "@toonexpo/db";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { AdminBosProvisioningService } from "./admin-bos-provisioning.service.js";
import { BosProvisioningIdParamDto } from "./dto/bos-provisioning-id.param.dto.js";
import { ListBosProvisioningQueryDto } from "./dto/list-bos-provisioning.query.dto.js";

@ApiTags("admin-integrations-bos")
@AccountTypes("platform_admin")
@Controller("admin/integrations/bos/provisioning")
export class AdminBosProvisioningController {
  constructor(
    private readonly adminService: AdminBosProvisioningService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List BOS provisioning requests (paginated)" })
  @ApiOkResponse({ description: "Paginated provisioning requests" })
  list(
    @Query() query: ListBosProvisioningQueryDto,
  ): Promise<AdminBosProvisioningListResponse> {
    return this.adminService.list(
      query.page,
      query.pageSize,
      query.status as BosProvisioningStatus | undefined,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get BOS provisioning request with audit log" })
  @ApiOkResponse({ description: "Provisioning request detail" })
  getById(
    @Param() params: BosProvisioningIdParamDto,
  ): Promise<AdminBosProvisioningDetail> {
    return this.adminService.getById(params.id);
  }
}
