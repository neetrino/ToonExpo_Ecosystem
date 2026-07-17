import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { builderQrScanDealInputSchema, checkInInputSchema } from '@toonexpo/contracts';
import type { Request } from 'express';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { type SessionService } from '../auth/session.service';
import { allowQrRequest } from './qr-rate-limit';
import { type QrService } from './qr.service';

@ApiTags('qr')
@ApiCookieAuth()
@Controller('qr')
@UseGuards(AppOriginGuard)
export class QrController {
  constructor(
    private readonly qr: QrService,
    private readonly sessions: SessionService,
  ) {}

  @Post('ensure')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  ensure(@Req() request: RequestWithAuth) {
    return this.qr.ensure(requireRole(request, 'BUYER'));
  }

  @Post('revoke')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  revoke(@Req() request: RequestWithAuth) {
    return this.qr.revoke(requireRole(request, 'BUYER'));
  }

  @Post('regenerate')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  regenerate(@Req() request: RequestWithAuth) {
    return this.qr.regenerate(requireRole(request, 'BUYER'));
  }

  @Get('resolve/:token')
  async resolve(
    @Param('token') token: string,
    @Query('companyId') companyId: string | undefined,
    @Req() request: Request,
  ) {
    await requireRateLimit(`resolve:${request.ip ?? 'unknown'}`);
    const sessionToken = request.cookies?.[SESSION_COOKIE_NAME];
    const session = await this.sessions.resolveSession(
      typeof sessionToken === 'string' ? sessionToken : undefined,
    );
    return this.qr.resolve(token, session, companyId);
  }

  @Post('check-in')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  async checkIn(@Body() body: unknown, @Req() request: RequestWithAuth) {
    const userId = requireRole(request, 'ENTRANCE_STAFF');
    await requireRateLimit(`check-in:${userId}`);
    const parsed = checkInInputSchema.safeParse(body);
    if (!parsed.success) {
      throwApiError('invalidInput', HttpStatus.BAD_REQUEST);
    }
    return this.qr.checkIn(userId, parsed.data);
  }

  @Post('builder/deals')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  async createDeal(@Body() body: unknown, @Req() request: RequestWithAuth) {
    const userId = requireRole(request, 'BUILDER');
    await requireRateLimit(`builder-deal:${userId}`);
    const companyId = readCompanyId(body);
    const parsed = builderQrScanDealInputSchema.safeParse(body);
    if (!companyId || !parsed.success) {
      throwApiError('invalidInput', HttpStatus.BAD_REQUEST);
    }
    return this.qr.createDeal(userId, companyId, parsed.data);
  }

  @Post(':qrCodeId/builder-scan')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  async logBuilderScan(
    @Param('qrCodeId') qrCodeId: string,
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ): Promise<void> {
    const userId = requireRole(request, 'BUILDER');
    const companyId = readCompanyId(body);
    if (!companyId) {
      throwApiError('invalidInput', HttpStatus.BAD_REQUEST);
    }
    await requireRateLimit(`builder-scan:${userId}`);
    await this.qr.logBuilderScan(userId, companyId, qrCodeId);
  }
}

function requireRole(
  request: RequestWithAuth,
  role: 'BUYER' | 'BUILDER' | 'ENTRANCE_STAFF',
): string {
  if (request.authSession?.user.role !== role) {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession.user.id;
}

function readCompanyId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('companyId' in body)) {
    return undefined;
  }
  return typeof body.companyId === 'string' && body.companyId.trim() ? body.companyId : undefined;
}

async function requireRateLimit(key: string): Promise<void> {
  if (!(await allowQrRequest(key))) {
    throwApiError('rateLimited', HttpStatus.TOO_MANY_REQUESTS);
  }
}

function throwApiError(error: string, status: HttpStatus): never {
  throw new HttpException({ error }, status);
}
