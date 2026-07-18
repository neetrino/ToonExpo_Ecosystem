import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { CSRF_HEADER_NAME } from "@toonexpo/contracts";
import type { Request } from "express";
import { timingSafeEqual } from "node:crypto";

import { CSRF_SAFE_METHODS } from "../../common/constants/app.constants.js";
import type { AppEnv } from "../../config/env.validation.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { verifyCsrfToken } from "../utils/csrf-token.util.js";

const areEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

/**
 * Double-submit CSRF guard: mutating authenticated routes require X-CSRF-Token
 * matching the CSRF cookie and the HMAC of the session cookie.
 */
@Injectable()
export class CsrfTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (CSRF_SAFE_METHODS.has(method)) {
      return true;
    }

    const sessionCookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    const cookies = request.cookies as Record<string, string> | undefined;
    const sessionToken = cookies?.[sessionCookieName];

    if (!sessionToken) {
      return true;
    }

    const headerValue = request.headers[CSRF_HEADER_NAME.toLowerCase()];
    const provided =
      typeof headerValue === "string" ? headerValue.trim() : undefined;
    const csrfCookieName = this.configService.get("CSRF_COOKIE_NAME", {
      infer: true,
    });
    const csrfCookie = cookies?.[csrfCookieName];

    if (!provided || !csrfCookie) {
      throw new ForbiddenException("CSRF token missing");
    }

    if (!areEqual(provided, csrfCookie)) {
      throw new ForbiddenException("CSRF token mismatch");
    }

    const secret = this.configService.get("CSRF_SECRET", { infer: true });

    if (!verifyCsrfToken(provided, sessionToken, secret)) {
      throw new ForbiddenException("Invalid CSRF token");
    }

    return true;
  }
}
