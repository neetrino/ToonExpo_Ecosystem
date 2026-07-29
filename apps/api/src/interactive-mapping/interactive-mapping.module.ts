import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { InteractiveMappingController } from './interactive-mapping.controller.js';
import { InteractiveMappingService } from './interactive-mapping.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [InteractiveMappingController],
  providers: [InteractiveMappingService],
})
export class InteractiveMappingModule {}
