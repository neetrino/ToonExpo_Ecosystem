import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { VisualMapBuilderService } from './visual-map-builder.service';
import { VisualMapPublicService } from './visual-map-public.service';

@ApiTags('visual-map')
@ApiCookieAuth()
@Controller('visual-map')
@UseGuards(AppOriginGuard)
export class VisualMapController {
  constructor(
    private readonly publicMaps: VisualMapPublicService,
    private readonly builderMaps: VisualMapBuilderService,
  ) {}

  @Get('public')
  publicCanvas(
    @Query('projectId') projectId?: string,
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
  ) {
    return this.publicMaps.get({ projectId, buildingId, floorId });
  }

  @Get('builder/projects/:projectId')
  @UseGuards(SessionAuthGuard)
  list(
    @Param('projectId') projectId: string,
    @Query('companyId') companyId: string,
    @Req() request: RequestWithAuth,
  ) {
    return this.builderMaps.list(requireBuilder(request), companyId, projectId);
  }

  @Get('builder/canvases/:canvasId')
  @UseGuards(SessionAuthGuard)
  detail(
    @Param('canvasId') canvasId: string,
    @Query('companyId') companyId: string,
    @Req() request: RequestWithAuth,
  ) {
    return this.builderMaps.detail(requireBuilder(request), companyId, canvasId);
  }

  @Get('builder/canvases/:canvasId/archived-hotspots')
  @UseGuards(SessionAuthGuard)
  archived(
    @Param('canvasId') canvasId: string,
    @Query('companyId') companyId: string,
    @Req() request: RequestWithAuth,
  ) {
    return this.builderMaps.archived(requireBuilder(request), companyId, canvasId);
  }

  @Post('builder/actions/:action')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  mutate(
    @Param('action') action: string,
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ) {
    const companyId = readField(body, 'companyId');
    const input = readObjectField(body, 'input');
    return this.builderMaps.mutate(requireBuilder(request), companyId, action, input);
  }
}

function requireBuilder(request: RequestWithAuth): string {
  if (request.authSession?.user.role !== 'BUILDER') {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession.user.id;
}

function readField(body: unknown, key: string): string {
  if (!body || typeof body !== 'object' || !(key in body)) {
    return '';
  }
  const value = body[key as keyof typeof body];
  return typeof value === 'string' ? value : '';
}

function readObjectField(body: unknown, key: string): unknown {
  if (!body || typeof body !== 'object' || !(key in body)) {
    return undefined;
  }
  return body[key as keyof typeof body];
}
