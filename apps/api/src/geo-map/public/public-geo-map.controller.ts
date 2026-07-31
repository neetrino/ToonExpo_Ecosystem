import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicGeoMapModelListResponse } from '@toonexpo/contracts';

import { Public } from '../../auth/decorators/public.decorator.js';
import { PublicGeoMapService } from './public-geo-map.service.js';

/**
 * Public geo-map routes follow repo convention (no `/public` URL prefix);
 * access is gated by `@Public()` like mortgage/partners/exhibition.
 */
@ApiTags('geo-map')
@Controller('geo-map')
export class PublicGeoMapController {
  constructor(private readonly geoMap: PublicGeoMapService) {}

  @Public()
  @Get('models')
  @ApiOperation({ summary: 'List published project geo map models' })
  @ApiOkResponse({ description: 'Published geo map models' })
  list(): Promise<PublicGeoMapModelListResponse> {
    return this.geoMap.listPublished();
  }
}
