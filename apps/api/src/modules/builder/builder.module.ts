import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BuilderContextService } from './builder-context.service';
import { BuilderController } from './builder.controller';
import { BuilderQueryService } from './builder-query.service';

@Module({
  imports: [AuthModule],
  controllers: [BuilderController],
  providers: [BuilderContextService, BuilderQueryService],
  exports: [BuilderContextService],
})
export class BuilderModule {}
