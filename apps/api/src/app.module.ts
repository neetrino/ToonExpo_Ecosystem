import { Module } from '@nestjs/common';

import { PrismaModule } from './common/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [PrismaModule, HealthModule, IntegrationsModule],
})
export class AppModule {}
