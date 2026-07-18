import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { QrResolveResponse } from "@toonexpo/contracts";
import type { Request } from "express";

import { OptionalAuth } from "../auth/decorators/optional-auth.decorator.js";
import { OptionalUser } from "../auth/decorators/optional-user.decorator.js";
import { Public } from "../auth/decorators/public.decorator.js";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import {
  QR_RESOLVE_RATE_LIMIT_LIMIT,
  QR_RESOLVE_RATE_LIMIT_TTL_MS,
} from "../common/constants/app.constants.js";
import { ResolveQrDto } from "./dto/resolve-qr.dto.js";
import { QrResolveService } from "./qr-resolve.service.js";

@ApiTags("qr")
@Controller("qr")
export class QrResolveController {
  constructor(private readonly resolveService: QrResolveService) {}

  @Post("resolve")
  @Public()
  @OptionalAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: QR_RESOLVE_RATE_LIMIT_LIMIT,
      ttl: QR_RESOLVE_RATE_LIMIT_TTL_MS,
    },
  })
  @ApiOperation({
    summary: "Resolve a buyer QR token with role-based privacy rules",
  })
  @ApiOkResponse({ description: "Role-specific resolve payload" })
  resolve(
    @Body() body: ResolveQrDto,
    @OptionalUser() scanner: AuthenticatedUser | null,
    @Req() request: Request,
  ): Promise<QrResolveResponse> {
    const forwarded = request.headers["x-forwarded-for"];
    const ipAddress =
      typeof forwarded === "string"
        ? forwarded.split(",")[0]?.trim()
        : request.ip;
    const userAgentHeader = request.headers["user-agent"];
    const userAgent =
      typeof userAgentHeader === "string" ? userAgentHeader : undefined;

    return this.resolveService.resolve(body.token, scanner, {
      ipAddress,
      userAgent,
    });
  }
}
