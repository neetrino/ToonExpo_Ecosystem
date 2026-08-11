import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AdminHomeHero } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { PlatformSettingsService } from '../platform-settings.service.js';
import { UpdateHomeHeroDto } from './dto/update-home-hero.dto.js';

@ApiTags('admin-site')
@AccountTypes('platform_admin')
@Controller('admin/site')
export class AdminSiteController {
  constructor(private readonly platformSettings: PlatformSettingsService) {}

  @Get('home-hero')
  @ApiOperation({ summary: 'Get configured home hero banner for admin edit' })
  @ApiOkResponse({ description: 'Admin home hero payload' })
  getHomeHero(): Promise<AdminHomeHero> {
    return this.platformSettings.getAdminHomeHero();
  }

  @Patch('home-hero')
  @ApiOperation({ summary: 'Set or clear the public home hero banner slides' })
  @ApiOkResponse({ description: 'Updated home hero payload' })
  updateHomeHero(
    @Body() body: UpdateHomeHeroDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdminHomeHero> {
    return this.platformSettings.updateHomeHero(body.mediaAssetIds, user.id);
  }
}
