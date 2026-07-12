import { Module } from '@nestjs/common';

import { PrismaService } from './common/prisma.service';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [HealthModule, IntegrationsModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
