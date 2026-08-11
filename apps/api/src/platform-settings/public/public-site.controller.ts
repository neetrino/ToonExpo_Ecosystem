import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicHomeHero } from '@toonexpo/contracts';

import { Public } from '../../auth/decorators/public.decorator.js';
import { PlatformSettingsService } from '../platform-settings.service.js';

@ApiTags('site')
@Controller('site')
export class PublicSiteController {
  constructor(private readonly platformSettings: PlatformSettingsService) {}

  @Public()
  @Get('home-hero')
  @ApiOperation({ summary: 'Public home hero banner image (null = use default asset)' })
  @ApiOkResponse({ description: 'Home hero media reference' })
  getHomeHero(): Promise<PublicHomeHero> {
    return this.platformSettings.getPublicHomeHero();
  }
}
