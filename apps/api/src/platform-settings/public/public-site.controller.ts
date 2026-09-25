import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicHomeHero, PublicSitePagesResponse } from '@toonexpo/contracts';

import { Public } from '../../auth/decorators/public.decorator.js';
import { PlatformSettingsService } from '../platform-settings.service.js';

@ApiTags('site')
@Controller('site')
export class PublicSiteController {
  constructor(private readonly platformSettings: PlatformSettingsService) {}

  @Public()
  @Get('home-hero')
  @ApiOperation({ summary: 'Public home hero banners and optional headline copy' })
  @ApiOkResponse({ description: 'Home hero media reference' })
  getHomeHero(): Promise<PublicHomeHero> {
    return this.platformSettings.getPublicHomeHero();
  }

  @Public()
  @Get('public-pages')
  @ApiOperation({ summary: 'Which public marketing pages are visible' })
  @ApiOkResponse({ description: 'Public page visibility map' })
  getPublicPages(): Promise<PublicSitePagesResponse> {
    return this.platformSettings.getPublicSitePages();
  }
}
