import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminGeoMapController } from './admin/admin-geo-map.controller.js';
import { AdminGeoMapGeocodeController } from './admin/admin-geo-map-geocode.controller.js';
import { AdminGeoMapGeocodeService } from './admin/admin-geo-map-geocode.service.js';
import { AdminGeoMapService } from './admin/admin-geo-map.service.js';
import { PublicGeoMapController } from './public/public-geo-map.controller.js';
import { PublicGeoMapService } from './public/public-geo-map.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminGeoMapController, AdminGeoMapGeocodeController, PublicGeoMapController],
  providers: [AdminGeoMapService, AdminGeoMapGeocodeService, PublicGeoMapService],
})
export class GeoMapModule {}
