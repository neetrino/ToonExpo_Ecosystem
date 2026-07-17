import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AuthSession } from '@toonexpo/contracts';
import type { Request, Response } from 'express';

import { loadApiEnv } from '../../common/env';
import { AccountInviteService, type SetPasswordResult } from './account-invite.service';
import { AppOriginGuard } from './app-origin.guard';
import { allowAuthRequest } from './auth-rate-limit';
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME } from './auth.constants';
import { AuthService, type AuthMutationFailure } from './auth.service';
import { buildCsrfCookieOptions, buildSessionCookieOptions } from './cookie-options';
import { CsrfGuard } from './csrf.guard';
import { issueOrReuseCsrfToken } from './csrf-token';

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]!.trim();
  }
  return req.ip ?? 'unknown';
}

function readSessionToken(req: Request): string | undefined {
  const value = req.cookies?.[SESSION_COOKIE_NAME];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(AppOriginGuard)
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(AccountInviteService) private readonly invites: AccountInviteService,
  ) {}

  @Get('csrf')
  @ApiOperation({
    summary: 'Return CSRF cookie token for mutating calls (reuse existing when valid)',
  })
  @ApiResponse({ status: 200, description: 'CSRF token (set as cookie when newly issued)' })
  getCsrf(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { csrfToken: string } {
    const existing = req.cookies?.[CSRF_COOKIE_NAME];
    const { csrfToken, setCookie } = issueOrReuseCsrfToken(existing);
    if (setCookie) {
      const env = loadApiEnv();
      res.cookie(CSRF_COOKIE_NAME, csrfToken, buildCsrfCookieOptions(env));
    }
    return { csrfToken };
  }

  @Get('invite/:token')
  @ApiOperation({ summary: 'Check whether an account invite is valid and unexpired' })
  @ApiResponse({ status: 200, description: 'Invite is valid' })
  @ApiResponse({ status: 404, description: 'Invite is missing, expired, or already consumed' })
  async previewInvite(@Param('token') token: string): Promise<{ valid: true }> {
    const result = await this.invites.preview(token);
    if (!result.ok) {
      throw new NotFoundException({
        code: result.code,
        message: 'Invite is invalid or expired',
      });
    }
    return { valid: true };
  }

  @Post('set-password')
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Consume an account invite and set the account password' })
  async setPassword(@Body() body: unknown, @Req() req: Request): Promise<void> {
    await this.assertNotRateLimited('setPassword', req);
    const result = await this.invites.setPassword(body);
    if (!result.ok) {
      this.throwSetPasswordFailure(result);
    }
  }

  @Post('register')
  @HttpCode(201)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Register a BUYER account and create a database session' })
  async register(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    await this.assertNotRateLimited('register', req);
    const result = await this.auth.register(body);
    return this.finishAuthMutation(result, res);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Sign in with email/password and create a database session' })
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    await this.assertNotRateLimited('login', req);
    const result = await this.auth.login(body);
    return this.finishAuthMutation(result, res);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Invalidate the current database session' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(readSessionToken(req));
    this.clearSessionCookie(res);
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the current session user' })
  @ApiResponse({ status: 200, description: 'Authenticated session' })
  @ApiResponse({ status: 401, description: 'No valid session' })
  async me(@Req() req: Request): Promise<AuthSession> {
    const session = await this.auth.me(readSessionToken(req));
    if (!session) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
    return session;
  }

  private async assertNotRateLimited(
    surface: 'login' | 'register' | 'setPassword',
    req: Request,
  ): Promise<void> {
    const allowed = await allowAuthRequest(surface, `ip:${clientIp(req)}`);
    if (!allowed) {
      throw new HttpException(
        { code: 'RATE_LIMITED', message: 'Too many requests' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private throwSetPasswordFailure(result: Exclude<SetPasswordResult, { ok: true }>): never {
    if (result.code === 'VALIDATION_ERROR') {
      throw new BadRequestException({ code: result.code, message: 'Invalid input' });
    }
    throw new NotFoundException({
      code: result.code,
      message: 'Invite is invalid or expired',
    });
  }

  private finishAuthMutation(
    result: Awaited<ReturnType<AuthService['login']>>,
    res: Response,
  ): AuthSession {
    if (!result.ok) {
      this.throwAuthFailure(result);
    }

    const env = loadApiEnv();
    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, buildSessionCookieOptions(env));
    return result.session;
  }

  private clearSessionCookie(res: Response): void {
    const env = loadApiEnv();
    res.clearCookie(SESSION_COOKIE_NAME, buildSessionCookieOptions(env));
  }

  private throwAuthFailure(result: AuthMutationFailure): never {
    if (result.code === 'EMAIL_TAKEN') {
      throw new ConflictException({ code: result.code, message: 'Email already registered' });
    }
    if (result.code === 'VALIDATION_ERROR') {
      throw new BadRequestException({ code: result.code, message: 'Invalid input' });
    }
    throw new UnauthorizedException({
      code: result.code,
      message: 'Invalid email or password',
    });
  }
}
