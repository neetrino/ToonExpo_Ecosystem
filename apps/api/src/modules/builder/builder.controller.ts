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
  type BuilderContext,
  BuilderContextService,
} from './builder-context.service';
import { BuilderQueryService } from './builder-query.service';

@ApiTags('builder')
@ApiCookieAuth()
@Controller('builder')
@UseGuards(AppOriginGuard, SessionAuthGuard, CsrfGuard)
export class BuilderController {
  constructor(
    private readonly contexts: BuilderContextService,
    private readonly queries: BuilderQueryService,
  ) {}

  @Get('context')
  async context(@Req() request: RequestWithAuth): Promise<BuilderContext> {
    return this.requireContext(request);
  }

  @Get('company/profile')
  async profile(@Req() request: RequestWithAuth) {
    const context = await this.requireContext(request);
    return this.queries.profile(context.companyId);
  }

  @Get('company/members')
  async members(@Req() request: RequestWithAuth) {
    const context = await this.requireContext(request);
    return this.queries.members(context.companyId);
  }

  @Get('company/options')
  companyOptions(@Req() request: RequestWithAuth) {
    const session = requireSession(request);
    const admin = session.user.role === 'BIGPROJECTS_ADMIN';
    if (!admin && session.user.role !== 'BUILDER') {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }
    return this.queries.companyOptions(session.user.id, admin);
  }

  @Get('projects/counts')
  async projectCounts(@Req() request: RequestWithAuth) {
    const context = await this.requireContext(request);
    return this.queries.projectCounts(context.companyId);
  }

  @Get('projects')
  async projects(@Req() request: RequestWithAuth) {
    const context = await this.requireContext(request);
    return this.queries.projects(context.companyId);
  }

  @Get('projects/:projectId')
  async project(@Req() request: RequestWithAuth, @Param('projectId') projectId: string) {
    const context = await this.requireContext(request);
    const project = await this.queries.project(context.companyId, projectId);
    if (!project) {
      throw new HttpException({ error: 'notFound' }, HttpStatus.NOT_FOUND);
    }
    return project;
  }

  @Get('readiness')
  async readiness(@Req() request: RequestWithAuth) {
    const context = await this.requireContext(request);
    return this.queries.readiness(context.companyId);
  }

  @Get('readiness/providers')
  async providers(@Req() request: RequestWithAuth) {
    await this.requireContext(request);
    return this.queries.providers();
  }

  @Get('analytics')
  async analytics(@Req() request: RequestWithAuth) {
    const context = await this.requireContext(request);
    return this.queries.analytics(context.companyId);
  }

  @Get('catalog-paths')
  async catalogPaths(
    @Req() request: RequestWithAuth,
    @Query('projectId') projectId?: string,
  ) {
    const context = await this.requireContext(request);
    if (!projectId) {
      return this.queries.projects(context.companyId);
    }
    return this.queries.project(context.companyId, projectId);
  }

  private async requireContext(request: RequestWithAuth): Promise<BuilderContext> {
    const session = requireSession(request);
    const raw = request.cookies?.[ACTIVE_COMPANY_COOKIE];
    const activeCompanyId = typeof raw === 'string' ? raw : undefined;
    const context = await this.contexts.resolve(session, activeCompanyId);
    if (!context) {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }
    return context;
  }
}

function requireSession(request: RequestWithAuth) {
  if (!request.authSession) {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession;
}
