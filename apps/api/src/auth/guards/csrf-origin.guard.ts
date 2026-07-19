import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { CSRF_SAFE_METHODS } from "../../common/constants/app.constants.js";
import type { AppEnv } from "../../config/env.validation.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";

/**
 * Layer-1 CSRF defense: mutating requests with an Origin header must match the
 * CORS allowlist (including public login/register, against login-CSRF).
 * A missing Origin is allowed for public routes and cookie-less requests
 * (non-browser clients); cookie-authenticated mutations still require it.
 */
@Injectable()
export class CsrfOriginGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (CSRF_SAFE_METHODS.has(method)) {
      return true;
    }

    const allowedOrigins = this.configService.get("CORS_ORIGINS", {
      infer: true,
    });
    const origin = request.headers.origin;

    if (origin && !allowedOrigins.includes(origin)) {
      throw new ForbiddenException("Invalid request origin");
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const cookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    const cookies = request.cookies as Record<string, string> | undefined;
    const hasSessionCookie = Boolean(cookies?.[cookieName]);

    if (!hasSessionCookie) {
      return true;
    }

    if (!origin) {
      throw new ForbiddenException("Invalid request origin");
    }

    return true;
  }
}
