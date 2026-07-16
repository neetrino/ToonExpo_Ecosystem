import { Module } from '@nestjs/common';

import { PrismaService } from '../../common/prisma.service';

import { BosApiKeyGuard } from './bos/bos-api-key.guard';
import { BosProvisioningController } from './bos/bos-provisioning.controller';
import { BosProvisioningService } from './bos/bos-provisioning.service';

@Module({
  controllers: [BosProvisioningController],
  providers: [PrismaService, BosProvisioningService, BosApiKeyGuard],
})
export class IntegrationsModule {}
