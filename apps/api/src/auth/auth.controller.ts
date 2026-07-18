import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type {
  AuthSessionResponse,
  CsrfTokenResponse,
  UserResponse,
} from "@toonexpo/contracts";
import type { Request, Response } from "express";

import {
  AUTH_RATE_LIMIT_LIMIT,
  AUTH_RATE_LIMIT_TTL_MS,
} from "../common/constants/app.constants.js";
import { AuthService } from "./auth.service.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";
import { Public } from "./decorators/public.decorator.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import type { AuthenticatedUser } from "./types/authenticated-user.js";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: AUTH_RATE_LIMIT_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @ApiOperation({ summary: "Register a buyer account and start a session" })
  @ApiCreatedResponse({ description: "Buyer registered; session cookie set" })
  register(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    return this.authService.register(body, this.clientMeta(request), response);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AUTH_RATE_LIMIT_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @ApiOperation({ summary: "Log in with email and password" })
  @ApiOkResponse({ description: "Authenticated; session cookie set" })
  login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    return this.authService.login(body, this.clientMeta(request), response);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Revoke the current session and clear the cookie" })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(user, response);
  }

  @Get("me")
  @ApiOperation({ summary: "Return the authenticated user" })
  @ApiOkResponse({ description: "Current user without sensitive fields" })
  me(@CurrentUser() user: AuthenticatedUser): UserResponse {
    return this.authService.getMe(user);
  }

  @Get("csrf")
  @ApiOperation({ summary: "Return the CSRF token for the current session" })
  @ApiOkResponse({ description: "Session-bound CSRF token" })
  csrf(@Req() request: Request): CsrfTokenResponse {
    return this.authService.getCsrfToken(request);
  }

  private clientMeta(request: Request): {
    ipAddress?: string;
    userAgent?: string;
  } {
    const forwarded = request.headers["x-forwarded-for"];
    const forwardedIp =
      typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : undefined;
    const ipAddress = forwardedIp || request.ip;
    const userAgent = request.headers["user-agent"];
    const meta: { ipAddress?: string; userAgent?: string } = {};

    if (ipAddress) {
      meta.ipAddress = ipAddress;
    }

    if (userAgent) {
      meta.userAgent = userAgent;
    }

    return meta;
  }
}
