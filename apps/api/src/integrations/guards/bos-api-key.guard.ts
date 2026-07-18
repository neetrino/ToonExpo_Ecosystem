import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { timingSafeEqual } from "node:crypto";

import { BOS_API_KEY_HEADER } from "../../common/constants/app.constants.js";
import type { AppEnv } from "../../config/env.validation.js";

const compareApiKeys = (provided: string, expected: string): boolean => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};

/**
 * Validates inbound BOS service-to-service requests via X-BOS-API-KEY.
 */
@Injectable()
export class BosApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AppEnv, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredKey = this.configService.get("BOS_API_KEY", { infer: true });

    if (!configuredKey) {
      throw new ServiceUnavailableException("BOS integration is disabled");
    }

    const request = context.switchToHttp().getRequest<Request>();
    const headerValue = request.headers[BOS_API_KEY_HEADER];
    const provided =
      typeof headerValue === "string" ? headerValue.trim() : undefined;

    if (!provided || !compareApiKeys(provided, configuredKey)) {
      throw new UnauthorizedException("Invalid BOS API key");
    }

    return true;
  }
}
