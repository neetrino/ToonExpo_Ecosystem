import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { VisualMapBuilderService } from './visual-map-builder.service';
import { VisualMapPublicService } from './visual-map-public.service';
import { VisualMapController } from './visual-map.controller';

@Module({
  imports: [AuthModule],
  controllers: [VisualMapController],
  providers: [VisualMapBuilderService, VisualMapPublicService],
})
export class VisualMapModule {}
