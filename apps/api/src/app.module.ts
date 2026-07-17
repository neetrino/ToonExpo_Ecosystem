import { Module } from '@nestjs/common';

import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, UploadsModule, IntegrationsModule],
})
export class AppModule {}
