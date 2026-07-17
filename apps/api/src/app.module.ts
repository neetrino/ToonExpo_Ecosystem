import { Module } from '@nestjs/common';

import { PrismaModule } from './common/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { BuilderModule } from './modules/builder/builder.module';
import { BuyerModule } from './modules/buyer/buyer.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CrmModule } from './modules/crm/crm.module';
import { ExhibitionModule } from './modules/exhibition/exhibition.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { PartnerModule } from './modules/partner/partner.module';
import { QrModule } from './modules/qr/qr.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { VisualMapModule } from './modules/visual-map/visual-map.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    AnalyticsModule,
    HealthModule,
    AuthModule,
    BuilderModule,
    BuyerModule,
    CatalogModule,
    CrmModule,
    ExhibitionModule,
    FavoritesModule,
    PartnerModule,
    QrModule,
    UploadsModule,
    IntegrationsModule,
    VisualMapModule,
  ],
})
export class AppModule {}
