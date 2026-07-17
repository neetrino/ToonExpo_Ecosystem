import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { publicRequestInputSchema } from '@toonexpo/contracts';
import type { Request } from 'express';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionService } from '../auth/session.service';
import { allowPublicRequest } from './public-request-rate-limit';
import { PublicRequestService } from './public-request.service';

@Controller('crm/public-requests')
@UseGuards(AppOriginGuard, CsrfGuard)
export class PublicRequestController {
  constructor(
    private readonly requests: PublicRequestService,
    private readonly sessions: SessionService,
  ) {}

  @Post()
  async submit(@Req() request: Request, @Body() body: unknown) {
    const parsed = publicRequestInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpException({ error: 'invalidInput' }, HttpStatus.BAD_REQUEST);
    }
    if (!(await allowPublicRequest(request.ip ?? 'unknown'))) {
      throw new HttpException({ error: 'rateLimited' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    const token = request.cookies?.[SESSION_COOKIE_NAME];
    const session = await this.sessions.resolveSession(typeof token === 'string' ? token : undefined);
    const buyerUserId = session?.user.role === 'BUYER' ? session.user.id : undefined;
    return this.requests.submit(parsed.data, buyerUserId);
  }
}
