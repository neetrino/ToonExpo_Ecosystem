import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminGeoMapController } from './admin/admin-geo-map.controller.js';
import { AdminGeoMapService } from './admin/admin-geo-map.service.js';
import { PublicGeoMapController } from './public/public-geo-map.controller.js';
import { PublicGeoMapService } from './public/public-geo-map.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminGeoMapController, PublicGeoMapController],
  providers: [AdminGeoMapService, PublicGeoMapService],
})
export class GeoMapModule {}
