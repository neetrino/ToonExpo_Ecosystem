import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  activityStatusUpdateInputSchema,
  dealActivityInputSchema,
  dealApartmentLinkInputSchema,
  dealAssignInputSchema,
  dealStageUpdateInputSchema,
  manualDealInputSchema,
} from '@toonexpo/contracts';
import { type z } from 'zod';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import {
  ACTIVE_COMPANY_COOKIE,
  BuilderContextService,
} from '../builder/builder-context.service';
import { CrmQueryService } from './crm-query.service';
import { CrmMutationService } from './crm-mutation.service';

@ApiTags('crm')
@ApiCookieAuth()
@Controller('crm')
@UseGuards(AppOriginGuard, SessionAuthGuard, CsrfGuard)
export class CrmController {
  constructor(
    private readonly contexts: BuilderContextService,
    private readonly queries: CrmQueryService,
    private readonly mutations: CrmMutationService,
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

  @Patch('deals/stage')
  async updateStage(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(dealStageUpdateInputSchema, body);
    const context = await this.context(request);
    return this.mutations.stage(context.companyId, input, context.session.user.id);
  }

  @Post('deals/apartments')
  async linkApartment(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(dealApartmentLinkInputSchema, body);
    return this.mutations.link(await this.companyId(request), input);
  }

  @Post('deals/apartments/unlink')
  async unlinkApartment(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(dealApartmentLinkInputSchema, body);
    const context = await this.context(request);
    return this.mutations.unlink(context.companyId, input, context.session.user.id);
  }

  @Post('deals/activities')
  async addActivity(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(dealActivityInputSchema, body);
    const context = await this.context(request);
    return this.mutations.activity(context.companyId, input, context.session.user.id);
  }

  @Patch('activities/status')
  async activityStatus(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(activityStatusUpdateInputSchema, body);
    return this.mutations.activityStatus(await this.companyId(request), input);
  }

  @Patch('deals/assignee')
  async assign(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(dealAssignInputSchema, body);
    const context = await this.context(request);
    return this.mutations.assign(context.companyId, input, context.session.user.id);
  }

  @Post('deals/manual')
  async manual(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const context = await this.context(request);
    const input = parse(manualDealInputSchema, {
      ...(typeof body === 'object' && body ? body : {}),
      companyId: context.companyId,
    });
    return this.mutations.manual(context.companyId, input, context.session.user.id);
  }

  private async companyId(request: RequestWithAuth): Promise<string> {
    return (await this.context(request)).companyId;
  }

  private async context(request: RequestWithAuth) {
    const session = requireSession(request);
    const raw = request.cookies?.[ACTIVE_COMPANY_COOKIE];
    const context = await this.contexts.resolve(
      session,
      typeof raw === 'string' ? raw : undefined,
    );
    if (!context) {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }
    return context;
  }
}

function parse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  body: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HttpException({ error: 'invalidInput' }, HttpStatus.BAD_REQUEST);
  }
  return parsed.data;
}

function requireSession(request: RequestWithAuth) {
  if (!request.authSession) {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession;
}
