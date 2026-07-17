import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  mediaPresignRequestSchema,
  type MediaPresignResponse,
} from '@toonexpo/contracts';
import type { Response } from 'express';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { ACTIVE_COMPANY_COOKIE, UploadAuthService } from './upload-auth.service';
import { allowMediaPresignRequest } from './uploads-rate-limit';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiCookieAuth()
@Controller('uploads')
@UseGuards(AppOriginGuard, SessionAuthGuard, CsrfGuard)
export class UploadsController {
  constructor(
    @Inject(UploadsService) private readonly uploads: UploadsService,
    @Inject(UploadAuthService) private readonly uploadAuth: UploadAuthService,
  ) {}

  @Post('presign')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mint a short-lived R2 PUT URL for an authenticated upload' })
  @ApiResponse({ status: 200, description: 'Presigned upload details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Rate limited' })
  @ApiResponse({ status: 503, description: 'Storage not configured' })
  async presign(
    @Body() body: unknown,
    @Req() req: RequestWithAuth,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MediaPresignResponse> {
    res.setHeader('Cache-Control', 'no-store');

    const parsed = mediaPresignRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpException({ error: 'invalidInput' }, HttpStatus.BAD_REQUEST);
    }

    const session = req.authSession;
    if (!session) {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }

    const activeCompanyRaw = req.cookies?.[ACTIVE_COMPANY_COOKIE];
    const activeCompanyId =
      typeof activeCompanyRaw === 'string' && activeCompanyRaw.trim().length > 0
        ? activeCompanyRaw.trim()
        : undefined;

    const auth = await this.uploadAuth.resolve(parsed.data.purpose, session, activeCompanyId);
    if (!auth.ok) {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }

    const allowed = await allowMediaPresignRequest(auth.userId);
    if (!allowed) {
      throw new HttpException({ error: 'rateLimited' }, HttpStatus.TOO_MANY_REQUESTS);
    }

    const result = await this.uploads.createPresign(parsed.data.purpose, auth.scope, parsed.data);
    if (!result.ok) {
      throw new HttpException({ error: result.error }, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result.data;
  }
}
