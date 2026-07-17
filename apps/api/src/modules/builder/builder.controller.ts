import { BuilderCatalogPathService } from './builder-catalog-path.service';
import {
  Body,
  Controller,
  Delete,
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
  apartmentUpsertInputSchema,
  buildingCreateInputSchema,
  buildingPublicationInputSchema,
  buildingUpdateInputSchema,
  companyProfileUpdateInputSchema,
  floorCreateInputSchema,
  floorPublicationInputSchema,
  floorUpdateInputSchema,
  mediaAssetIdInputSchema,
  mediaAssetUpsertInputSchema,
  projectPublicationInputSchema,
  projectUpsertInputSchema,
} from '@toonexpo/contracts';
import { z } from 'zod';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { BuilderAnalyticsService } from './builder-analytics.service';
import { actor, parse, requireSession, single, throwInvalid } from './builder-controller.helpers';
import {
  ACTIVE_COMPANY_COOKIE,
  type BuilderContext,
  BuilderContextService,
} from './builder-context.service';
import { BuilderInventoryService } from './builder-inventory.service';
import { BuilderMediaService } from './builder-media.service';
import { BuilderProjectService } from './builder-project.service';
import { BuilderQueryService } from './builder-query.service';

@ApiTags('builder')
@ApiCookieAuth()
@Controller('builder')
@UseGuards(AppOriginGuard, SessionAuthGuard, CsrfGuard)
export class BuilderController {
  constructor(
    private readonly contexts: BuilderContextService,
    private readonly queries: BuilderQueryService,
    private readonly projectsService: BuilderProjectService,
    private readonly inventory: BuilderInventoryService,
    private readonly media: BuilderMediaService,
    private readonly catalogPaths: BuilderCatalogPathService,
    private readonly analyticsService: BuilderAnalyticsService,
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
    return this.analyticsService.load(context.companyId);
  }

  @Get('catalog-paths')
  async resolveCatalogPaths(
    @Req() request: RequestWithAuth,
    @Query() query: Record<string, string | string[] | undefined>,
  ) {
    const context = await this.requireContext(request);
    const projectIds = query.projectIds;
    if (projectIds) {
      const ids = Array.isArray(projectIds) ? projectIds : [projectIds];
      return this.catalogPaths.projects(context.companyId, ids);
    }
    return this.catalogPaths.resolve(context.companyId, {
      projectId: single(query.projectId),
      buildingId: single(query.buildingId),
      floorId: single(query.floorId),
      apartmentId: single(query.apartmentId),
      mediaAssetId: single(query.mediaAssetId),
    });
  }

  @Get('catalog-paths/admin/:projectId')
  catalogPathAdmin(@Req() request: RequestWithAuth, @Param('projectId') projectId: string) {
    const session = requireSession(request);
    if (session.user.role !== 'BIGPROJECTS_ADMIN') {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }
    return this.catalogPaths.admin(projectId);
  }

  @Post('company/select')
  async selectCompany(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const parsed = z
      .object({
        companyId: z.string().trim().min(1).max(64),
        auditStart: z.boolean().optional(),
      })
      .safeParse(body);
    if (!parsed.success) throwInvalid();
    const session = requireSession(request);
    const result = await this.contexts.select(session, parsed.data.companyId, parsed.data.auditStart === true);
    if (result === 'notFound') {
      throw new HttpException({ error: 'notFound' }, HttpStatus.NOT_FOUND);
    }
    if (result === 'unauthorized') {
      throw new UnauthorizedException({ error: 'unauthorized' });
    }
    return { ok: true };
  }

  @Post('company/stop-acting')
  async stopActing(@Req() request: RequestWithAuth) {
    const session = requireSession(request);
    const raw = request.cookies?.[ACTIVE_COMPANY_COOKIE];
    await this.contexts.stopActing(session, typeof raw === 'string' ? raw : undefined);
    return { ok: true };
  }

  @Patch('company/profile')
  async updateProfile(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(companyProfileUpdateInputSchema, body);
    return this.media.updateCompany((await this.requireContext(request)).companyId, input);
  }

  @Post('projects')
  async createProject(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(projectUpsertInputSchema, body);
    if (input.projectId) throwInvalid();
    return this.projectsService.create((await this.requireContext(request)).companyId, input);
  }

  @Patch('projects')
  async updateProject(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(projectUpsertInputSchema, body);
    if (!input.projectId) throwInvalid();
    return this.projectsService.update((await this.requireContext(request)).companyId, {
      ...input,
      projectId: input.projectId,
    });
  }

  @Patch('projects/publication')
  async publishProject(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(projectPublicationInputSchema, body);
    const context = await this.requireContext(request);
    return this.projectsService.publish(context.companyId, input, actor(context));
  }

  @Post('buildings')
  async createBuilding(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(buildingCreateInputSchema, body);
    return this.inventory.createBuilding((await this.requireContext(request)).companyId, input);
  }

  @Patch('buildings')
  async updateBuilding(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(buildingUpdateInputSchema, body);
    return this.inventory.updateBuilding((await this.requireContext(request)).companyId, input);
  }

  @Patch('buildings/publication')
  async publishBuilding(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(buildingPublicationInputSchema, body);
    const context = await this.requireContext(request);
    return this.inventory.publishBuilding(context.companyId, input, actor(context));
  }

  @Post('floors')
  async createFloor(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(floorCreateInputSchema, body);
    return this.inventory.createFloor((await this.requireContext(request)).companyId, input);
  }

  @Patch('floors')
  async updateFloor(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(floorUpdateInputSchema, body);
    return this.inventory.updateFloor((await this.requireContext(request)).companyId, input);
  }

  @Patch('floors/publication')
  async publishFloor(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(floorPublicationInputSchema, body);
    const context = await this.requireContext(request);
    return this.inventory.publishFloor(context.companyId, input, actor(context));
  }

  @Post('apartments/upsert')
  async upsertApartment(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(apartmentUpsertInputSchema, body);
    const context = await this.requireContext(request);
    return this.inventory.upsertApartment(context.companyId, input, context.session.user.id);
  }

  @Post('media')
  async addMedia(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(mediaAssetUpsertInputSchema, body);
    if (input.mediaAssetId) throwInvalid();
    return this.media.add((await this.requireContext(request)).companyId, input);
  }

  @Patch('media')
  async updateMedia(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(mediaAssetUpsertInputSchema, body);
    if (!input.mediaAssetId) throwInvalid();
    return this.media.update((await this.requireContext(request)).companyId, {
      ...input,
      mediaAssetId: input.mediaAssetId,
    });
  }

  @Delete('media')
  async deleteMedia(@Req() request: RequestWithAuth, @Body() body: unknown) {
    const input = parse(mediaAssetIdInputSchema, body);
    return this.media.remove((await this.requireContext(request)).companyId, input);
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
