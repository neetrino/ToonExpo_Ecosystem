import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ExhibitionController } from './exhibition.controller';
import { ExhibitionPathService } from './exhibition-path.service';
import { ExhibitionService } from './exhibition.service';

@Module({
  imports: [AuthModule],
  controllers: [ExhibitionController],
  providers: [ExhibitionPathService, ExhibitionService],
})
export class ExhibitionModule {}
