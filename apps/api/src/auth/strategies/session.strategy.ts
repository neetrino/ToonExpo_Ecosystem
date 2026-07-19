import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { Strategy } from "passport-custom";

import type { AppEnv } from "../../config/env.validation.js";
import { AuthService } from "../auth.service.js";
import type { AuthenticatedUser } from "../types/authenticated-user.js";

type RequestWithCookies = Request & {
  cookies?: Record<string, string>;
};

/**
 * Passport custom strategy that authenticates via the opaque session cookie.
 */
@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, "session") {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {
    super();
  }

  async validate(request: RequestWithCookies): Promise<AuthenticatedUser> {
    const cookieName = this.configService.get("SESSION_COOKIE_NAME", {
      infer: true,
    });
    const rawToken = request.cookies?.[cookieName];

    if (!rawToken) {
      throw new UnauthorizedException("Authentication required");
    }

    const user = await this.authService.validateSessionToken(rawToken);

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    return user;
  }
}
