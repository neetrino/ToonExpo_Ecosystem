import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminCatalogCompanyParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  companyId!: string;
}

export class AdminCatalogProjectParamDto extends AdminCatalogCompanyParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  projectId!: string;
}

export class AdminCatalogBuildingParamDto extends AdminCatalogCompanyParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  buildingId!: string;
}

export class AdminCatalogFloorParamDto extends AdminCatalogCompanyParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  floorId!: string;
}

export class AdminCatalogApartmentParamDto extends AdminCatalogCompanyParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  apartmentId!: string;
}

export class AdminCatalogCanvasParamDto extends AdminCatalogCompanyParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  id!: string;
}

export class AdminCatalogHotspotParamDto extends AdminCatalogCanvasParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  hotspotId!: string;
}
