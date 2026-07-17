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
import { type ExhibitionService } from './exhibition.service';

@ApiTags('exhibition')
@ApiCookieAuth()
@Controller('exhibition')
@UseGuards(AppOriginGuard)
export class ExhibitionController {
  constructor(private readonly exhibition: ExhibitionService) {}

  @Get('active')
  activeEvent() {
    return this.exhibition.activeEvent();
  }

  @Get('venue')
  publicVenue() {
    return this.exhibition.publicVenue();
  }

  @Get('venue/exists')
  async hasPublicVenue() {
    return { exists: await this.exhibition.hasPublicVenue() };
  }

  @Get('check-ins')
  @UseGuards(SessionAuthGuard)
  buyerCheckIns(@Req() request: RequestWithAuth) {
    return this.exhibition.buyerCheckIns(requireRole(request, 'BUYER'));
  }

  @Get('company-booth')
  @UseGuards(SessionAuthGuard)
  companyBooth(
    @Query('companyId') companyId: string,
    @Req() request: RequestWithAuth,
  ) {
    return this.exhibition.companyBooth(requireRole(request, 'BUILDER'), companyId);
  }

  @Get('admin/events/:eventId/venue')
  @UseGuards(SessionAuthGuard)
  adminVenue(@Param('eventId') eventId: string, @Req() request: RequestWithAuth) {
    requireRole(request, 'BIGPROJECTS_ADMIN');
    return this.exhibition.adminVenue(eventId);
  }

  @Get('admin/assignment-options')
  @UseGuards(SessionAuthGuard)
  assignmentOptions(@Req() request: RequestWithAuth) {
    requireRole(request, 'BIGPROJECTS_ADMIN');
    return this.exhibition.assignmentOptions();
  }

  @Post('admin/venue/:action')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  mutate(
    @Param('action') action: string,
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ) {
    requireRole(request, 'BIGPROJECTS_ADMIN');
    return this.exhibition.mutate(action, body);
  }
}

function requireRole(
  request: RequestWithAuth,
  role: 'BUYER' | 'BUILDER' | 'BIGPROJECTS_ADMIN',
): string {
  if (request.authSession?.user.role !== role) {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession.user.id;
}
