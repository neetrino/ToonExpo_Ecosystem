import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminCityMapController } from './admin-city-map.controller.js';
import { CityMapService } from './city-map.service.js';
import { PublicCityMapController } from './public-city-map.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminCityMapController, PublicCityMapController],
  providers: [CityMapService],
  exports: [CityMapService],
})
export class CityMapModule {}
