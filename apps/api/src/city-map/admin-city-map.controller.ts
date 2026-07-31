import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CityMapBuildingOptionsResponse,
  CityMapPlacementItem,
  CityMapPlacementListResponse,
} from '@toonexpo/contracts';
import { PublicationStatus } from '@toonexpo/db';

import { AccountTypes } from '../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { CityMapService } from './city-map.service.js';
import {
  CityMapBuildingOptionsQueryDto,
  CreateCityMapPlacementDto,
  ListCityMapPlacementsQueryDto,
  UpdateCityMapPlacementDto,
} from './dto/city-map.dto.js';

@ApiTags('admin-city-map')
@AccountTypes('platform_admin')
@Controller('admin/city-map')
export class AdminCityMapController {
  constructor(private readonly cityMap: CityMapService) {}

  @Get('placements')
  @ApiOperation({ summary: 'List city map placements' })
  @ApiOkResponse({ description: 'Placement list' })
  list(@Query() query: ListCityMapPlacementsQueryDto): Promise<CityMapPlacementListResponse> {
    return this.cityMap.listAdmin({
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.projectId !== undefined ? { projectId: query.projectId } : {}),
      ...(query.q !== undefined ? { q: query.q } : {}),
    });
  }

  @Get('building-options')
  @ApiOperation({ summary: 'Search buildings for placement linking' })
  @ApiOkResponse({ description: 'Building options' })
  buildingOptions(
    @Query() query: CityMapBuildingOptionsQueryDto,
  ): Promise<CityMapBuildingOptionsResponse> {
    return this.cityMap.buildingOptions(query.q);
  }

  @Get('placements/:id')
  @ApiOperation({ summary: 'Get city map placement detail' })
  @ApiOkResponse({ description: 'Placement detail' })
  getById(@Param('id') id: string): Promise<CityMapPlacementItem> {
    return this.cityMap.getById(id);
  }

  @Post('placements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create city map placement' })
  @ApiCreatedResponse({ description: 'Created placement' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCityMapPlacementDto,
  ): Promise<CityMapPlacementItem> {
    return this.cityMap.create(user.id, body);
  }

  @Patch('placements/:id')
  @ApiOperation({ summary: 'Update city map placement' })
  @ApiOkResponse({ description: 'Updated placement' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateCityMapPlacementDto,
  ): Promise<CityMapPlacementItem> {
    return this.cityMap.update(user.id, id, body);
  }

  @Delete('placements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete city map placement' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.cityMap.delete(id);
  }

  @Post('placements/:id/publish')
  @ApiOperation({ summary: 'Publish city map placement' })
  @ApiOkResponse({ description: 'Published placement' })
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<CityMapPlacementItem> {
    return this.cityMap.setPublicationStatus(user.id, id, PublicationStatus.published);
  }

  @Post('placements/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish city map placement to draft' })
  @ApiOkResponse({ description: 'Unpublished placement' })
  unpublish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<CityMapPlacementItem> {
    return this.cityMap.setPublicationStatus(user.id, id, PublicationStatus.draft);
  }
}
