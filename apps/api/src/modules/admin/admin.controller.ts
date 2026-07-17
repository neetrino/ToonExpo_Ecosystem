import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  AUDIT_ENTITY_TYPES,
  PARTNER_TYPES,
  PUBLICATION_STATUSES,
  READINESS_TARGET_TYPES,
  type PlatformRole,
} from '@toonexpo/domain';
import type { Response } from 'express';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { AdminMutationService } from './admin-mutation.service';
import { AdminQueryService } from './admin-query.service';
import {
  ADMIN_REPORT_NAMES,
  AdminReportService,
  type AdminReportName,
} from './admin-report.service';
import { AdminRoleGuard } from './admin-role.guard';

@ApiTags('admin')
@ApiCookieAuth()
@Controller('admin')
@UseGuards(AppOriginGuard, SessionAuthGuard, AdminRoleGuard, CsrfGuard)
export class AdminController {
  constructor(
    @Inject(AdminQueryService) private readonly queries: AdminQueryService,
    @Inject(AdminMutationService) private readonly mutations: AdminMutationService,
    @Inject(AdminReportService) private readonly reports: AdminReportService,
  ) {}

  @Get('users')
  users(): Promise<unknown> {
    return this.queries.users();
  }

  @Get('companies')
  companies(): Promise<unknown> {
    return this.queries.companies();
  }

  @Get('projects')
  projects(@Query('status') raw?: string): Promise<unknown> {
    return this.queries.projects(inList(raw, PUBLICATION_STATUSES));
  }

  @Get('partners')
  partners(@Query('type') raw?: string): Promise<unknown> {
    return this.queries.partners(inList(raw, PARTNER_TYPES));
  }

  @Get('partners/options')
  partnerOptions(): Promise<unknown> {
    return this.queries.partnerOptions();
  }

  @Get('partners/:id')
  partner(@Param('id') id: string): Promise<unknown> {
    return this.queries.partner(id);
  }

  @Get('settings')
  settings(): Promise<unknown> {
    return this.queries.settings();
  }

  @Get('audit')
  audit(@Query('entityType') raw?: string): Promise<unknown> {
    return this.queries.audit(inList(raw, AUDIT_ENTITY_TYPES));
  }

  @Get('integrations')
  integrations(): Promise<unknown> {
    return this.queries.integrations();
  }

  @Get('exhibition/events')
  exhibitionEvents(): Promise<unknown> {
    return this.queries.exhibitionEvents();
  }

  @Get('exhibition/check-ins')
  checkIns(@Query('eventId') eventId?: string): Promise<unknown> {
    return this.queries.recentCheckIns(eventId);
  }

  @Get('readiness/categories')
  categories(@Query('activeOnly') activeOnly?: string): Promise<unknown> {
    return this.queries.categories(activeOnly === 'true');
  }

  @Get('readiness/company-options')
  companyOptions(): Promise<unknown> {
    return this.queries.companyOptions();
  }

  @Get('readiness/project-options')
  projectOptions(): Promise<unknown> {
    return this.queries.projectOptions();
  }

  @Get('readiness/assessments')
  assessments(@Query('targetType') raw?: string): Promise<unknown> {
    return this.queries.assessments(inList(raw, READINESS_TARGET_TYPES));
  }

  @Get('readiness/assessments/:id')
  assessment(@Param('id') id: string): Promise<unknown> {
    return this.queries.assessment(id);
  }

  @Get('analytics')
  analytics(): Promise<unknown> {
    return this.queries.analytics();
  }

  @Post('commands/:operation')
  execute(
    @Param('operation') operation: string,
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ): Promise<unknown> {
    const user = request.authSession!.user;
    return this.mutations.execute(operation, body, {
      userId: user.id,
      role: user.role as PlatformRole,
    });
  }

  @Get('reports/:report')
  async report(
    @Param('report') raw: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    if (!ADMIN_REPORT_NAMES.includes(raw as AdminReportName)) {
      throw new NotFoundException();
    }
    const report = raw as AdminReportName;
    response.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="toonexpo-${report}.csv"`,
      'Cache-Control': 'no-store',
    });
    return this.reports.build(report);
  }
}

function inList<T extends string>(raw: string | undefined, values: readonly T[]): T | undefined {
  return raw && values.includes(raw as T) ? (raw as T) : undefined;
}
