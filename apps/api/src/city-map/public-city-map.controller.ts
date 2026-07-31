import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicCityMapConfig, PublicCityMapPlacementsResponse } from '@toonexpo/contracts';

import { Public } from '../auth/decorators/public.decorator.js';
import { CityMapService } from './city-map.service.js';

@ApiTags('public-city-map')
@Controller('public/city-map')
export class PublicCityMapController {
  constructor(private readonly cityMap: CityMapService) {}

  @Public()
  @Get('placements')
  @ApiOperation({ summary: 'List published city map placements' })
  @ApiOkResponse({ description: 'Published placements' })
  list(): Promise<PublicCityMapPlacementsResponse> {
    return this.cityMap.listPublic();
  }

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Public city map camera/style config' })
  @ApiOkResponse({ description: 'Map config' })
  config(): PublicCityMapConfig {
    return this.cityMap.getPublicConfig();
  }
}
