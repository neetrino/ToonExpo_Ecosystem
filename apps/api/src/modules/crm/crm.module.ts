import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BuilderModule } from '../builder/builder.module';
import { CrmController } from './crm.controller';
import { CrmQueryService } from './crm-query.service';

@Module({
  imports: [AuthModule, BuilderModule],
  controllers: [CrmController],
  providers: [CrmQueryService],
})
export class CrmModule {}
