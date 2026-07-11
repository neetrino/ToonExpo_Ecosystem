import { Module } from '@nestjs/common';

import { PrismaService } from './common/prisma.service';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [HealthModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
