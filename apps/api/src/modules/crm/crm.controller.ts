import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import {
  ACTIVE_COMPANY_COOKIE,
  BuilderContextService,
} from '../builder/builder-context.service';
import { CrmQueryService } from './crm-query.service';

@ApiTags('crm')
@ApiCookieAuth()
@Controller('crm')
@UseGuards(AppOriginGuard, SessionAuthGuard, CsrfGuard)
export class CrmController {
  constructor(
    private readonly contexts: BuilderContextService,
    private readonly queries: CrmQueryService,
  ) {}

  @Get('board')
  async board(@Req() request: RequestWithAuth) {
    return this.queries.board(await this.companyId(request));
  }

  @Get('deals/:dealId')
  async deal(@Req() request: RequestWithAuth, @Param('dealId') dealId: string) {
    const deal = await this.queries.deal(await this.companyId(request), dealId);
    if (!deal) {
      throw new HttpException({ error: 'notFound' }, HttpStatus.NOT_FOUND);
    }
    return deal;
  }

  @Get('members')
  async members(@Req() request: RequestWithAuth) {
    return this.queries.members(await this.companyId(request));
  }

  @Get('apartment-options')
  async apartments(
    @Req() request: RequestWithAuth,
    @Query('projectId') projectId?: string,
  ) {
    return this.queries.apartmentOptions(await this.companyId(request), projectId);
  }

  @Get('buyer/deals')
  buyerDeals(@Req() request: RequestWithAuth) {
    const session = requireSession(request);
    if (session.user.role !== 'BUYER') {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }
    return this.queries.buyerDeals(session.user.id);
  }

  private async companyId(request: RequestWithAuth): Promise<string> {
    const session = requireSession(request);
    const raw = request.cookies?.[ACTIVE_COMPANY_COOKIE];
    const context = await this.contexts.resolve(
      session,
      typeof raw === 'string' ? raw : undefined,
    );
    if (!context) {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }
    return context.companyId;
  }
}

function requireSession(request: RequestWithAuth) {
  if (!request.authSession) {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession;
}
