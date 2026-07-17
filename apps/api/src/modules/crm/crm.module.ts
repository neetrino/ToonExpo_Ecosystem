import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BuilderModule } from '../builder/builder.module';
import { CrmController } from './crm.controller';
import { CrmMutationService } from './crm-mutation.service';
import { CrmQueryService } from './crm-query.service';
import { PublicRequestController } from './public-request.controller';
import { PublicRequestService } from './public-request.service';

@Module({
  imports: [AuthModule, BuilderModule],
  controllers: [CrmController, PublicRequestController],
  providers: [CrmQueryService, CrmMutationService, PublicRequestService],
})
export class CrmModule {}
