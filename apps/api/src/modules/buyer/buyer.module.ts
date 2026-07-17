import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';

@Module({
  imports: [AuthModule],
  controllers: [BuyerController],
  providers: [BuyerService],
})
export class BuyerModule {}
