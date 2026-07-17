import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { UploadsModule } from '../uploads/uploads.module';
import { BuilderAnalyticsService } from './builder-analytics.service';
import { BuilderCatalogPathService } from './builder-catalog-path.service';
import { BuilderContextService } from './builder-context.service';
import { BuilderController } from './builder.controller';
import { BuilderInventoryService } from './builder-inventory.service';
import { BuilderMediaService } from './builder-media.service';
import { BuilderProjectService } from './builder-project.service';
import { BuilderQueryService } from './builder-query.service';

@Module({
  imports: [AuthModule, UploadsModule],
  controllers: [BuilderController],
  providers: [
    BuilderContextService,
    BuilderQueryService,
    BuilderProjectService,
    BuilderInventoryService,
    BuilderMediaService,
    BuilderCatalogPathService,
    BuilderAnalyticsService,
  ],
  exports: [BuilderContextService],
})
export class BuilderModule {}
