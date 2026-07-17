import { Module } from '@nestjs/common';

import { PrismaModule } from './common/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BuilderModule } from './modules/builder/builder.module';
import { BuyerModule } from './modules/buyer/buyer.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CrmModule } from './modules/crm/crm.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    HealthModule,
    AuthModule,
    BuilderModule,
    BuyerModule,
    CatalogModule,
    CrmModule,
    FavoritesModule,
    UploadsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
