import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { BosProvisioningResponse } from "@toonexpo/contracts";

import { Public } from "../../auth/decorators/public.decorator.js";
import {
  BOS_PROVISIONING_RATE_LIMIT_LIMIT,
  BOS_PROVISIONING_RATE_LIMIT_TTL_MS,
} from "../../common/constants/app.constants.js";
import { BosApiKeyGuard } from "../guards/bos-api-key.guard.js";
import { BosProvisioningService } from "./bos-provisioning.service.js";
import { BosProvisioningRequestDto } from "./dto/bos-provisioning.dto.js";

@ApiTags("integrations-bos")
@Controller("integrations/bos")
export class BosProvisioningController {
  constructor(private readonly provisioningService: BosProvisioningService) {}

  @Post("provisioning")
  @Public()
  @UseGuards(BosApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: BOS_PROVISIONING_RATE_LIMIT_LIMIT,
      ttl: BOS_PROVISIONING_RATE_LIMIT_TTL_MS,
    },
  })
  @ApiOperation({ summary: "BOS inbound account provisioning (API key)" })
  @ApiOkResponse({ description: "Provisioning result (snake_case wire format)" })
  provision(@Body() body: BosProvisioningRequestDto): Promise<BosProvisioningResponse> {
    return this.provisioningService.provision({
      request_id: body.request_id,
      bos_company_id: body.bos_company_id,
      company_name: body.company_name,
      company_type: body.company_type,
      primary_contact_name: body.primary_contact_name,
      primary_contact_email: body.primary_contact_email,
      ...(body.primary_contact_phone !== undefined
        ? { primary_contact_phone: body.primary_contact_phone }
        : {}),
      ...(body.event_cycle_id !== undefined
        ? { event_cycle_id: body.event_cycle_id }
        : {}),
      ...(body.event_cycle_name !== undefined
        ? { event_cycle_name: body.event_cycle_name }
        : {}),
      requested_modules: body.requested_modules,
    });
  }
}
