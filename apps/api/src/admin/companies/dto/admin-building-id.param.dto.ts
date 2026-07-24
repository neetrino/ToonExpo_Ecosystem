import { IsString, MinLength } from 'class-validator';

/**
 * Path param for admin building inventory routes.
 */
export class AdminBuildingIdParamDto {
  @IsString()
  @MinLength(1)
  buildingId!: string;
}
