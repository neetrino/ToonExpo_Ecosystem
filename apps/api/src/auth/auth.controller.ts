import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type {
  AuthSessionResponse,
  ChangePasswordResponse,
  CsrfTokenResponse,
  ForgotPasswordResponse,
  UserResponse,
} from '@toonexpo/contracts';
import type { Request, Response } from 'express';

import {
  AUTH_RATE_LIMIT_LIMIT,
  AUTH_RATE_LIMIT_TTL_MS,
  FORGOT_PASSWORD_RATE_LIMIT_LIMIT,
  FORGOT_PASSWORD_RATE_LIMIT_TTL_MS,
} from '../common/constants/app.constants.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { OptionalAuth } from './decorators/optional-auth.decorator.js';
import { OptionalUser } from './decorators/optional-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SetPasswordDto } from './dto/set-password.dto.js';
import type { AuthenticatedUser } from './types/authenticated-user.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: AUTH_RATE_LIMIT_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @ApiOperation({ summary: 'Register a buyer account and start a session' })
  @ApiCreatedResponse({ description: 'Buyer registered; session cookie set' })
  register(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    return this.authService.register(body, this.clientMeta(request), response);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AUTH_RATE_LIMIT_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiOkResponse({ description: 'Authenticated; session cookie set' })
  login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    return this.authService.login(body, this.clientMeta(request), response);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: FORGOT_PASSWORD_RATE_LIMIT_LIMIT,
      ttl: FORGOT_PASSWORD_RATE_LIMIT_TTL_MS,
    },
  })
  @ApiOperation({ summary: 'Request a password-reset email (always opaque 200)' })
  @ApiOkResponse({ description: 'Generic acknowledgement; does not reveal email existence' })
  forgotPassword(@Body() body: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AUTH_RATE_LIMIT_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @ApiOperation({
    summary: 'Set password from an invite or reset token and start a session',
  })
  @ApiOkResponse({ description: 'Password set; session cookie set' })
  setPassword(
    @Body() body: SetPasswordDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    return this.authService.setPassword(body, this.clientMeta(request), response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session and clear the cookie' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(user, response);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AUTH_RATE_LIMIT_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @ApiOperation({ summary: 'Change password for the authenticated user' })
  @ApiOkResponse({ description: 'Password updated; other sessions revoked' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    return this.authService.changePassword(user, body);
  }

  @OptionalAuth()
  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated user, or 204 when anonymous' })
  @ApiOkResponse({ description: 'Current user without sensitive fields' })
  @ApiNoContentResponse({ description: 'No active session' })
  async me(
    @OptionalUser() user: AuthenticatedUser | null,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponse | undefined> {
    if (!user) {
      // 204 avoids browser console noise from guest session probes (was 401).
      response.status(HttpStatus.NO_CONTENT);
      return undefined;
    }

    return this.authService.getMe(user);
  }

  @Get('csrf')
  @ApiOperation({ summary: 'Return the CSRF token for the current session' })
  @ApiOkResponse({ description: 'Session-bound CSRF token' })
  csrf(@Req() request: Request): CsrfTokenResponse {
    return this.authService.getCsrfToken(request);
  }

  private clientMeta(request: Request): {
    ipAddress?: string;
    userAgent?: string;
  } {
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];
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
