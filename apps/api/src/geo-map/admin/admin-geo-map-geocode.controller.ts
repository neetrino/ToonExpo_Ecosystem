import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { GeoMapGeocodeResponse } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { AdminGeoMapGeocodeService } from './admin-geo-map-geocode.service.js';
import { GeocodeGeoMapQueryDto } from './dto/geocode-geo-map.query.dto.js';

@ApiTags('admin-geo-map')
@AccountTypes('platform_admin')
@Controller('admin/geo-map')
export class AdminGeoMapGeocodeController {
  constructor(private readonly geocodeService: AdminGeoMapGeocodeService) {}

  @Get('geocode')
  @ApiOperation({ summary: 'Look up an address to fly the admin 3D map camera' })
  @ApiOkResponse({ description: 'Geocoded longitude/latitude' })
  geocode(@Query() query: GeocodeGeoMapQueryDto): Promise<GeoMapGeocodeResponse> {
    return this.geocodeService.geocode(query.q);
  }
}
