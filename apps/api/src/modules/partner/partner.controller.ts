import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { PartnerService } from './partner.service';

@ApiTags('partner')
@ApiCookieAuth()
@Controller('partner')
@UseGuards(AppOriginGuard, SessionAuthGuard)
export class PartnerController {
  constructor(private readonly partner: PartnerService) {}

  @Get('context')
  context(@Req() request: RequestWithAuth) {
    return this.partner.context(requirePartnerSession(request));
  }

  @Get('detail')
  detail(@Req() request: RequestWithAuth) {
    return this.partner.detail(requirePartnerSession(request).user.id);
  }

  @Patch('profile')
  @UseGuards(CsrfGuard)
  updateProfile(@Body() body: unknown, @Req() request: RequestWithAuth) {
    return this.partner.updateProfile(requirePartnerSession(request).user.id, body);
  }

  @Post('bank-offers')
  @UseGuards(CsrfGuard)
  createOffer(@Body() body: unknown, @Req() request: RequestWithAuth) {
    return this.partner.createOffer(requirePartnerSession(request).user.id, body);
  }

  @Patch('bank-offers/:offerId')
  @UseGuards(CsrfGuard)
  updateOffer(
    @Param('offerId') offerId: string,
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ) {
    return this.partner.updateOffer(requirePartnerSession(request).user.id, offerId, body);
  }
}

function requirePartnerSession(request: RequestWithAuth) {
  if (request.authSession?.user.role !== 'PARTNER') {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession;
}
