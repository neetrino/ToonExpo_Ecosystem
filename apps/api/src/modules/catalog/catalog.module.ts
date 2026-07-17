import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CatalogBuildersService } from './catalog-builders.service';
import { CatalogController } from './catalog.controller';
import { CatalogPartnersService } from './catalog-partners.service';
import { CatalogProjectsService } from './catalog-projects.service';
import { CatalogSettingsService } from './catalog-settings.service';

@Module({
  imports: [AuthModule],
  controllers: [CatalogController],
  providers: [
    CatalogProjectsService,
    CatalogBuildersService,
    CatalogPartnersService,
    CatalogSettingsService,
  ],
})
export class CatalogModule {}
