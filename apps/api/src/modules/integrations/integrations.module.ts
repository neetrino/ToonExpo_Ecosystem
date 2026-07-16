import { Module } from '@nestjs/common';

import { BosApiKeyGuard } from './bos/bos-api-key.guard';
import { BosProvisioningController } from './bos/bos-provisioning.controller';
import { BosProvisioningService } from './bos/bos-provisioning.service';

@Module({
  controllers: [BosProvisioningController],
  providers: [BosProvisioningService, BosApiKeyGuard],
})
export class IntegrationsModule {}
