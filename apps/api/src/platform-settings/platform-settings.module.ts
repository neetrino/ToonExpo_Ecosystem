import { Module } from '@nestjs/common';

import { WebRevalidationModule } from '../common/web-revalidation/web-revalidation.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminSiteController } from './admin/admin-site.controller.js';
import { PlatformSettingsService } from './platform-settings.service.js';
import { PublicSiteController } from './public/public-site.controller.js';

@Module({
  imports: [PrismaModule, WebRevalidationModule],
  controllers: [PublicSiteController, AdminSiteController],
  providers: [PlatformSettingsService],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
