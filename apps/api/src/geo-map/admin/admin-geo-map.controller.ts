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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AdminGeoMapModelItem, AdminGeoMapModelListResponse } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { AdminGeoMapService } from './admin-geo-map.service.js';
import {
  CreateGeoMapModelDto,
  GeoMapModelIdParamDto,
  UpdateGeoMapModelDto,
} from './dto/admin-geo-map.dto.js';

@ApiTags('admin-geo-map')
@AccountTypes('platform_admin')
@Controller('admin/geo-map/models')
export class AdminGeoMapController {
  constructor(private readonly geoMap: AdminGeoMapService) {}

  @Get()
  @ApiOperation({ summary: 'List all project geo map models' })
  @ApiOkResponse({ description: 'Geo map model list' })
  list(): Promise<AdminGeoMapModelListResponse> {
    return this.geoMap.list();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a project geo map model' })
  @ApiCreatedResponse({ description: 'Created geo map model' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateGeoMapModelDto,
  ): Promise<AdminGeoMapModelItem> {
    return this.geoMap.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project geo map model' })
  @ApiOkResponse({ description: 'Updated geo map model' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: GeoMapModelIdParamDto,
    @Body() body: UpdateGeoMapModelDto,
  ): Promise<AdminGeoMapModelItem> {
    return this.geoMap.update(params.id, user.id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project geo map model' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(@Param() params: GeoMapModelIdParamDto): Promise<void> {
    await this.geoMap.remove(params.id);
  }
}
